import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAccount, useReadContract } from "wagmi";
import { readContract } from "wagmi/actions";
import { Button } from "@/components/ui/Button";
import { WalletConnectButton } from "@/components/WalletConnectButton";
import { EQUIX_ADDRESS, equixAbi, resolveIpfs } from "@/lib/contract";
import { wagmiConfig } from "@/lib/wagmiConfig";

type Metadata = { name?: string; image?: string };
type AgentCard = { tokenId: bigint; meta: Metadata | null; loading: boolean };

export default function MyAgentsPage() {
  const { address, isConnected } = useAccount();
  const [cards, setCards] = useState<AgentCard[]>([]);

  const { data: revealed } = useReadContract({
    address: EQUIX_ADDRESS, abi: equixAbi, functionName: "revealed",
    query: { enabled: !!EQUIX_ADDRESS },
  });

  // Contract now exposes tokensOfOwner() — no event scanning needed.
  const { data: tokenIds, isLoading } = useReadContract({
    address: EQUIX_ADDRESS, abi: equixAbi, functionName: "tokensOfOwner",
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 20_000 },
  });

  useEffect(() => {
    const ids = (tokenIds as readonly bigint[] | undefined) ?? [];
    if (ids.length === 0) { setCards([]); return; }

    setCards(ids.map((tokenId) => ({ tokenId, meta: null, loading: true })));

    ids.forEach(async (tokenId) => {
      try {
        const uri = (await readContract(wagmiConfig, {
          address: EQUIX_ADDRESS, abi: equixAbi,
          functionName: "tokenURI", args: [tokenId],
        })) as string;
        const meta: Metadata = await fetch(resolveIpfs(uri)).then((r) => r.json());
        setCards((prev) => prev.map((c) =>
          c.tokenId === tokenId ? { ...c, meta, loading: false } : c));
      } catch {
        setCards((prev) => prev.map((c) =>
          c.tokenId === tokenId ? { ...c, loading: false } : c));
      }
    });
  }, [tokenIds]);

  return (
    <main className="max-w-2xl mx-auto px-6 py-14 font-pixel">
      <div className="flex items-baseline justify-between mb-4">
        <h1 className="text-[18px]">MY AGENTS</h1>
        {isConnected && !isLoading && (
          <span className="text-[10px] text-ink/50">{cards.length} OWNED</span>
        )}
      </div>

      {isConnected && revealed === false && (
        <p className="text-[10px] text-sage mb-8 leading-relaxed">
          IDENTITIES NOT YET REVEALED — PLACEHOLDER ART SHOWN UNTIL REVEAL.
        </p>
      )}

      {!isConnected && (
        <div className="border border-dashed border-border p-16 text-center mt-8">
          <p className="text-[11px] text-ink/60 mb-6">CONNECT YOUR WALLET TO SEE YOUR AGENTS.</p>
          <div className="flex justify-center"><WalletConnectButton /></div>
        </div>
      )}

      {isConnected && isLoading && (
        <p className="text-[11px] text-sage mt-8">READING CHAIN…</p>
      )}

      {isConnected && !isLoading && cards.length === 0 && (
        <div className="border border-dashed border-border p-16 text-center mt-8">
          <p className="text-[11px] text-ink/60 mb-6">NO AGENTS YET.</p>
          <Link to="/mint"><Button variant="primary">MINT YOUR FIRST AGENT</Button></Link>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-5 mt-8">
        {cards.map((c) => (
          <div key={c.tokenId.toString()} className="border border-border">
            <div className="aspect-square bg-ink/[0.03] border-b border-border flex items-center justify-center">
              {c.loading ? (
                <span className="w-2 h-2 bg-sage animate-pulse" />
              ) : c.meta?.image ? (
                <img src={resolveIpfs(c.meta.image)}
                     alt={c.meta.name ?? `Agent #${c.tokenId}`}
                     className="w-full h-full object-contain [image-rendering:pixelated]" />
              ) : (
                <span className="text-[9px] text-ink/40">NO IMAGE</span>
              )}
            </div>
            <div className="p-3 flex items-center justify-between">
              <span className="text-[10px]">#{c.tokenId.toString().padStart(4, "0")}</span>
              <a
                href={`https://robinhoodchain.blockscout.com/token/${EQUIX_ADDRESS}/instance/${c.tokenId}`}
                target="_blank" rel="noreferrer"
                className="text-[8px] text-ink/40 hover:text-sage transition-colors"
              >
                ↗
              </a>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
