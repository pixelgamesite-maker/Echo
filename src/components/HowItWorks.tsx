import { PenLine, Cpu, Sparkles, Lock } from "lucide-react";
import { Card } from "./ui/Card";

const STEPS = [
  { icon: PenLine, title: "Write a prompt." },
  { icon: Cpu, title: "Echo interprets your idea." },
  { icon: Sparkles, title: "A unique pixel AI Agent is generated." },
  { icon: Lock, title: "Mint permanently on Robinhood Chain." },
];

export function HowItWorks() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20">
      <h2 className="font-pixel text-lg mb-14">How It Works</h2>
      <div className="grid md:grid-cols-4 gap-6">
        {STEPS.map((step, i) => (
          <Card key={step.title} className="p-6 flex flex-col items-start">
            <span className="font-pixel text-[10px] text-sage">
              STEP {i + 1}
            </span>
            <step.icon className="w-6 h-6 my-5" strokeWidth={1.5} />
            <p className="text-sm leading-relaxed">{step.title}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
