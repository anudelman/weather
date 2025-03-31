import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.153.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.153.0/examples/jsm/loaders/GLTFLoader.js';

class Thunderstorm3D extends HTMLElement {
  constructor() {
    super();
    this._shadowRoot = this.attachShadow({ mode: 'open' });

    // Create a container for Three.js
    this._container = document.createElement('div');
    // Positioning, sizing, and any other styles can go here:
    this._container.style.width = '100vw';
    this._container.style.height = '100vh';
    this._container.style.position = 'fixed';
    this._container.style.top = '0';
    this._container.style.left = '0';
    this._container.style.zIndex = '-1';
    this._shadowRoot.appendChild(this._container);

    // Scene setup
    this._scene = new THREE.Scene();

    // Camera setup
    this._camera = new THREE.PerspectiveCamera(
      35, 
      this._container.clientWidth / this._container.clientHeight,
      0.1,
      100
    );
    this._camera.position.set(0, 1, 5);

    // Renderer setup (transparent background to overlay on your page)
    this._renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this._renderer.setSize(this._container.clientWidth, this._container.clientHeight);
    this._renderer.setPixelRatio(window.devicePixelRatio);
    this._container.appendChild(this._renderer.domElement);

    // Basic lighting (feel free to adjust or add more lights)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    this._scene.add(ambientLight);

    // Store animation frame reference
    this._animationFrameId = null;
  }

  connectedCallback() {
    // When element is added to DOM, load the model and start rendering
    this._loadModel();
    window.addEventListener('resize', this._onWindowResize.bind(this));
  }

  disconnectedCallback() {
    // When element is removed, clean up
    window.removeEventListener('resize', this._onWindowResize.bind(this));
    cancelAnimationFrame(this._animationFrameId);
    if (this._renderer) {
      this._renderer.dispose();
    }
  }

  _loadModel() {
    // Replace this URL with your actual 3D model path
    const modelUrl = './components/thunderstorm.glb';

    const loader = new GLTFLoader();
    loader.load(
      modelUrl,
      (gltf) => {
        this._model = gltf.scene;
        this._scene.add(this._model);

        // Optionally, find any animation clips within the model
        // let mixer = new THREE.AnimationMixer(this._model);
        // gltf.animations.forEach((clip) => {
        //   mixer.clipAction(clip).play();
        // });

        // Start the render loop
        this._animate();
      },
      undefined,
      (error) => {
        console.error('Error loading 3D model:', error);
      }
    );
  }

  _animate() {
    this._animationFrameId = requestAnimationFrame(() => this._animate());

    // Example rotation to keep it lively (remove if not needed)
    if (this._model) {
      this._model.rotation.y += 0.00002;
    }

    this._renderer.render(this._scene, this._camera);
  }

  _onWindowResize() {
    // Adjust camera and renderer on window resize if desired
    const width = this._container.clientWidth;
    const height = this._container.clientHeight;

    this._camera.aspect = width / height;
    this._camera.updateProjectionMatrix();

    this._renderer.setSize(width, height);
  }
}

// Register the custom element
customElements.define('thunderstorm-3d', Thunderstorm3D);