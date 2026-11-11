import * as THREE from "three";

import { CSS3DRenderer } from "three/addons/renderers/CSS3DRenderer.js";

import { TrackballControls } from "three/addons/controls/TrackballControls.js";

import { createTile } from "./tile.js";
import { getTablePositions } from "./layouts/table.js";

export function initializeVisualization(container, records) {
  if (!container) {
    throw new Error("Visualization container was not found.");
  }

  if (!Array.isArray(records) || records.length === 0) {
    throw new Error("No records available for visualization.");
  }

  // Create scene
  const scene = new THREE.Scene();

  // Create camera
  const camera = new THREE.PerspectiveCamera(
    40,
    container.clientWidth / container.clientHeight,
    1,
    10000,
  );

  camera.position.set(0, 0, 3000);

  // Create CSS3D renderer
  const renderer = new CSS3DRenderer();

  container.replaceChildren();
  container.appendChild(renderer.domElement);

  // Create camera controls
  const controls = new TrackballControls(camera, renderer.domElement);

  controls.minDistance = 400;
  controls.maxDistance = 8000;
  controls.rotateSpeed = 1.0;
  controls.zoomSpeed = 1.5;
  controls.panSpeed = 1.5;

  // Configure mouse interactions
  controls.mouseButtons = {
    LEFT: THREE.MOUSE.ROTATE,
    MIDDLE: THREE.MOUSE.DOLLY,
    RIGHT: undefined,
  };

  // Custom right-click pan
  let isRightDragging = false;
  let previousPointerX = 0;
  let previousPointerY = 0;

  function handlePointerDown(event) {
    if (event.button !== 2) return;

    isRightDragging = true;
    previousPointerX = event.clientX;
    previousPointerY = event.clientY;

    event.preventDefault();
    renderer.domElement.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event) {
    if (!isRightDragging) return;

    const deltaX = event.clientX - previousPointerX;
    const deltaY = event.clientY - previousPointerY;

    previousPointerX = event.clientX;
    previousPointerY = event.clientY;

    camera.updateMatrixWorld();

    const distance = camera.position.distanceTo(controls.target);
    const targetDistance =
      distance * Math.tan(((camera.fov / 2) * Math.PI) / 180);

    const panOffset = new THREE.Vector3();

    // Horizontal movement
    const right = new THREE.Vector3().setFromMatrixColumn(
      camera.matrixWorld,
      0,
    );

    right.multiplyScalar(
      (-2 * deltaX * targetDistance * controls.panSpeed) /
        renderer.domElement.clientHeight,
    );

    panOffset.add(right);

    // Vertical movement
    const up = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 1);

    up.multiplyScalar(
      (2 * deltaY * targetDistance * controls.panSpeed) /
        renderer.domElement.clientHeight,
    );

    panOffset.add(up);

    // Move camera and controls target together
    camera.position.add(panOffset);
    controls.target.add(panOffset);

    controls.update();
  }

  function handlePointerUp(event) {
    if (event.button === 2) {
      isRightDragging = false;
    }

    if (renderer.domElement.hasPointerCapture(event.pointerId)) {
      renderer.domElement.releasePointerCapture(event.pointerId);
    }
  }

  function handlePointerCancel(event) {
    isRightDragging = false;

    if (renderer.domElement.hasPointerCapture(event.pointerId)) {
      renderer.domElement.releasePointerCapture(event.pointerId);
    }
  }

  function handleContextMenu(event) {
    event.preventDefault();
  }

  renderer.domElement.addEventListener("pointerdown", handlePointerDown);

  renderer.domElement.addEventListener("pointermove", handlePointerMove);

  renderer.domElement.addEventListener("pointerup", handlePointerUp);

  renderer.domElement.addEventListener("pointercancel", handlePointerCancel);

  renderer.domElement.addEventListener("contextmenu", handleContextMenu);

  // Create tiles from Google Sheets records
  const tiles = records.map((record, index) => {
    const tile = createTile(record, index);

    scene.add(tile);

    return tile;
  });

  // Set target positions for the initial Table layout
  function setLayout(layoutName) {
    let positions;

    switch (layoutName) {
      case "table":
        positions = getTablePositions(tiles.length);
        break;

      default:
        console.warn(`Unknown layout: ${layoutName}`);
        return;
    }

    tiles.forEach((tile, index) => {
      const position = positions[index];

      tile.userData.targetPosition = new THREE.Vector3(
        position.x,
        position.y,
        position.z,
      );

      tile.userData.targetRotation = new THREE.Euler(0, 0, 0);
    });
  }

  // Set initial layout
  setLayout("table");

  // Resize renderer and camera
  function handleResize() {
    const width = container.clientWidth;
    const height = container.clientHeight;

    if (!width || !height) return;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
  }

  // Animation loop
  let animationFrameId;

  function animate() {
    animationFrameId = requestAnimationFrame(animate);

    tiles.forEach((tile) => {
      const targetPosition = tile.userData.targetPosition;
      const targetRotation = tile.userData.targetRotation;

      if (targetPosition) {
        tile.position.lerp(targetPosition, 0.08);
      }

      if (targetRotation) {
        tile.rotation.x += (targetRotation.x - tile.rotation.x) * 0.08;

        tile.rotation.y += (targetRotation.y - tile.rotation.y) * 0.08;

        tile.rotation.z += (targetRotation.z - tile.rotation.z) * 0.08;
      }
    });

    controls.update();
    renderer.render(scene, camera);
  }

  // Initialize renderer size
  handleResize();

  window.addEventListener("resize", handleResize);

  animate();

  // Return methods needed by main.js
  return {
    setLayout,

    resize: handleResize,

    destroy() {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);

      renderer.domElement.removeEventListener("pointerdown", handlePointerDown);

      renderer.domElement.removeEventListener("pointermove", handlePointerMove);

      renderer.domElement.removeEventListener("pointerup", handlePointerUp);

      renderer.domElement.removeEventListener(
        "pointercancel",
        handlePointerCancel,
      );

      renderer.domElement.removeEventListener("contextmenu", handleContextMenu);

      controls.dispose();

      container.replaceChildren();
    },
  };
}
