const TILE_WIDTH = 110;
const TILE_HEIGHT = 150;

const HORIZONTAL_GAP = 20;
const VERTICAL_GAP = 20;

const COLUMNS = 20;

export function getTablePositions(count) {
  return Array.from({ length: count }, (_, index) => {
    const column = index % COLUMNS;
    const row = Math.floor(index / COLUMNS);

    const totalRows = Math.ceil(count / COLUMNS);

    const x = (column - (COLUMNS - 1) / 2) * (TILE_WIDTH + HORIZONTAL_GAP);

    const y = ((totalRows - 1) / 2 - row) * (TILE_HEIGHT + VERTICAL_GAP);

    return { x, y, z: 0 };
  });
}
