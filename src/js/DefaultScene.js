import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

class DefaultScene {
  constructor() {

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer();
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    this.geometry = new THREE.PlaneGeometry(1, 1);
    this.material = new THREE.MeshBasicMaterial({
      color: 0x000066,
      side: THREE.DoubleSide
    });

    this.plane = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.plane);

    this.settings();
    this.init();

  }

  settings() {
    this.scene.background = new THREE.Color('#fff');
    this.camera.position.z = 1.3;
  }

  init() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    this.controls.update();
    this.render();
  }

  render() {
    this.controls.update();

    this.renderer.render(this.scene, this.camera);
    window.requestAnimationFrame(this.render.bind(this));
  }

}


export default DefaultScene;