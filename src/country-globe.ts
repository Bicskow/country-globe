import * as THREE from 'three';
import $ from "jquery";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import TWEEN from '@tweenjs/tween.js';

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
  private objLoader: OBJLoader;

  private radius: number = 5
  private orbitUpdate: boolean = false;
  private mouseX: number = 0;
  private mouseY: number = 0;
  private controls: OrbitControls;

  private mapColors = [0xf78786,0x8aec7b, 0xf3f361, 0x6cbaeb, 0xbd8fcf];
  private countryObjects = [] as THREE.Object3D[];

  private orbitCoords = new THREE.Spherical(75, Math.PI/2, 0);

  constructor(ct: Element) {
    this.objLoader = new OBJLoader();

    this.container = ct;
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(10, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.setFromSpherical(this.orbitCoords);

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
    this.scene.add(this.mesh);

    const light = new THREE.PointLight(0xffffff, 1, 0, 2);
    light.position.set(1000, 5, 1500);
    this.camera.add(light);
    this.scene.add(this.camera);

    //this.container.addEventListener('mousemove', this.onMouseMove.bind(this) as any);
    this.container.addEventListener('mousedown', this.onMouseDown.bind(this) as any);
    //this.container.addEventListener('mouseup', this.onMouseUp.bind(this) as any);
    //this.container.addEventListener('DOMMouseScroll', this.onMouseWheel.bind(this) as any);
    this.container.addEventListener('keypress', this.onKeypres.bind(this) as any);

    this.loadCountriesJson();
    this.render();
  }

  private addCountryOBJ(object: THREE.Object3D){
    object.name = (object as any).materialLibraries[0].replace("\.mtl", "");
    this.countryObjects.push(object);
    var color = 0x44ab2b;
    var ship_material = new THREE.MeshPhongMaterial( { color: color } );
    object.traverse( function( child ) {
      if ( child instanceof THREE.Mesh ) {
          child.material = ship_material;
      }
    });
    this.scene.add( object );
  }

  private addCountryBorderOBJ(object: THREE.Object3D){
    let color = 0x000000;
    let border_material = new THREE.LineBasicMaterial( { color: color, linewidth: 1} );
    object.traverse( function( child ) {
      if ( child instanceof THREE.Line ) {
          child.material = border_material;
      }
    });
    this.scene.add( object );
  }
  
  private loadCountryOBJ(objFile: string){
    this.objLoader.load(objFile, this.addCountryOBJ.bind(this))
  }

  private loadCountryBorderOBJ(objFile: string){
    this.objLoader.load(objFile, this.addCountryBorderOBJ.bind(this));
  }

  public loadCountriesJsonData(data: any){
    console.log("Loading country objs and borders countries data");
    for (let coutry in data) {
      console.log(coutry);
      this.loadCountryOBJ("/3dobj/" + data[coutry]);
      this.loadCountryBorderOBJ("/flatobj/" + data[coutry]);
    }
  }

  public loadCountriesJson(){
    console.log("Loading countries JSON");
    $.getJSON("resources/countries.json", this.loadCountriesJsonData.bind(this))
  }

  public setTexture() {
    this.material.map = this.texture[1];
    this.material.map.needsUpdate = true;
  }

  private render() {
    requestAnimationFrame(this.render.bind(this));
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
    TWEEN.update();

    if(this.orbitUpdate){
      this.camera.position.setFromSpherical(this.orbitCoords);
    } else {
      this.orbitCoords.setFromVector3(this.camera.position);
    }
    
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
  }

  private onMouseDown(evt: MouseEvent) {
    evt.preventDefault();
    this.mouseX = evt.clientX;
    this.mouseY = evt.clientY;
    let obj = this.getIntersections();
    if(obj != null){
      console.log(obj.name);
      var select_material = new THREE.MeshPhongMaterial({ color: 0xff0513 });
      obj.traverse( function( child ) {
        if ( child instanceof THREE.Mesh ) {
          child.material = select_material;
        }
      });
    }
  }

  private onMouseUp(evt: MouseEvent) {
  }

  private onMouseWheel(event: WheelEvent) {
  }

  private orbitUpdateDone(){
    this.orbitUpdate = false;
  }

  private degrees_to_radians(deg: number)
  {
    return deg * (Math.PI/180);
  }

  public setOrbit(lat: number, lng: number, zoom: number){
    this.orbitUpdate = true;
    let sp = new THREE.Spherical(zoom, this.degrees_to_radians((lat * -1) + 90) , this.degrees_to_radians(lng + 90));
    TWEEN.removeAll();
    let camTween = new TWEEN.Tween(this.orbitCoords).to(sp, 1000).easing(TWEEN.Easing.Quadratic.InOut);
    camTween.onComplete(this.orbitUpdateDone.bind(this));
    camTween.start();
  }

  private onKeypres(event: Event){
    this.setOrbit(21.30694,-157.85833, 30);
    //this.setOrbit(35.6895,139.69171, 30);
    //this.setOrbit(40.71427,-74.00597,30);
    //this.setOrbit(-34.90328,-56.18816,30);
    //this.setOrbit(47.49801,19.03991,30);
  }
}

module.exports = CountryGlobe;
