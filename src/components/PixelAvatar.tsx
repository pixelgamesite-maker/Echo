// Deterministic 8x8 pixel avatar seeded from the agent id, so each card
// gets a distinct but consistent "face" without needing real art assets.
function seededRandom(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return () => {
    h = (h * 1664525 + 1013904223) >>> 0;
    return h / 4294967295;
  };
}

export function PixelAvatar({ seed }: { seed: string }) {
  const rand = seededRandom(seed);
  const size = 8;
  const half = size / 2;
  const cells: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < half; x++) {
      const on = rand() > 0.55;
      cells[y][x] = on;
      cells[y][size - 1 - x] = on; // mirror for symmetry
    }
  }

  return (
    <div
      className="grid w-full h-full"
      style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
    >
      {cells.flatMap((row, y) =>
        row.map((on, x) => (
          <div
            key={`${x}-${y}`}
            style={{ backgroundColor: on ? "#1E1E1E" : "transparent" }}
          />
        ))
      )}
    </div>
  );
}
