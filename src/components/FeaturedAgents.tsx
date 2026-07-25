import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useReadContract } from "wagmi";
import { readContract } from "wagmi/actions";
import { Card } from "./ui/Card";
import { Badge } from "./ui/Badge";
import { PixelAvatar } from "./PixelAvatar";
import { ECHO_ADDRESS, echoAbi, resolveIpfs } from "@/lib/contract";
import { wagmiConfig } from "@/lib/wagmiConfig";
import { featuredAgents as mockAgents } from "@/lib/mockData";

const SHOW = 6;

type LiveAgent = {
  tokenId: bigint;
  image: string | null;
  base: string;
};

export function FeaturedAgents() {
  const [live, setLive] = useState<LiveAgent[] | null>(null);

  const { data: totalMinted } = useReadContract({
    address: ECHO_ADDRESS,
    abi: echoAbi,
    functionName: "totalMinted",
    query: { enabled: !!ECHO_ADDRESS },
  });

  useEffect(() => {
    const total = totalMinted as bigint | undefined;
    if (!total || total === 0n) return;

    (async () => {
      const count = Number(total);
      const ids = Array.from(
        { length: Math.min(SHOW, count) },
        (_, i) => BigInt(count - 1 - i)
      );
      const agents = await Promise.all(
        ids.map(async (tokenId): Promise<LiveAgent> => {
          try {
            const uri = (await readContract(wagmiConfig, {
              address: ECHO_ADDRESS,
              abi: echoAbi,
              functionName: "tokenURI",
              args: [tokenId],
            })) as string;
            const meta = await fetch(resolveIpfs(uri)).then((r) => r.json());
            const base =
              meta.attributes?.find((a: any) => a.trait_type === "Base")?.value ?? "agent";
            return { tokenId, image: resolveIpfs(meta.image), base };
          } catch {
            return { tokenId, image: null, base: "agent" };
          }
        })
      );
      setLive(agents.filter((a) => a.image));
    })();
  }, [totalMinted]);

  const isLive = live !== null && live.length > 0;

  return (
    <section id="explore" className="max-w-6xl mx-auto px-6 py-20">
      <div className="flex items-baseline justify-between mb-14">
        <h2 className="font-pixel text-lg">
          {isLive ? "Latest Agents" : "Featured Agents"}
        </h2>
        {isLive && (
          <span className="font-pixel text-[9px] text-sage">live from chain</span>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {isLive
          ? live.map((agent) => (
              <motion.div key={agent.tokenId.toString()} whileHover={{ y: -4 }} transition={{ duration: 0.15 }}>
                <Card className="overflow-hidden h-full flex flex-col">
                  <div className="aspect-square bg-ink/[0.03] border-b-2 border-border">
                    <img
                      src={agent.image!}
                      alt={`Agent #${agent.tokenId}`}
                      className="w-full h-full object-contain [image-rendering:pixelated]"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <span className="font-pixel text-[10px]">
                      #{agent.tokenId.toString().padStart(4, "0")}
                    </span>
                    <Badge>{agent.base}</Badge>
                  </div>
                </Card>
              </motion.div>
            ))
          : mockAgents.map((agent) => (
              <motion.div key={agent.id} whileHover={{ y: -4 }} transition={{ duration: 0.15 }}>
                <Card className="overflow-hidden h-full flex flex-col">
                  <div className="aspect-square bg-ink/[0.03] border-b-2 border-border p-8">
                    <PixelAvatar seed={agent.id} />
                  </div>
                  <div className="p-4 flex-1 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="font-pixel text-[10px]">{agent.number}</span>
                      <Badge>{agent.rarity}</Badge>
                    </div>
                    <p className="text-sm font-medium">{agent.role}</p>
                    <p className="text-xs text-ink/60">{agent.generation}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
      </div>
    </section>
  );
}
