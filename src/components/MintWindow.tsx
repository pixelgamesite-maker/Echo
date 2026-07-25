import { useState } from "react";
import { Card } from "./ui/Card";
import { Link } from "react-router-dom";
import { Button } from "./ui/Button";

const EXAMPLES = [
  "Research assistant for crypto",
  "Security auditor",
  "Trading analyst",
  "Coding companion",
];

export function MintWindow() {
  const [prompt, setPrompt] = useState("");

  return (
    <section id="mint" className="max-w-3xl mx-auto px-6 py-20">
      <Card>
        <div className="border-b-2 border-border px-5 py-3 flex items-center gap-2">
          <span className="w-2.5 h-2.5 border border-border" />
          <span className="w-2.5 h-2.5 border border-border" />
          <span className="w-2.5 h-2.5 border border-border" />
          <span className="font-pixel text-[10px] ml-2 text-ink/70">
            Create Your Agent
          </span>
        </div>

        <div className="p-6 md:p-8">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the AI agent you want to create..."
            rows={5}
            className="w-full bg-transparent border-2 border-border px-4 py-3 text-base text-ink placeholder:text-ink/40 focus:outline-none focus:border-ink resize-none"
          />

          <div className="mt-4 flex flex-wrap gap-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                onClick={() => setPrompt(ex)}
                className="font-pixel text-[9px] border border-border px-3 py-2 text-ink/70 hover:text-ink hover:border-ink transition-colors duration-150"
              >
                {ex}
              </button>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/mint"><Button variant="secondary">Preview</Button></Link>
            <Link to="/mint"><Button variant="primary">Mint Agent</Button></Link>
          </div>
        </div>
      </Card>
    </section>
  );
}
