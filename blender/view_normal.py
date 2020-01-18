import bpy
import bmesh


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



object_name = "0_Hungary"
#object_name = "0_Australia"
object_name = "87_Australia"

bpy.ops.object.mode_set(mode='OBJECT', toggle=False)
bpy.ops.object.select_all(action='DESELECT')
object = bpy.data.objects[object_name]
bpy.context.view_layer.objects.active = object

bpy.data.objects[object_name].select_set(True)
bpy.ops.object.mode_set(mode='EDIT', toggle=False)

con = AssembleOverrideContextForView3dOps()

bpy.ops.view3d.view_axis(con, type='TOP', align_active=True)


