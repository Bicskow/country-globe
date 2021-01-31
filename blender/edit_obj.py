import bpy
import bmesh
import os
import time


def triangulate_object(obj):
    me = obj.data
    # Get a BMesh representation
    bm = bmesh.new()
    bm.from_mesh(me)

    bmesh.ops.triangulate(bm, faces=bm.faces[:])

    # Finish up, write the bmesh back to the mesh
    bm.to_mesh(me)
    bm.free()

def setClipStart():
    for oWindow in bpy.context.window_manager.windows:          ###IMPROVE: Find way to avoid doing four levels of traversals at every request!!
        oScreen = oWindow.screen
        for oArea in oScreen.areas:
            if oArea.type == 'VIEW_3D':      
                oArea.spaces.active.clip_start = 0.01

def setZoom(value):
    oContextOverride = AssembleOverrideContextForView3dOps() 
    currentZoom = getZoom()
    while currentZoom < value:
        bpy.ops.view3d.zoom(oContextOverride, delta=-1)
        currentZoom = getZoom()
    while currentZoom > value:
        bpy.ops.view3d.zoom(oContextOverride, delta=+1)
        currentZoom = getZoom()
        

def getZoom():
    for oWindow in bpy.context.window_manager.windows:          ###IMPROVE: Find way to avoid doing four levels of traversals at every request!!
        oScreen = oWindow.screen
        for oArea in oScreen.areas:
            if oArea.type == 'VIEW_3D':      
                return oArea.spaces.active.region_3d.view_distance
            
def isPerspective():
    for oWindow in bpy.context.window_manager.windows:          ###IMPROVE: Find way to avoid doing four levels of traversals at every request!!
        oScreen = oWindow.screen
        for oArea in oScreen.areas:
            if oArea.type == 'VIEW_3D':      
                print(oArea.spaces.active.region_3d.is_perspective)
                return oArea.spaces.active.region_3d.is_perspective

def AssembleOverrideContextForView3dOps():
    #=== Iterates through the blender GUI's windows, screens, areas, regions to find the View3D space and its associated window.  Populate an 'oContextOverride context' that can be used with bpy.ops that require to be used from within a View3D (like most addon code that runs of View3D panels)
    # Tip: If your operator fails the log will show an "PyContext: 'xyz' not found".  To fix stuff 'xyz' into the override context and try again!
    for oWindow in bpy.context.window_manager.windows:          ###IMPROVE: Find way to avoid doing four levels of traversals at every request!!
        oScreen = oWindow.screen
        for oArea in oScreen.areas:
            if oArea.type == 'VIEW_3D':                         ###LEARN: Frequently, bpy.ops operators are called from View3d's toolbox or property panel.  By finding that window/screen/area we can fool operators in thinking they were called from the View3D!
                for oRegion in oArea.regions:
                    if oRegion.type == 'WINDOW':                ###LEARN: View3D has several 'windows' like 'HEADER' and 'WINDOW'.  Most bpy.ops require 'WINDOW'
                        #=== Now that we've (finally!) found the damn View3D stuff all that into a dictionary bpy.ops operators can accept to specify their context.  I stuffed extra info in there like selected objects, active objects, etc as most operators require them.  (If anything is missing operator will fail and log a 'PyContext: error on the log with what is missing in context override) ===
                        oContextOverride = {'window': oWindow, 'screen': oScreen, 'area': oArea, 'region': oRegion, 'scene': bpy.context.scene, 'edit_object': bpy.context.edit_object, 'active_object': bpy.context.active_object, 'selected_objects': bpy.context.selected_objects}   # Stuff the override context with very common requests by operators.  MORE COULD BE NEEDED!
                        #print("-AssembleOverrideContextForView3dOps() created override context: ", oContextOverride)
                        return oContextOverride
        raise Exception("ERROR: AssembleOverrideContextForView3dOps() could not find a VIEW_3D with WINDOW region to create override context to enable View3D operators.  Operator cannot function.")




def generateObjFile(file_name, file_loc, folder_name):
    print("---------------------------------------------------------------------------------------")
    # Deselect all
    bpy.context.view_layer.objects.active = bpy.data.objects[0]
    bpy.ops.object.mode_set(mode='OBJECT', toggle=False)
    bpy.ops.object.select_all(action='DESELECT')

    #print(bpy.data.objects)

    for key, value in bpy.data.objects.items():
        #print(key)
        if key != "Ligth" and key != "Camera":
            bpy.data.objects[key].select_set(True)
            bpy.ops.object.delete() 
                    

    imported_object = bpy.ops.import_scene.obj(filepath=file_loc + file_name)

    setClipStart()

    for obj_object in bpy.context.selected_objects:
        print('Imported name: ', obj_object.name)
        
        if not obj_object.name.startswith("24_" and False):
            continue
           
        sphere_name = obj_object.name + "_sphere"
        bpyscene = bpy.context.scene
        # Create an empty object.
        mesh = bpy.data.meshes.new(sphere_name)
        basic_cube = bpy.data.objects.new(sphere_name, mesh)

        # Add the object into the scene.
        bpyscene.collection.objects.link(basic_cube)
        bpy.context.view_layer.objects.active = basic_cube
        basic_cube.select_set(True)
        bm = bmesh.new()
        bmesh.ops.create_uvsphere(bm, u_segments=200, v_segments=200, diameter=5.0)
        bm.to_mesh(mesh)
        bm.free()
        bpy.ops.object.shade_smooth()
        
        #return
        

        bpy.ops.object.mode_set(mode='OBJECT', toggle=False)
        bpy.ops.object.select_all(action='DESELECT')

        bpy.context.view_layer.objects.active = bpy.data.objects[obj_object.name]
        bpy.ops.object.mode_set(mode='EDIT', toggle=False)
        oContextOverride = AssembleOverrideContextForView3dOps()
        bpy.ops.view3d.view_axis(oContextOverride, type='TOP', align_active=True)
        bpy.ops.view3d.view_persportho(oContextOverride)
        bpy.ops.view3d.view_selected(oContextOverride, use_all_regions=False)
        #setZoom(0.1)
        setZoom(0.15)
        
        #return
        
        bpy.ops.object.mode_set(mode='OBJECT', toggle=False)
        bpy.ops.object.select_all(action='DESELECT')

        bpy.context.view_layer.objects.active = bpy.data.objects[sphere_name]
        bpy.data.objects[sphere_name].select_set(True)
        bpy.data.objects[obj_object.name].select_set(True)
        bpy.ops.object.mode_set(mode='EDIT', toggle=False)
        oContextOverride = AssembleOverrideContextForView3dOps() 
        bpy.ops.wm.redraw_timer(type='DRAW_WIN_SWAP', iterations=1) 
           
        bpy.ops.mesh.knife_project(oContextOverride, cut_through=False)

        bpy.ops.mesh.separate(type='SELECTED')
        
        bpy.ops.object.mode_set(mode='OBJECT', toggle=False)
        bpy.ops.object.select_all(action='DESELECT')
        bpy.data.objects[sphere_name].select_set(True)
        bpy.ops.object.delete() 

    for key, value in bpy.data.objects.items():
        if not "_sphere" in key:
            bpy.data.objects[key].select_set(True)
            bpy.ops.object.delete()
        else:
            pass
            triangulate_object(bpy.data.objects[key])
         
            
    bpy.ops.export_scene.obj(filepath=f"d:/gitrepos/javascript/country-globe/3dobj/{folder_name}/" + file_name)


def generateObjFiles(folders_loc, folder_name):
    file_loc = f'{folders_loc}/{folder_name}/'
    for filename in os.listdir(file_loc):
        if filename.endswith(".obj"): 
            print(filename)
            generateObjFile(filename, file_loc, folder_name)
    
    
start = time.time()

generateObjFiles('d:/gitrepos/javascript/country-globe/flatobj/', '110m')

end = time.time()
print(f"Time duration: {end - start}")
