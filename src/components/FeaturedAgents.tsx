import { motion } from "framer-motion";
import { Card } from "./ui/Card";
import { Badge } from "./ui/Badge";
import { PixelAvatar } from "./PixelAvatar";
import { featuredAgents } from "@/lib/mockData";

export function FeaturedAgents() {
  return (
    <section id="explore" className="max-w-6xl mx-auto px-6 py-20">
      <h2 className="font-pixel text-lg mb-14">Featured Agents</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {featuredAgents.map((agent) => (
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
                <p className="text-xs text-ink/40 mt-auto pt-2 border-t border-border/50">
                  {agent.owner}
                </p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
