import {
  Search, TrendingUp, Code, Shield, PenTool,
  Gamepad2, Megaphone, Coins, Sparkles,
} from "lucide-react";
import { categories } from "@/lib/mockData";

const ICONS: Record<string, typeof Search> = {
  search: Search,
  "trending-up": TrendingUp,
  code: Code,
  shield: Shield,
  "pen-tool": PenTool,
  "gamepad-2": Gamepad2,
  megaphone: Megaphone,
  coins: Coins,
  sparkles: Sparkles,
};

export function Categories() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20">
      <h2 className="font-pixel text-lg mb-14">Categories</h2>
      <div className="grid grid-cols-3 md:grid-cols-9 gap-4">
        {categories.map((cat) => {
          const Icon = ICONS[cat.icon];
          return (
            <div
              key={cat.name}
              className="border-2 border-border p-4 flex flex-col items-center gap-3 hover:border-ink transition-colors duration-150"
            >
              <Icon className="w-5 h-5" strokeWidth={1.5} />
              <span className="font-pixel text-[8px] text-center leading-relaxed">
                {cat.name}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
