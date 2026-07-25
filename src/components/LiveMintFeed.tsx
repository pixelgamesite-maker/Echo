import { useEffect, useState } from "react";
import { mintFeed as initialFeed, type MintEvent } from "@/lib/mockData";

export function LiveMintFeed() {
  const [feed, setFeed] = useState<MintEvent[]>(initialFeed);

  // Placeholder auto-refresh: ages entries client-side. Real version
  // will poll the backend / subscribe to Transfer events on-chain.
  useEffect(() => {
    const interval = setInterval(() => {
      setFeed((prev) => prev.map((e) => ({ ...e, minutesAgo: e.minutesAgo + 1 })));
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="max-w-3xl mx-auto px-6 py-20">
      <h2 className="font-pixel text-lg mb-10">Live Mint Feed</h2>
      <div className="border-2 border-border">
        {feed.map((event, i) => (
          <div key={event.number}>
            <div className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="font-pixel text-[10px]">{event.number}</p>
                <p className="text-sm text-ink/70 mt-1">{event.role}</p>
              </div>
              <span className="text-xs text-ink/50">
                Minted {event.minutesAgo}m ago
              </span>
            </div>
            {i < feed.length - 1 && <div className="border-t border-border" />}
          </div>
        ))}
      </div>
    </section>
  );
}
