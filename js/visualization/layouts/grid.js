const COLUMNS = 5;
const ROWS = 4;

const COLUMN_PITCH = 400;
const ROW_PITCH = 400;
const LAYER_PITCH = 400;

export function getGridPositions(count) {
  const tilesPerLayer = COLUMNS * ROWS;
  const totalLayers = Math.ceil(count / tilesPerLayer);

  return Array.from({ length: count }, (_, index) => {
    const column = index % COLUMNS;
    const row = Math.floor(index / COLUMNS) % ROWS;
    const layer = Math.floor(index / tilesPerLayer);

    return {
      x: (column - (COLUMNS - 1) / 2) * COLUMN_PITCH,
      y: ((ROWS - 1) / 2 - row) * ROW_PITCH,
      z: (layer - (totalLayers - 1) / 2) * LAYER_PITCH,
    };
  });
}
