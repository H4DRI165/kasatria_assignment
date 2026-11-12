import * as THREE from "three";

const DEFAULT_RADIUS = 1000;
const TURNS = 3;
const PAIR_COUNT = 100;
const VERTICAL_SPACING = 20;

const ANGLE_STEP = (Math.PI * 2 * TURNS) / PAIR_COUNT;

export function getHelixPositions(count, radius = DEFAULT_RADIUS) {
  const pairCount = Math.ceil(count / 2);
  const dummy = new THREE.Object3D();

  return Array.from({ length: count }, (_, index) => {
    const pairIndex = Math.floor(index / 2);
    const strand = index % 2;

    // The second strand starts 180 degrees from the first.
    const angle = pairIndex * ANGLE_STEP + strand * Math.PI;

    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;

    const y = ((pairCount - 1) / 2 - pairIndex) * VERTICAL_SPACING;

    // Face each tile outward from the helix.
    dummy.position.set(x, y, z);
    dummy.lookAt(x * 2, y, z * 2);
    dummy.updateMatrixWorld();

    return {
      x,
      y,
      z,
      rotation: {
        x: dummy.rotation.x,
        y: dummy.rotation.y,
        z: dummy.rotation.z,
      },
    };
  });
}
