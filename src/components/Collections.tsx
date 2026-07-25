import { motion } from "framer-motion";
import { Card } from "./ui/Card";
import { collections } from "@/lib/mockData";

export function Collections() {
  return (
    <section id="collections" className="max-w-6xl mx-auto px-6 py-20">
      <h2 className="font-pixel text-lg mb-14">Collections</h2>
      <div className="grid md:grid-cols-2 gap-6">
        {collections.map((c) => (
          <motion.div key={c.name} whileHover={{ y: -4 }} transition={{ duration: 0.15 }}>
            <Card className="p-6 h-full flex flex-col justify-between">
              <div>
                <h3 className="font-pixel text-xs mb-3">{c.name}</h3>
                <p className="text-sm text-ink/70 leading-relaxed">{c.description}</p>
              </div>
              <p className="font-pixel text-[10px] text-sage mt-6">
                {c.count} agents
              </p>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
