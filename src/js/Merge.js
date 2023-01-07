import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import imagesLoaded from 'imagesloaded';
import FontFaceObserver from 'fontfaceobserver';
// import gsap from 'gsap';
import * as dat from 'dat.gui';
import Scroll from './scroll';

import displacement from '../images/glitch.jpg';
// import displacement from '../images/disp.png';
// import displacement from '../images/cyberpunk.jpg';

// Shaders
import fragment from './shaders/fragment.glsl';
import vertex from './shaders/vertex.glsl';

class Merge {
  constructor(options) {
    this.time = 0;
    this.dom = options.dom;
    this.imagesQuery = options.imagesQuery;
    this.currentScroll = 0;
    this.previousScroll = 0;
    this.settings = null;

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        progress: { value: 0 },
        uImage: { value: 0 },
        mouse: { type: 'v3', value: new THREE.Vector3() },
        uDisplacement: { value: new THREE.TextureLoader().load(displacement) }
      },
      side: THREE.DoubleSide,
      fragmentShader: fragment,
      vertexShader: vertex,
      wireframe: false
    });
    this.planeSegments = 20;
    this.geometry = new THREE.PlaneBufferGeometry(1, 1, this.planeSegments, this.planeSegments);
    this.materials = [];

    this.width = this.dom.offsetWidth;
    this.height = this.dom.offsetHeight;

    // setup
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(70, this.width / this.height, 100, 2000);
    this.camera.position.z = 600;

    this.camera.fov = 2 * Math.atan((this.height / 2) / this.camera.position.z) * (180 / Math.PI);

    // collisions
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: true
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(this.width, this.height);
    this.dom.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    this.images = [...document.querySelectorAll('img')];

    const fontRoboto = new Promise(resolve => {
      new FontFaceObserver("Roboto").load().then(() => {
        resolve();
      });
    });

    // Preload images
    const preloadImages = new Promise((resolve, reject) => {
      imagesLoaded(document.querySelectorAll(this.imagesQuery), { background: true }, resolve);
    });

    const allPromises = [fontRoboto, preloadImages];
    Promise.all(allPromises).then(() => {
      this.scroll = new Scroll();
      this.addImages();
      this.resize();
      this.setPositions();
      this.events();
      this.render();
    });
    this.initSettings();
  }

  initSettings() {
    this.settings = {
      progress: 0
    };
    this.gui = new dat.GUI();
    this.gui.add(this.settings, 'progress', 0, 1, 0.01);
  }

  updateImages() {
    this.imageStore = this.images.map((img, i) => {
      const bounds = img.getBoundingClientRect();

      const { top, left, height, width } = bounds;

      this.scene.children[i].scale.set(width, height, 1);

      return {
        img, mesh: this.scene.children[i], top, left, width, height
      };
    });
  }

  addImages() {
    this.imageStore = this.images.map(img => {
      const bounds = img.getBoundingClientRect();

      const { top, left, height, width } = bounds;

      const texture = new THREE.TextureLoader().load(img.src);
      texture.needsUpdate = true;

      const material = this.material.clone();
      material.uniforms.uImage.value = texture;

      this.materials.push(material);

      const mesh = new THREE.Mesh(this.geometry, material);
      mesh.scale.set(width, height, 1);

      this.scene.add(mesh);

      return {
        img, mesh, top, left, width, height
      };
    });
  }

  events() {
    window.addEventListener('resize', () => {
      this.updateImages();
      this.resize();
      this.setPositions();
    });

    window.addEventListener('mousemove', (e) => {
      this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = - (e.clientY / window.innerHeight) * 2 + 1;
    });
  }

  setPositions() {
    this.imageStore.forEach(o => {
      // check if image is visible
      o.mesh.position.y = this.currentScroll - o.top + this.height / 2 - o.height / 2;
      o.mesh.position.x = o.left + o.width / 2 - this.width / 2;
    });
  }

  resize() {
    this.width = this.dom.offsetWidth;
    this.height = this.dom.offsetHeight;

    // Update camera
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();

    // Update renderer
    this.renderer.setSize(this.width, this.height);
  }

  render() {
    this.time += 0.05;

    this.scroll.render();
    this.previousScroll = this.currentScroll;
    this.currentScroll = this.scroll.scrollToRender;


    this.materials.forEach(m => {
      m.uniforms.progress.value = this.settings.progress;
    });
    // Optimizations
    if (Math.round(this.previousScroll) !== Math.round(this.currentScroll)) {
      this.setPositions();

      this.materials.forEach(m => {
        m.uniforms.time.value = this.time;
      });
    }

    this.raycaster.setFromCamera(this.mouse, this.camera);

    // // calculate objects intersecting the picking ray
    const intersects = this.raycaster.intersectObjects(this.scene.children);

    if (intersects.length) {
      this.materials.forEach(m => {
        m.uniforms.mouse.value = intersects[0].point.normalize();
        // console.log(intersects[0].point.normalize());
      });
    }

    this.renderer.render(this.scene, this.camera);
    window.requestAnimationFrame(this.render.bind(this));
  }
}

export default Merge;