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
  private raycaster = new THREE.Raycaster();
  private objLoader: OBJLoader;

  private radius: number = 5
  private orbitUpdate: boolean = false;
  private mouseX: number = 0;
  private mouseY: number = 0;
  private controls: OrbitControls;
  private highlightedCountry: string = "";

  private countyColor = 0x44ab2b;
  private countryObjects = [] as THREE.Object3D[];
  private countryData: any;

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

    let globeGeometry = new THREE.SphereGeometry(this.radius - 0.01, 100, 100);

    let globeMaterial = new THREE.MeshPhongMaterial({color: 0x3471eb});
    let globeMesh = new THREE.Mesh(globeGeometry, globeMaterial);
    this.scene.add(globeMesh);

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
    var ship_material = new THREE.MeshPhongMaterial( { color: this.countyColor } );
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

  private loadCountriesJsonData(data: any){
    console.log("Loading country objs and borders countries data");
    this.countryData = data;
    for (let coutry in data) {
      console.log(coutry);
      this.loadCountryOBJ("/3dobj/" + data[coutry]['fileName']);
      this.loadCountryBorderOBJ("/flatobj/" + data[coutry]['fileName']);
    }
  }

  private loadCountriesJson(){
    console.log("Loading countries JSON");
    $.getJSON("resources/countries.json", this.loadCountriesJsonData.bind(this))
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

  private setObjectColor(obj: THREE.Object3D, colNum: number){
    if(obj != null){
      var select_material = new THREE.MeshPhongMaterial({ color: colNum });
      obj.traverse( function( child ) {
        if ( child instanceof THREE.Mesh ) {
          child.material = select_material;
        }
      });
    }
  }

  private onMouseDown(evt: MouseEvent) {
    evt.preventDefault();
    this.mouseX = evt.clientX;
    this.mouseY = evt.clientY;
    let obj = this.getIntersections();
    if(obj != null){
      this.highlightCounty(obj.name)
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

  public async setOrbit(lat: number, lng: number, zoom: number){
    this.orbitUpdate = true;
    let sp2 = new THREE.Spherical(zoom, this.degrees_to_radians((lat * -1) + 90) , this.degrees_to_radians(lng + 90)); 
    let sp1 = new THREE.Spherical(75, (sp2.phi + this.orbitCoords.phi)/2, (sp2.theta + this.orbitCoords.theta)/2);
    TWEEN.removeAll();
    let camTween1 = new TWEEN.Tween(this.orbitCoords).to(sp1, 1000).easing(TWEEN.Easing.Quadratic.In);
    let camTween2 = new TWEEN.Tween(this.orbitCoords).to(sp2, 1000).easing(TWEEN.Easing.Quadratic.Out);
    camTween2.onComplete(this.orbitUpdateDone.bind(this));
    camTween1.chain(camTween2);
    camTween1.start();
  }

  private onKeypres(event: KeyboardEvent){
    let key = String.fromCharCode(event.keyCode);
    console.log(key);
    if(key === 'n'){
      this.testAnimation();
    } else if(key === 'z'){
      console.log(this.orbitCoords.radius)
    }
    //this.setOrbit(21.30694,-157.85833, 30);
    //this.setOrbit(35.6895,139.69171, 30);
    //this.setOrbit(40.71427,-74.00597,30);
    //this.setOrbit(-34.90328,-56.18816,30);
    //this.setOrbit(47.49801,19.03991,30);
  }

  public zoomOut(){
    this.setOrbit(this.countryData[this.highlightedCountry]['lat'], this.countryData[this.highlightedCountry]['lng'], 75);
  }
  public zoomToCountry(country: string){
    console.log(this.countryData[country]['lat']);
    console.log(this.countryData[country]['lng']);
    this.setOrbit(this.countryData[country]['lat'],this.countryData[country]['lng'],this.countryData[country]['zoom']);
  }

  public removeCountryHighlight(){
    if(this.highlightedCountry){
      for(let object of this.countryObjects){
        if(object.name === this.highlightedCountry){
          this.setObjectColor(object, this.countyColor);
          this.highlightedCountry = "";
        }
      }
    }
  }

  public highlightCounty(country: string){
    if(this.highlightedCountry === country){
      this.removeCountryHighlight();
      return;
    }
    this.removeCountryHighlight();

    for(let object of this.countryObjects){
      if(object.name === country){
        this.setObjectColor(object, 0xfcf0513);
        this.highlightedCountry = country;
      }
    }
    console.log(this.highlightedCountry)
  }

  public testAnimation(){
    console.log("ANIMATION START")
    let keys = Object.keys(this.countryData);
    keys.sort();
    let country = keys[0];
    if(this.highlightedCountry === ""){
      country = keys[0];
    } else {
      for (let i = 0; i < keys.length; i++) {
        if(keys[i] === this.highlightedCountry){
          if(i + 1 < keys.length){
            country = keys[i+1];
          } else {
            country = keys[0];
          }
        }
      }
    }
    this.highlightCounty(country);
    this.zoomToCountry(country);
  }

  public getRandomCountry() {
    var keys = Object.keys(this.countryData)
    return keys[ keys.length * Math.random() << 0];
  }
}

module.exports = CountryGlobe;
