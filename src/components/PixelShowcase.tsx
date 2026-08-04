import { useEffect, useMemo, useState } from "react";
import { BASE_GRIDS, VARIANTS, SHOWCASE_BASES, type Cell } from "@/lib/pixelBases";

const INK = "#1E1E1E";
const SAGE = "#4F6D5A";
const SAGE_DIM = "#8C9E93";

// ---- idle animation overlays per base, keyed by animation tick ----
const blink = (eyes: [number, number][]): Cell[] =>
  eyes.map(([x, y]) => ({ x, y, c: "." as const }));

function idleCells(base: string, t: number): { cells: Cell[]; dim: [number, number][] } {
  const dim: [number, number][] = [];
  const cells: Cell[] = [];

  if (base === "male") {
    if (t === 5) cells.push(...blink([[9, 8], [10, 8], [13, 8], [14, 8]]));
    if (t === 2 || t === 3) dim.push([11, 19], [12, 19]); // zipper glint
  }
  if (base === "female") {
    if (t === 5) cells.push(...blink([[8, 8], [9, 8], [13, 8], [14, 8]]));
    if (t === 2) dim.push([10, 14], [11, 14]); // choker pulse
  }
  if (base === "robot") {
    if (t === 2 || t === 3) dim.push([9, 6], [10, 6], [11, 6], [9, 7], [10, 7], [11, 7]);
    if (t === 4 || t === 5) dim.push([13, 6], [14, 6], [15, 6], [13, 7], [14, 7], [15, 7]);
    if (t === 6) dim.push([11, 0], [12, 0]); // antenna
  }
  if (base === "pet") {
    if (t === 5) cells.push(...blink([[7, 9], [8, 9], [13, 9], [14, 9]]));
    if (t === 3) dim.push([10, 17], [11, 17]); // collar pulse
  }
  return { cells, dim };
}

export function usePixelShowcase(cycleMs = 2800, idleMs = 350) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), idleMs);
    return () => clearInterval(id);
  }, [idleMs]);

  const subframesPerArt = Math.max(1, Math.round(cycleMs / idleMs));
  const artIdx = Math.floor(tick / subframesPerArt);
  const subframe = tick % subframesPerArt;

  const total = SHOWCASE_BASES.length * 5;
  const idx = artIdx % total;
  const base = SHOWCASE_BASES[idx % SHOWCASE_BASES.length];
  const variantIdx = Math.floor(idx / SHOWCASE_BASES.length);
  const variant = VARIANTS[base][variantIdx];

  return { base, variant, subframe };
}

export function PixelShowcase({ base, variantCells, subframe = 0 }: {
  base: string;
  variantCells: Cell[];
  subframe?: number;
}) {
  const { grid, dimSet } = useMemo(() => {
    const rows = BASE_GRIDS[base].map((r) => r.split(""));
    for (const { x, y, c } of variantCells) {
      if (rows[y]?.[x] !== undefined) rows[y][x] = c;
    }
    const idle = idleCells(base, subframe % 8);
    for (const { x, y, c } of idle.cells) {
      if (rows[y]?.[x] !== undefined) rows[y][x] = c;
    }
    const dimSet = new Set(idle.dim.map(([x, y]) => `${x}-${y}`));
    return { grid: rows, dimSet };
  }, [base, variantCells, subframe]);

  return (
    <svg
      viewBox="0 0 24 24"
      className="w-full h-full"
      shapeRendering="crispEdges"
      role="img"
      aria-label={`Equix ${base} agent`}
    >
      {grid.flatMap((row, y) =>
        row.map((c, x) => {
          if (c === ".") return null;
          const dimmed = dimSet.has(`${x}-${y}`);
          return (
            <rect
              key={`${x}-${y}`}
              x={x} y={y} width={1} height={1}
              fill={c === "S" ? (dimmed ? SAGE_DIM : SAGE) : INK}
            />
          );
        })
      )}
    </svg>
  );
}
