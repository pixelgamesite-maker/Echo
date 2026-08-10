import { useEffect, useRef, useState } from "react";
import { getPublicClient } from "wagmi/actions";
import { wagmiConfig } from "@/lib/wagmiConfig";
import { EQUIX_ADDRESS } from "@/lib/contract";

const ZERO = "0x0000000000000000000000000000000000000000";
const HISTORY_BLOCKS = 5000n;
const POLL_MS = 8000;

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

/**
 * Plain polling instead of watchContractEvent — some RPC providers don't
 * support persistent filters over HTTP and fail silently, which is more
 * common than it should be. Repeated getLogs works everywhere.
 */
export function LiveMintFeed() {
  const [rows, setRows] = useState<MintRow[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const lastBlock = useRef<bigint | null>(null);
  const seen = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!EQUIX_ADDRESS) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    async function poll() {
      try {
        const client = getPublicClient(wagmiConfig);
        if (!client) throw new Error("no RPC client");

        const latest = await client.getBlockNumber();
        const fromBlock =
          lastBlock.current !== null
            ? lastBlock.current + 1n
            : latest > HISTORY_BLOCKS
            ? latest - HISTORY_BLOCKS
            : 0n;

        if (fromBlock <= latest) {
          const logs = await client.getLogs({
            address: EQUIX_ADDRESS,
            event: TRANSFER_EVENT,
            args: { from: ZERO as `0x${string}` },
            fromBlock,
            toBlock: latest,
          });

          const fresh = logs
            .map((l) => ({
              tokenId: (l.args as any).tokenId as bigint,
              to: (l.args as any).to as string,
              at: Date.now(),
            }))
            .filter((m) => !seen.current.has(m.tokenId.toString()));

          if (fresh.length && !cancelled) {
            fresh.forEach((m) => seen.current.add(m.tokenId.toString()));
            setRows((prev) => [...fresh.reverse(), ...prev].slice(0, 30));
          }
        }

        lastBlock.current = latest;
        if (!cancelled) setStatus("ready");
      } catch {
        if (!cancelled) setStatus((s) => (s === "loading" ? "error" : s));
      } finally {
        if (!cancelled) timer = setTimeout(poll, POLL_MS);
      }
    }

    poll();
    return () => { cancelled = true; clearTimeout(timer); };
  }, []);

  function timeAgo(ts: number) {
    const s = Math.floor((Date.now() - ts) / 1000);
    if (s < 60) return "JUST NOW";
    if (s < 3600) return `${Math.floor(s / 60)}M AGO`;
    return `${Math.floor(s / 3600)}H AGO`;
  }

  return (
    <section className="max-w-2xl mx-auto px-6 py-14 font-pixel">
      <div className="flex items-center justify-between mb-5">
        <p className="text-[12px] font-bold">LIVE MINT FEED</p>
        {status === "ready" && (
          <span className="flex items-center gap-2 text-[9px] text-ink/40">
            <span className="w-1.5 h-1.5 bg-sage animate-pulse" />
            LIVE
          </span>
        )}
      </div>

      {status === "loading" ? (
        <p className="text-[11px] text-sage">loading recent mints…</p>
      ) : status === "error" ? (
        <p className="text-[11px] text-ink/40">
          couldn't reach the chain — retrying…
        </p>
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
