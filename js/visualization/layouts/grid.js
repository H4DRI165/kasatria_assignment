const COLUMNS = 5;
const ROWS = 4;
const LAYERS = 10;

const COLUMN_PITCH = 400;
const ROW_PITCH = 400;
const LAYER_SPACING = 500;

export function getGridPositions(count) {
  const capacity = COLUMNS * ROWS * LAYERS;

  if (!Number.isInteger(count) || count < 0 || count > capacity) {
    throw new Error(`Grid layout supports between 0 and ${capacity} tiles.`);
  }

  return Array.from({ length: count }, (_, index) => {
    const column = index % COLUMNS;
    const row = Math.floor(index / COLUMNS) % ROWS;
    const layer = Math.floor(index / (COLUMNS * ROWS));

    return {
      x: (column - (COLUMNS - 1) / 2) * COLUMN_PITCH,
      y: ((ROWS - 1) / 2 - row) * ROW_PITCH,
      z: (layer - (LAYERS - 1) / 2) * LAYER_SPACING,
    };
  });
}
