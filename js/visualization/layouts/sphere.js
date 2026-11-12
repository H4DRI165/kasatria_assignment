import * as THREE from "three";

const DEFAULT_RADIUS = 1000;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

export function getSpherePositions(count, radius = DEFAULT_RADIUS) {
  const dummy = new THREE.Object3D();

  return Array.from({ length: count }, (_, index) => {
    const y = 1 - (2 * (index + 0.5)) / count;
    const horizontalRadius = Math.sqrt(1 - y * y);
    const theta = GOLDEN_ANGLE * index;

    const x = Math.cos(theta) * horizontalRadius * radius;
    const z = Math.sin(theta) * horizontalRadius * radius;
    const vertical = y * radius;

    dummy.position.set(x, vertical, z);

    // Orient the tile so its front faces outward.
    dummy.lookAt(x * 2, vertical * 2, z * 2);
    dummy.updateMatrixWorld();

    return {
      x,
      y: vertical,
      z,
      rotation: {
        x: dummy.rotation.x,
        y: dummy.rotation.y,
        z: dummy.rotation.z,
      },
    };
  });
}
