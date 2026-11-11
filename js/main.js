import * as THREE from "three";
import { initializeAuth } from "./auth/auth.js";

import {
  CSS3DRenderer,
  CSS3DObject,
} from "three/addons/renderers/CSS3DRenderer.js";

import { TrackballControls } from "three/addons/controls/TrackballControls.js";

import "../css/style.css";
import "../css/login.css";
import "../css/visualization.css";

// Temporary Three.js smoke test.
// Google authentication and real dataset integration
// will be implemented in subsequent phases.
const isDevelopmentPreview =
  new URLSearchParams(window.location.search).get("dev") === "1";

if (isDevelopmentPreview) {
  document.querySelector("#login-screen").classList.add("hidden");

  document.querySelector("#visualization-screen").classList.remove("hidden");
}

const visualizationContainer = document.querySelector("#visualization");

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(40, 1, 1, 10000);

camera.position.z = 1000;

const renderer = new CSS3DRenderer();

renderer.setSize(
  visualizationContainer.clientWidth,
  visualizationContainer.clientHeight,
);

visualizationContainer.appendChild(renderer.domElement);

const controls = new TrackballControls(camera, renderer.domElement);

controls.minDistance = 500;
controls.maxDistance = 6000;

function createDemoTile() {
  const element = document.createElement("div");

  element.className = "demo-tile";

  element.innerHTML = `
        <strong>MY</strong>
        <h3>Kasatria</h3>
        <p>Three.js</p>
        <p>Demo Tile</p>
    `;

  return new CSS3DObject(element);
}

const demoTile = createDemoTile();

scene.add(demoTile);

function animate() {
  requestAnimationFrame(animate);

  controls.update();
  renderer.render(scene, camera);
}

function handleResize() {
  const width = visualizationContainer.clientWidth;
  const height = visualizationContainer.clientHeight;

  if (!width || !height) {
    return;
  }

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
}

window.addEventListener("resize", handleResize);

animate();

const loginScreen = document.querySelector("#login-screen");
const visualizationScreen = document.querySelector("#visualization-screen");

initializeAuth({
  onSignIn: (user) => {
    console.log("Signed in as:", user.email);

    loginScreen.classList.add("hidden");
    visualizationScreen.classList.remove("hidden");

    handleResize();
  },

  onSheetsAuthorized: async (token) => {
    console.log("Google Sheets access granted.");
  },

  onSignOut: () => {
    visualizationScreen.classList.add("hidden");
    loginScreen.classList.remove("hidden");

    handleResize();
  },

  onError: (error) => {
    console.error("Google authentication error:", error);
    alert("Google Sheets authorization failed. Please try again.");
  },
}).catch((error) => {
  console.error("Failed to initialize Google authentication:", error);
});

console.log("Three.js version:", THREE.REVISION);
console.log("Kasatria application initialized.");
