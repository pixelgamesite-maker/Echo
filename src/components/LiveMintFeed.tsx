import { useEffect, useRef, useState } from "react";
import { readContract } from "wagmi/actions";
import { wagmiConfig } from "@/lib/wagmiConfig";
import { EQUIX_ADDRESS, equixAbi } from "@/lib/contract";

const POLL_MS = 8000;
const BACKFILL_MAX = 12; // how many recent tokens to show on first load

type MintRow = { tokenId: bigint; to: string; at: number };

/**
 * This contract is ERC721A — token IDs mint sequentially. That means we
 * can reconstruct "what just minted" purely from totalSupply() + ownerOf(),
 * both plain eth_call requests. No getLogs, no getBlockNumber — those two
 * methods are currently returning 400 on this RPC/network combo (likely
 * incomplete method support for a very new chain), while eth_call works
 * fine, confirmed by the mint page's supply/price numbers loading correctly.
 */
export function LiveMintFeed() {
  const [rows, setRows] = useState<MintRow[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorDetail, setErrorDetail] = useState<string | null>(null);
  const lastSupply = useRef<bigint | null>(null);

  useEffect(() => {
    if (!EQUIX_ADDRESS) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    async function lookupOwners(ids: bigint[]): Promise<MintRow[]> {
      const results = await Promise.all(
        ids.map(async (tokenId) => {
          try {
            const owner = (await readContract(wagmiConfig, {
              address: EQUIX_ADDRESS,
              abi: equixAbi,
              functionName: "ownerOf",
              args: [tokenId],
            })) as string;
            return { tokenId, to: owner, at: Date.now() };
          } catch {
            return null;
          }
        })
      );
      return results.filter((r): r is MintRow => r !== null);
    }

    async function poll() {
      try {
        const supply = (await readContract(wagmiConfig, {
          address: EQUIX_ADDRESS,
          abi: equixAbi,
          functionName: "totalSupply",
        })) as bigint;

        if (lastSupply.current === null) {
          // first load — backfill the most recent handful so the feed
          // isn't empty, without assuming a specific starting token id
          const start = supply > BigInt(BACKFILL_MAX) ? supply - BigInt(BACKFILL_MAX) : 0n;
          const ids: bigint[] = [];
          for (let i = start; i < supply; i++) ids.push(i);
          const backfilled = await lookupOwners(ids);
          if (!cancelled) setRows(backfilled.reverse());
        } else if (supply > lastSupply.current) {
          const ids: bigint[] = [];
          for (let i = lastSupply.current; i < supply; i++) ids.push(i);
          const fresh = await lookupOwners(ids);
          if (!cancelled && fresh.length) {
            setRows((prev) => [...fresh.reverse(), ...prev].slice(0, 30));
          }
        }

        lastSupply.current = supply;
        if (!cancelled) { setStatus("ready"); setErrorDetail(null); }
      } catch (e: any) {
        if (!cancelled) {
          setStatus("error");
          setErrorDetail(String(e?.shortMessage ?? e?.message ?? "unknown error").slice(0, 140));
        }
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
        <div className="text-[11px] text-ink/40">
          <p>couldn't reach the chain — retrying…</p>
          {errorDetail && (
            <p className="text-[9px] text-ink/30 mt-2 font-sans break-words">{errorDetail}</p>
          )}
        </div>
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
