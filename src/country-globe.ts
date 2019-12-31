import * as THREE from 'three';

export default class CountryGlobe {
  private container: Element;
  private scene: THREE.Scene;
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;
  private geometry: THREE.SphereGeometry;
  private texture = [] as THREE.Texture[];
  private material: THREE.MeshPhongMaterial;
  private mesh: THREE.Mesh;

  private mouseDown: boolean = false;
  private mouseX: number = 0;
  private mouseY: number = 0;

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

    this.texture.push(new THREE.TextureLoader().load('img/w1.png'));
    this.texture.push(new THREE.TextureLoader().load('img/w2.png'));

    this.material = new THREE.MeshPhongMaterial({ map: this.texture[0] });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.rotation.set(Math.PI / 4, Math.PI / 4, 0);
    this.scene.add(this.mesh);

    const light = new THREE.PointLight(0xffffff, 1, 1000);
    light.position.set(500, 50, 500);
    this.scene.add(light);

    const light2 = new THREE.AmbientLight(0x808080);
    this.scene.add(light2);

    this.container.addEventListener('mousemove', this.onMouseMove.bind(this) as any);
    this.container.addEventListener('mousedown', this.onMouseDown.bind(this) as any);
    this.container.addEventListener('mouseup', this.onMouseUp.bind(this) as any);
    this.container.addEventListener('mousewheel', this.onMouseWheel.bind(this) as any);

    this.render();
  }

  public setTexture() {
    this.material.map = this.texture[1];
    this.material.map.needsUpdate = true;
  }

  public addBox() {
    const geometry = new THREE.BoxGeometry(2, 2, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.setY(6);
    this.scene.add(cube);
  }

  private render() {
    requestAnimationFrame(this.render.bind(this));
    this.renderer.render(this.scene, this.camera);
  }

  private rotateGlobe(deltaX: number, deltaY: number) {
    this.mesh.rotation.y += deltaX / 100;
    this.mesh.rotation.x += deltaY / 100;
  }

  private onMouseMove(evt: MouseEvent) {
    if (!this.mouseDown) {
      return;
    }

    evt.preventDefault();

    const deltaX = evt.clientX - this.mouseX;
    const deltaY = evt.clientY - this.mouseY;
    this.mouseX = evt.clientX;
    this.mouseY = evt.clientY;
    this.rotateGlobe(deltaX, deltaY);
  }

  private onMouseDown(evt: MouseEvent) {
    evt.preventDefault();

    this.addBox();

    this.mouseDown = true;
    this.mouseX = evt.clientX;
    this.mouseY = evt.clientY;
  }

  private onMouseUp(evt: MouseEvent) {
    evt.preventDefault();

    this.mouseDown = false;
  }

  private onMouseWheel(event: WheelEvent) {
    this.camera.position.z += event.deltaY * 0.3;
  }
}

module.exports = CountryGlobe;
