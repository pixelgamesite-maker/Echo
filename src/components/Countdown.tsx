import { useEffect, useState } from "react";

/**
 * Counts down to a target time. Returns unlocked=true once passed, so the
 * page can flip itself without a redeploy.
 */
export function useCountdown(target: Date) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const diff = Math.max(0, target.getTime() - now);
  const unlocked = diff === 0;

  return {
    unlocked,
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff % 86_400_000) / 3_600_000),
    mins: Math.floor((diff % 3_600_000) / 60_000),
    secs: Math.floor((diff % 60_000) / 1000),
  };
}

function Unit({ value, label, accent = false }: { value: number; label: string; accent?: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={`w-full border px-4 md:px-6 py-5 md:py-7 text-center transition-colors ${
          accent ? "border-sage" : "border-border"
        }`}
      >
        <span
          className={`font-pixel text-[26px] md:text-[38px] leading-none tabular-nums ${
            accent ? "text-sage" : "text-ink"
          }`}
        >
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <span className="font-pixel text-[8px] text-ink/40 mt-3 tracking-widest">
        {label}
      </span>
    </div>
  );
}

export function Countdown({
  target,
  title = "PROMPT TO REVEAL UNLOCKS IN",
  note,
}: {
  target: Date;
  title?: string;
  note?: string;
}) {
  const { unlocked, days, hours, mins, secs } = useCountdown(target);

  if (unlocked) {
    return (
      <div className="border border-sage p-8 text-center">
        <div className="flex items-center justify-center gap-2.5 mb-3">
          <span className="w-1.5 h-1.5 bg-sage animate-pulse" />
          <p className="font-pixel text-[12px] text-sage">REVEAL IS LIVE</p>
        </div>
        <p className="text-[13px] text-ink/60">
          Choose any unrevealed agent above to begin.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-border">
      <div className="border-b border-border px-5 py-3.5 flex items-center gap-2.5">
        <span className="w-1.5 h-1.5 border border-ink/30" />
        <span className="font-pixel text-[10px] text-ink/60 tracking-wide">
          {title}
        </span>
      </div>

      <div className="p-6 md:p-9">
        <div className="grid grid-cols-4 gap-2.5 md:gap-4">
          <Unit value={days} label="DAYS" />
          <Unit value={hours} label="HOURS" />
          <Unit value={mins} label="MINS" />
          <Unit value={secs} label="SECS" accent />
        </div>

        {note && (
          <p className="text-[12px] text-ink/50 leading-relaxed mt-8 text-center max-w-sm mx-auto">
            {note}
          </p>
        )}
      </div>
    </div>
  );
}
  
