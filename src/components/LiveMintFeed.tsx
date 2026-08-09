import { useEffect, useState } from "react";
import { watchContractEvent, getPublicClient } from "wagmi/actions";
import { wagmiConfig } from "@/lib/wagmiConfig";
import { EQUIX_ADDRESS, equixAbi } from "@/lib/contract";

const ZERO = "0x0000000000000000000000000000000000000000";
const HISTORY_BLOCKS = 5000n; // recent-history window on load

type MintRow = { tokenId: bigint; to: string; at: number };

const TRANSFER_EVENT = {
  type: "event",
  name: "Transfer",
  inputs: [
    { indexed: true, name: "from", type: "address" },
    { indexed: true, name: "to", type: "address" },
    { indexed: true, name: "tokenId", type: "uint256" },
  ],
} as const;

export function LiveMintFeed() {
  const [rows, setRows] = useState<MintRow[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    if (!EQUIX_ADDRESS) return;
    let cancelled = false;

    // 1. Backfill: pull recent mints so the feed isn't empty on load.
    (async () => {
      try {
        const client = getPublicClient(wagmiConfig);
        if (!client) throw new Error("no client");

        const latest = await client.getBlockNumber();
        const fromBlock = latest > HISTORY_BLOCKS ? latest - HISTORY_BLOCKS : 0n;

        const logs = await client.getLogs({
          address: EQUIX_ADDRESS,
          event: TRANSFER_EVENT,
          args: { from: ZERO as `0x${string}` },
          fromBlock,
          toBlock: "latest",
        });

        if (cancelled) return;
        const mints = logs
          .map((l) => ({
            tokenId: (l.args as any).tokenId as bigint,
            to: (l.args as any).to as string,
            at: Date.now(),
          }))
          .reverse()
          .slice(0, 30);

        setRows(mints);
      } catch {
        // history fetch failed (RPC limits block-range on some providers) —
        // fall through to live-only, still better than nothing
      } finally {
        if (!cancelled) setLoadingHistory(false);
      }
    })();

    // 2. Live: watch forward for anything new from this point on.
    const unwatch = watchContractEvent(wagmiConfig, {
      address: EQUIX_ADDRESS,
      abi: equixAbi,
      eventName: "Transfer",
      onLogs: (logs) => {
        const mints = logs
          .filter((l) => (l.args as any).from?.toLowerCase() === ZERO)
          .map((l) => ({
            tokenId: (l.args as any).tokenId as bigint,
            to: (l.args as any).to as string,
            at: Date.now(),
          }));
        if (mints.length) {
          setRows((prev) => {
            const seen = new Set(prev.map((r) => r.tokenId.toString()));
            const fresh = mints.reverse().filter((m) => !seen.has(m.tokenId.toString()));
            return [...fresh, ...prev].slice(0, 30);
          });
        }
      },
    });

    return () => { cancelled = true; unwatch(); };
  }, []);

  function timeAgo(ts: number) {
    const s = Math.floor((Date.now() - ts) / 1000);
    if (s < 60) return "JUST NOW";
    if (s < 3600) return `${Math.floor(s / 60)}M AGO`;
    return `${Math.floor(s / 3600)}H AGO`;
  }

  return (
    <section className="max-w-2xl mx-auto px-6 py-14 font-pixel">
      <p className="text-[12px] font-bold mb-5">LIVE MINT FEED</p>
      {loadingHistory ? (
        <p className="text-[11px] text-sage">loading recent mints…</p>
      ) : rows.length === 0 ? (
        <p className="text-[11px] text-ink/40">watching for mints…</p>
      ) : (
        <div className="border border-border divide-y divide-border">
          {rows.map((r, i) => (
            <div key={`${r.tokenId}-${i}`} className="flex justify-between items-center px-4 py-3 text-[11px]">
              <span>AGENT #{r.tokenId.toString().padStart(4, "0")}</span>
              <span className="text-ink/40">{r.to.slice(0, 6)}…{r.to.slice(-4)}</span>
              <span className="text-sage">{timeAgo(r.at)}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
