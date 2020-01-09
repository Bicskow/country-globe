import bpy
import bmesh

# Deselect all
bpy.ops.object.select_all(action='DESELECT')

print(bpy.data.objects)

for key, value in bpy.data.objects.items():
    print(key)
    if key != "Ligth" and key != "Camera":
        bpy.data.objects[key].select_set(True)
        bpy.ops.object.delete() 


file_loc = r'd:\gitrepos\javascript\country-globe\flatobj\Hungary.obj'
imported_object = bpy.ops.import_scene.obj(filepath=file_loc)
obj_object = bpy.context.selected_objects[0] ####<--Fix
print('Imported name: ', obj_object.name)



bpyscene = bpy.context.scene

# Create an empty object.
mesh = bpy.data.meshes.new('Basic_Sphere')
basic_cube = bpy.data.objects.new("Basic_Sphere", mesh)

# Add the object into the scene.
bpyscene.collection.objects.link(basic_cube)
bpy.context.view_layer.objects.active = basic_cube
basic_cube.select_set(True)

bm = bmesh.new()
bmesh.ops.create_uvsphere(bm, u_segments=32, v_segments=16, diameter=5)
bm.to_mesh(mesh)
bm.free()