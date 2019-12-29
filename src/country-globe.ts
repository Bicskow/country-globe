import * as THREE from 'three';

export default class CountryGlobe {
  container: Element;
  scene: THREE.Scene;
  renderer: THREE.WebGLRenderer;
  camera: THREE.PerspectiveCamera;
  geometry: THREE.SphereGeometry;
  texture: THREE.Texture;
  material: THREE.MeshPhongMaterial;
  mesh: THREE.Mesh;

  mouseDown: boolean = false;
  mouseX: number = 0;
  mouseY: number = 0;

  render() {
    requestAnimationFrame(this.render.bind(this));
    this.renderer.render(this.scene, this.camera);
  }

  rotateGlobe(deltaX: number, deltaY: number) {
    this.mesh.rotation.y += deltaX / 100;
    this.mesh.rotation.x += deltaY / 100;
  }

  onMouseMove(evt: MouseEvent) {
    if (!this.mouseDown) {
      return;
    }

    evt.preventDefault();

    var deltaX = evt.clientX - this.mouseX,
      deltaY = evt.clientY - this.mouseY;
    this.mouseX = evt.clientX;
    this.mouseY = evt.clientY;
    this.rotateGlobe(deltaX, deltaY);
  }

  onMouseDown(evt: MouseEvent) {
    evt.preventDefault();

    this.mouseDown = true;
    this.mouseX = evt.clientX;
    this.mouseY = evt.clientY;
  }

  onMouseUp(evt: MouseEvent) {
    evt.preventDefault();

    this.mouseDown = false;
  }

  onMouseWheel(event: WheelEvent) {
    this.camera.position.z += event.deltaY * 0.3;
  }

  constructor(ct: Element) {
    this.container = ct;
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(10, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.z = 75;

    this.renderer.setClearColor('#050505');
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.container.appendChild(this.renderer.domElement);

    this.renderer.setSize(window.innerWidth, window.innerHeight);

    window.addEventListener('resize', () => {
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
    });

    this.geometry = new THREE.SphereGeometry(5, 100, 100);
    this.texture = new THREE.TextureLoader().load('img/World_location_map_(equirectangular_191).png');

    this.material = new THREE.MeshPhongMaterial({ map: this.texture });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.rotation.set(Math.PI / 4, Math.PI / 4, 0);
    this.scene.add(this.mesh);

    var light = new THREE.PointLight(0xffffff, 1, 1000);
    light.position.set(500, 50, 500);
    this.scene.add(light);

    var light2 = new THREE.AmbientLight(0x808080);
    this.scene.add(light2);

    this.container.addEventListener('mousemove', this.onMouseMove.bind(this) as any);
    this.container.addEventListener('mousedown', this.onMouseDown.bind(this) as any);
    this.container.addEventListener('mouseup', this.onMouseUp.bind(this) as any);
    this.container.addEventListener('mousewheel', this.onMouseWheel.bind(this) as any);

    this.render();
  }
}

module.exports = CountryGlobe;
