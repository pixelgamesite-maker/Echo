import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAccount, useReadContract } from "wagmi";
import { readContract } from "wagmi/actions";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { WalletConnectButton } from "@/components/WalletConnectButton";
import { ECHO_ADDRESS, echoAbi, resolveIpfs } from "@/lib/contract";
import { wagmiConfig } from "@/lib/wagmiConfig";

type Attribute = { trait_type: string; value: string };
type Metadata = { name: string; image: string; attributes: Attribute[] };
type AgentCard = { tokenId: bigint; meta: Metadata | null; loading: boolean };

export default function MyAgentsPage() {
  const { address, isConnected } = useAccount();
  const [cards, setCards] = useState<AgentCard[]>([]);

  const { data: tokenIds, isLoading } = useReadContract({
    address: ECHO_ADDRESS,
    abi: echoAbi,
    functionName: "tokensOfOwner",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  useEffect(() => {
    const ids = (tokenIds as bigint[] | undefined) ?? [];
    if (ids.length === 0) {
      setCards([]);
      return;
    }
    setCards(ids.map((tokenId) => ({ tokenId, meta: null, loading: true })));
    ids.forEach(async (tokenId) => {
      try {
        const uri = (await readContract(wagmiConfig, {
          address: ECHO_ADDRESS,
          abi: echoAbi,
          functionName: "tokenURI",
          args: [tokenId],
        })) as string;
        const meta: Metadata = await fetch(resolveIpfs(uri)).then((r) => r.json());
        setCards((prev) =>
          prev.map((c) => (c.tokenId === tokenId ? { ...c, meta, loading: false } : c))
        );
      } catch {
        setCards((prev) =>
          prev.map((c) => (c.tokenId === tokenId ? { ...c, loading: false } : c))
        );
      }
    });
  }, [tokenIds]);

  return (
    <main className="max-w-6xl mx-auto px-6 py-14">
      <div className="flex items-baseline justify-between mb-12">
        <h1 className="font-pixel text-xl">My Agents</h1>
        {isConnected && tokenIds !== undefined && (
          <span className="font-pixel text-[10px] text-ink/50">
            {(tokenIds as bigint[]).length} owned
          </span>
        )}
      </div>

      {!isConnected && (
        <div className="border-2 border-dashed border-border p-16 text-center">
          <p className="font-pixel text-[11px] text-ink/60 mb-6">
            Connect your wallet to see your agents.
          </p>
          <WalletConnectButton />
        </div>
      )}

      {isConnected && isLoading && (
        <p className="font-pixel text-[11px] text-sage">reading chain…</p>
      )}

      {isConnected && !isLoading && cards.length === 0 && (
        <div className="border-2 border-dashed border-border p-16 text-center">
          <p className="font-pixel text-[11px] text-ink/60 mb-6">No agents yet.</p>
          <Link to="/mint">
            <Button variant="primary">Mint your first agent</Button>
          </Link>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {cards.map((c) => (
          <Card key={c.tokenId.toString()} className="overflow-hidden">
            <div className="aspect-square bg-ink/[0.03] border-b-2 border-border flex items-center justify-center">
              {c.loading ? (
                <span className="w-2 h-2 bg-sage animate-pulse" />
              ) : c.meta ? (
                <img
                  src={resolveIpfs(c.meta.image)}
                  alt={c.meta.name}
                  className="w-full h-full object-contain [image-rendering:pixelated]"
                />
              ) : (
                <span className="font-pixel text-[9px] text-ink/40">failed to load</span>
              )}
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-pixel text-[10px]">#{c.tokenId.toString()}</span>
                {c.meta && (
                  <a
                    href={`https://robinhoodchain.blockscout.com/token/${ECHO_ADDRESS}/instance/${c.tokenId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-pixel text-[8px] text-sage hover:underline"
                  >
                    explorer ↗
                  </a>
                )}
              </div>
              {c.meta && (
                <dl className="text-xs flex flex-col gap-1">
                  {c.meta.attributes.map((a) => (
                    <div key={a.trait_type} className="flex justify-between">
                      <dt className="text-ink/50">{a.trait_type}</dt>
                      <dd className="text-ink">{a.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
          </Card>
        ))}
      </div>
    </main>
  );
}
