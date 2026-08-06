import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAccount, useReadContract } from "wagmi";
import { Button } from "@/components/ui/Button";
import { WalletConnectButton } from "@/components/WalletConnectButton";
import { RevealConsole } from "@/components/RevealConsole";
import { Countdown, useCountdown } from "@/components/Countdown";
import { EQUIX_ADDRESS, equixAbi, resolveIpfs } from "@/lib/contract";

const API = import.meta.env.VITE_API_URL ?? "";

// Set VITE_REVEAL_START to an ISO timestamp (e.g. 2026-08-07T18:00:00Z).
// The fallback is a fixed date so it never drifts between page loads.
const REVEAL_START = new Date(
  import.meta.env.VITE_REVEAL_START ?? "2026-08-07T18:00:00Z"
);

type AgentStatus = { revealed: boolean; image?: string; name?: string; role?: string };

export default function MyAgentsPage() {
  const { address, isConnected } = useAccount();
  const { unlocked } = useCountdown(REVEAL_START);

  const [statuses, setStatuses] = useState<Record<string, AgentStatus>>({});
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [revealing, setRevealing] = useState<bigint | null>(null);

  const { data: tokenIds, isLoading } = useReadContract({
    address: EQUIX_ADDRESS,
    abi: equixAbi,
    functionName: "tokensOfOwner",
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 30_000 },
  });

  const ids = (tokenIds as readonly bigint[] | undefined) ?? [];
  const idKey = ids.map((i) => i.toString()).join(",");

  const loadStatuses = useCallback(async () => {
    if (ids.length === 0) { setStatuses({}); return; }
    setLoadingStatus(true);
    try {
      const res = await fetch(`${API}/api/agents/status?ids=${idKey}`);
      if (!res.ok) throw new Error();
      setStatuses(await res.json());
    } catch {
      setStatuses(Object.fromEntries(ids.map((i) => [i.toString(), { revealed: false }])));
    } finally {
      setLoadingStatus(false);
    }
  }, [idKey]);

  useEffect(() => { loadStatuses(); }, [loadStatuses]);

  const revealedCount = Object.values(statuses).filter((s) => s.revealed).length;
  const hasAgents = ids.length > 0;

  return (
    <main className="max-w-3xl mx-auto px-6 py-14 font-pixel">
      {/* ---- header ---- */}
      <div className="flex items-baseline justify-between mb-2">
        <h1 className="text-[18px]">MY AGENTS</h1>
        {isConnected && !isLoading && hasAgents && (
          <span className="text-[10px] text-ink/40 tabular-nums">
            {revealedCount} / {ids.length} REVEALED
          </span>
        )}
      </div>
      <p className="text-[11px] text-ink/40 mb-12 font-sans">
        Every agent begins blank. What it becomes is yours to write.
      </p>

      {/* ---- states ---- */}
      {!isConnected && (
        <div className="border border-dashed border-border p-14 md:p-20 text-center">
          <p className="text-[26px] text-ink/15 leading-none mb-4">?</p>
          <p className="text-[11px] text-ink/60 mb-7">
            CONNECT YOUR WALLET TO SEE YOUR AGENTS
          </p>
          <div className="flex justify-center"><WalletConnectButton /></div>
        </div>
      )}

      {isConnected && (isLoading || loadingStatus) && (
        <div className="border border-border p-14 text-center">
          <span className="inline-block w-2 h-2 bg-sage animate-pulse mb-4" />
          <p className="text-[11px] text-sage">READING CHAIN…</p>
        </div>
      )}

      {isConnected && !isLoading && !hasAgents && (
        <div className="border border-dashed border-border p-14 md:p-20 text-center">
          <p className="text-[11px] text-ink/60 mb-7">NO AGENTS YET</p>
          <Link to="/mint"><Button variant="primary">Mint your first agent</Button></Link>
        </div>
      )}

      {/* ---- grid ---- */}
      {hasAgents && !isLoading && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
          {ids.map((tokenId) => {
            const s = statuses[tokenId.toString()] ?? { revealed: false };
            return (
              <div key={tokenId.toString()} className="border border-border flex flex-col">
                <div className="aspect-square bg-ink/[0.02] border-b border-border flex items-center justify-center relative overflow-hidden">
                  {s.revealed && s.image ? (
                    <img
                      src={resolveIpfs(s.image)}
                      alt={s.name ?? `Agent #${tokenId}`}
                      className="w-full h-full object-contain [image-rendering:pixelated]"
                    />
                  ) : (
                    <>
                      <span className="text-[34px] text-ink/[0.12] leading-none select-none">?</span>
                      {!unlocked && (
                        <span className="absolute bottom-2.5 text-[7px] text-ink/30 tracking-widest">
                          LOCKED
                        </span>
                      )}
                    </>
                  )}
                </div>

                <div className="px-3 py-3 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] tabular-nums">
                      #{tokenId.toString().padStart(4, "0")}
                    </span>
                    <a
                      href={`https://robinhoodchain.blockscout.com/token/${EQUIX_ADDRESS}/instance/${tokenId}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[8px] text-ink/25 hover:text-sage transition-colors"
                      aria-label="View on explorer"
                    >
                      ↗
                    </a>
                  </div>

                  {s.revealed ? (
                    <>
                      <p className="text-[9px] text-ink/80 truncate">{s.name}</p>
                      <p className="text-[8px] text-sage mt-1">{s.role?.toUpperCase()}</p>
                    </>
                  ) : unlocked ? (
                    <button
                      onClick={() => setRevealing(tokenId)}
                      className="mt-auto w-full py-2.5 text-[9px] bg-ink text-cream hover:bg-sage transition-colors"
                    >
                      REVEAL
                    </button>
                  ) : (
                    <button
                      disabled
                      className="mt-auto w-full py-2.5 text-[9px] border border-ink/10 text-ink/25 cursor-not-allowed"
                    >
                      REVEAL SOON
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ---- countdown ---- */}
      {isConnected && hasAgents && (
        <div className="mt-14">
          <Countdown
            target={REVEAL_START}
            note="When reveal opens you'll choose a base, write five traits, assign a role and name your agent. Generate as many times as you like — confirming locks it forever."
          />
        </div>
      )}

      {revealing !== null && address && unlocked && (
        <RevealConsole
          tokenId={revealing}
          address={address}
          onRevealed={loadStatuses}
          onClose={() => setRevealing(null)}
        />
      )}
    </main>
  );
}
