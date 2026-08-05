import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAccount, useReadContract } from "wagmi";
import { getLogs, readContract } from "wagmi/actions";
import { Button } from "@/components/ui/Button";
import { WalletConnectButton } from "@/components/WalletConnectButton";
import { EQUIX_ADDRESS, equixAbi, resolveIpfs } from "@/lib/contract";
import { wagmiConfig } from "@/lib/wagmiConfig";

const ZERO = "0x0000000000000000000000000000000000000000";

type Metadata = { name?: string; image?: string; attributes?: { trait_type: string; value: string }[] };
type AgentCard = { tokenId: bigint; meta: Metadata | null; loading: boolean };

export default function MyAgentsPage() {
  const { address, isConnected } = useAccount();
  const [cards, setCards] = useState<AgentCard[]>([]);
  const [scanning, setScanning] = useState(false);

  const { data: revealed } = useReadContract({
    address: EQUIX_ADDRESS,
    abi: equixAbi,
    functionName: "revealed",
    query: { enabled: !!EQUIX_ADDRESS },
  });

  useEffect(() => {
    if (!address || !EQUIX_ADDRESS) return;

    (async () => {
      setScanning(true);
      try {
        // This contract has no tokensOfOwner() — reconstruct ownership by
        // scanning Transfer logs sent to this wallet, then confirming
        // current ownership per token (in case any were resold since).
        const logs = await getLogs(wagmiConfig, {
          address: EQUIX_ADDRESS,
          event: {
            type: "event",
            name: "Transfer",
            inputs: [
              { indexed: true, name: "from", type: "address" },
              { indexed: true, name: "to", type: "address" },
              { indexed: true, name: "tokenId", type: "uint256" },
            ],
          },
          args: { to: address },
          fromBlock: 0n,
          toBlock: "latest",
        });

        const candidateIds = [...new Set(logs.map((l) => (l.args as any).tokenId as bigint))];

        const owned: bigint[] = [];
        await Promise.all(
          candidateIds.map(async (id) => {
            try {
              const currentOwner = (await readContract(wagmiConfig, {
                address: EQUIX_ADDRESS,
                abi: equixAbi,
                functionName: "ownerOf",
                args: [id],
              })) as string;
              if (currentOwner.toLowerCase() === address.toLowerCase()) owned.push(id);
            } catch {
              // token burned or query failed — skip
            }
          })
        );

        owned.sort((a, b) => Number(a - b));
        setCards(owned.map((tokenId) => ({ tokenId, meta: null, loading: true })));

        owned.forEach(async (tokenId) => {
          try {
            const uri = (await readContract(wagmiConfig, {
              address: EQUIX_ADDRESS,
              abi: equixAbi,
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
      } finally {
        setScanning(false);
      }
    })();
  }, [address]);

  return (
    <main className="max-w-2xl mx-auto px-6 py-14 font-pixel">
      <div className="flex items-baseline justify-between mb-4">
        <h1 className="text-[18px]">MY AGENTS</h1>
        {isConnected && !scanning && (
          <span className="text-[10px] text-ink/50">{cards.length} owned</span>
        )}
      </div>

      {!revealed && isConnected && (
        <p className="text-[10px] text-sage mb-8">
          Identities have not revealed yet — images show placeholder art until reveal.
        </p>
      )}

      {!isConnected && (
        <div className="border border-dashed border-border p-16 text-center mt-8">
          <p className="text-[11px] text-ink/60 mb-6">Connect your wallet to see your agents.</p>
          <WalletConnectButton />
        </div>
      )}

      {isConnected && scanning && (
        <p className="text-[11px] text-sage mt-8">scanning chain for your agents…</p>
      )}

      {isConnected && !scanning && cards.length === 0 && (
        <div className="border border-dashed border-border p-16 text-center mt-8">
          <p className="text-[11px] text-ink/60 mb-6">No agents yet.</p>
          <Link to="/mint"><Button variant="primary">Mint your first agent</Button></Link>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-8">
        {cards.map((c) => (
          <div key={c.tokenId.toString()} className="border border-border">
            <div className="aspect-square bg-ink/[0.03] border-b border-border flex items-center justify-center">
              {c.loading ? (
                <span className="w-2 h-2 bg-sage animate-pulse" />
              ) : c.meta?.image ? (
                <img
                  src={resolveIpfs(c.meta.image)}
                  alt={c.meta.name ?? `Agent #${c.tokenId}`}
                  className="w-full h-full object-contain [image-rendering:pixelated]"
                />
              ) : (
                <span className="text-[9px] text-ink/40">no image</span>
              )}
            </div>
            <div className="p-3">
              <span className="text-[10px]">#{c.tokenId.toString().padStart(4, "0")}</span>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
