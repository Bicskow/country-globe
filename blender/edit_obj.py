import bpy
import bmesh


def setClipStart():
    for oWindow in bpy.context.window_manager.windows:          ###IMPROVE: Find way to avoid doing four levels of traversals at every request!!
        oScreen = oWindow.screen
        for oArea in oScreen.areas:
            if oArea.type == 'VIEW_3D':      
                oArea.spaces.active.clip_start = 0.01

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


print("---------------------------------------------------------------------------------------")
# Deselect all
bpy.ops.object.mode_set(mode='OBJECT', toggle=False)
bpy.ops.object.select_all(action='DESELECT')

#print(bpy.data.objects)

for key, value in bpy.data.objects.items():
    #print(key)
    if key != "Ligth" and key != "Camera":
        bpy.data.objects[key].select_set(True)
        bpy.ops.object.delete() 
                
        

file_loc = 'd:\\gitrepos\\javascript\\country-globe\\flatobj\\'
#file_name = 'Hungary.obj'
#file_name = 'United Kingdom.obj'
file_name = 'Italy.obj'
imported_object = bpy.ops.import_scene.obj(filepath=file_loc + file_name)

setClipStart()

for obj_object in bpy.context.selected_objects:
    print('Imported name: ', obj_object.name)
       
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
    

    bpy.ops.object.mode_set(mode='OBJECT', toggle=False)
    bpy.ops.object.select_all(action='DESELECT')

    bpy.context.view_layer.objects.active = bpy.data.objects[obj_object.name]
    bpy.ops.object.mode_set(mode='EDIT', toggle=False)
    oContextOverride = AssembleOverrideContextForView3dOps()
    bpy.ops.view3d.view_axis(oContextOverride, type='TOP', align_active=True)
    bpy.ops.view3d.view_selected(oContextOverride, use_all_regions=False)


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
        
bpy.ops.export_scene.obj(filepath="d:\\gitrepos\\javascript\\country-globe\\3dobj\\" + file_name )
