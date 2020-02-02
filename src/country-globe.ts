import * as THREE from 'three';
import $ from "jquery";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"

export default class CountryGlobe {
  private container: Element;
  private scene: THREE.Scene;
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;
  private geometry: THREE.SphereGeometry;
  private texture = [] as THREE.Texture[];
  private material: THREE.MeshPhongMaterial;
  private mesh: THREE.Mesh;
  private raycaster = new THREE.Raycaster();

  private radius: number = 5
  private mouseDown: boolean = false;
  private mouseX: number = 0;
  private mouseY: number = 0;
  private controls: OrbitControls;

  private mapColors = [0xf78786,0x8aec7b, 0xf3f361, 0x6cbaeb, 0xbd8fcf];
  private countryObjects = [] as THREE.Object3D[];

  constructor(ct: Element) {
    this.container = ct;
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(10, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.z = 75;

    this.controls = new OrbitControls( this.camera, this.renderer.domElement );

    this.renderer.setClearColor('#050505');
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.container.appendChild(this.renderer.domElement);

    this.renderer.setSize(window.innerWidth, window.innerHeight);

    window.addEventListener('resize', () => {
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
    });

    this.geometry = new THREE.SphereGeometry(this.radius - 0.01, 100, 100);

    this.texture.push(new THREE.TextureLoader().load('img/w1.png'));
    this.texture.push(new THREE.TextureLoader().load('img/w2.png'));

    //this.material = new THREE.MeshPhongMaterial({ map: this.texture[0] });
    this.material = new THREE.MeshPhongMaterial({color: 0x3471eb});
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    //this.scene.add(this.mesh);

    const light = new THREE.PointLight(0xffffff, 1, 1000);
    light.position.set(500, 50, 500);
    this.scene.add(light);

    const light2 = new THREE.AmbientLight(0x808080);
    this.scene.add(light2);

    //this.container.addEventListener('mousemove', this.onMouseMove.bind(this) as any);
    this.container.addEventListener('mousedown', this.onMouseDown.bind(this) as any);
    //this.container.addEventListener('mouseup', this.onMouseUp.bind(this) as any);
    //this.container.addEventListener('mousewheel', this.onMouseWheel.bind(this) as any);

    this.loadCountriesJson();
    this.render();
  }

  private addCountryOBJ(object: THREE.Object3D){
    object.name = (object as any).materialLibraries[0].replace("\.mtl", "");
    this.countryObjects.push(object);
    var color = this.mapColors[Math.floor(Math.random()*this.mapColors.length)];
    var ship_material = new THREE.MeshBasicMaterial( { color: color } );
    object.traverse( function( child ) {
      if ( child instanceof THREE.Mesh ) {
          child.material = ship_material;
      }
    });
    this.scene.add( object );
  }

  private loadCountryOBJ(objFile: string){
    const OBJLoader = require('three-obj-loader');
    OBJLoader(THREE);
    const loader = new (THREE as any).OBJLoader();
    loader.load(objFile, this.addCountryOBJ.bind(this));
  }

  private getVertex(longitude: number, latitude: number) : THREE.Vector3{
    const lambda = longitude * Math.PI / 180;
    const phi = latitude * Math.PI / 180;
    return new THREE.Vector3(
      this.radius * Math.cos(phi) * Math.cos(-lambda),
      this.radius * Math.sin(phi),
      this.radius * Math.cos(phi) * Math.sin(-lambda)
    );
  }

  public loadGeoJsonData(data: any){
    
    for (let feature of data["features"]) {
      if((feature["properties"]["ADMIN"] == "Hungary")){
        for (let entry of feature["geometry"]["coordinates"]) {
          for (let entry2 of entry) {
            const geometry = new THREE.Geometry();
            for (let entry3 of entry2) {
              const vertex = this.getVertex(entry3[0], entry3[1]);
              geometry.vertices.push(vertex);
            }
            const material = new THREE.LineBasicMaterial( {
              color: 0xffffff,
              linewidth: 1,
              linecap: 'butt', //ignored by WebGLRenderer
              linejoin:  'round' //ignored by WebGLRenderer
            } );
            const mesh = new THREE.Line(geometry, material);
            this.scene.add(mesh);
            const OBJExporter = require('three-obj-exporter');
            const exporter = new OBJExporter();
            const result = exporter.parse(mesh);
            console.log(result);
          }
        }
      }
    }
  }

  public loadCountriesJsonData(data: any){
    console.log("Loading countries data");
    console.log(data);
    for (let coutry in data) {
      console.log(coutry);
      this.loadCountryOBJ("/3dobj/" + data[coutry]);
    }
  }

  public loadCountriesJson(){
    console.log("Loading countries");
    $.getJSON("resources/countries.json", this.loadCountriesJsonData.bind(this))
  }

  public loadGeoJson(){
    console.log("Loading geojson");
    $.getJSON("geo-countries-master/data/countries.geojson", this.loadGeoJsonData.bind(this))
  }

  public setTexture() {
    this.material.map = this.texture[1];
    this.material.map.needsUpdate = true;
  }

  private render() {
    requestAnimationFrame(this.render.bind(this));
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  private rotateGlobe(deltaX: number, deltaY: number) {
    this.mesh.rotation.y += deltaX / 100;
    this.mesh.rotation.x += deltaY / 100;
  }

  private getIntersections(){
    let mouse = new THREE.Vector2();
    mouse.x = (this.mouseX / window.innerWidth) * 2 - 1;
    mouse.y = -(this.mouseY / window.innerHeight) * 2 + 1;
    this.raycaster.setFromCamera(mouse, this.camera);

    for(let object of this.countryObjects){
      for(let child of object.children){
        let intersects = this.raycaster.intersectObject(child);
        if (intersects.length != 0){
          return object;
        }
      }
    }
    return null;
  }

  private onMouseMove(evt: MouseEvent) {
    //if (!this.mouseDown) {
    //  return;
    //}

    //evt.preventDefault();

    //const deltaX = evt.clientX - this.mouseX;
    //const deltaY = evt.clientY - this.mouseY;
    //this.mouseX = evt.clientX;
    //this.mouseY = evt.clientY;
    //this.rotateGlobe(deltaX, deltaY);
  }

  private onMouseDown(evt: MouseEvent) {
    evt.preventDefault();
    this.mouseX = evt.clientX;
    this.mouseY = evt.clientY;
    let obj = this.getIntersections();
    if(obj != null){
      console.log(obj.name);
      var select_material = new THREE.MeshBasicMaterial( { color: 0xFFFFFF } );
      obj.traverse( function( child ) {
        if ( child instanceof THREE.Mesh ) {
          child.material = select_material;
        }
      });
    }
  }

  private onMouseUp(evt: MouseEvent) {
    //evt.preventDefault();
    //this.mouseDown = false;
  }

  private onMouseWheel(event: WheelEvent) {
    this.camera.position.z += event.deltaY * 0.3;
  }
}

module.exports = CountryGlobe;
