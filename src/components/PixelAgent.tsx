import { useEffect, useState } from "react";

// 16x16 grid, each cell 0 (transparent) or a palette key.
// Kept intentionally simple: a calm, rounded-square "agent" head with
// a single antenna and two eyes that blink on an interval.
const PIXELS = [
  "................",
  "......XXXX......",
  ".....XXXXXX.....",
  "....XXXXXXXX....",
  "...XXXXXXXXXX...",
  "...XX.XXXX.XX...",
  "..XX.XXXXXX.XX..",
  "..XX.EE..EE.XX..",
  "..XX.EE..EE.XX..",
  "..XX.XXXXXX.XX..",
  "...XXXXXXXXXX...",
  "...XXXXXXXXXX...",
  "....XXXXXXXX....",
  ".....XXXXXX.....",
  "......XXXX......",
  "................",
];

const COLORS: Record<string, string> = {
  X: "#1E1E1E",
  E: "#F5F2E8",
};

export function PixelAgent() {
  const [blinking, setBlinking] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setBlinking(true);
      setTimeout(() => setBlinking(false), 160);
    }, 3600);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="grid"
      style={{
        gridTemplateColumns: "repeat(16, 1fr)",
        width: "min(320px, 60vw)",
        aspectRatio: "1",
      }}
      role="img"
      aria-label="Echo pixel agent"
    >
      {PIXELS.flatMap((row, y) =>
        row.split("").map((cell, x) => {
          const isEye = cell === "E";
          const color = isEye ? (blinking ? COLORS.X : COLORS.E) : COLORS[cell];
          return (
            <div
              key={`${x}-${y}`}
              style={{ backgroundColor: color || "transparent" }}
            />
          );
        })
      )}
    </div>
  );
}
