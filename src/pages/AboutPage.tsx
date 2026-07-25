import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { PixelAgent } from "@/components/PixelAgent";

export default function AboutPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-14">
      <div className="flex justify-center mb-14">
        <div className="w-40"><PixelAgent /></div>
      </div>

      <h1 className="font-pixel text-xl mb-10 text-center leading-relaxed">
        Prompt an Agent.<br />Mint it Forever.
      </h1>

      <div className="flex flex-col gap-8 text-[15px] leading-relaxed text-ink/80">
        <p>
          Most PFP collections hand you a randomized combination of pre-made
          layers. Echo doesn't. Every agent begins as a sentence — your words,
          typed into five trait fields — and ends as a one-of-one pixel
          character generated from exactly that prompt.
        </p>
        <p>
          The constraint is the craft. Four fixed bases keep every agent
          unmistakably part of the same family. Three colors — cream, ink,
          sage — keep the collection calm and coherent. What changes between
          agents is only what you chose to write.
        </p>
        <p>
          Echo lives on Robinhood Chain. Images and metadata are pinned to
          IPFS, attributes are your literal words, and the contract only
          accepts artwork produced by the Echo engine — so the collection can
          never drift off-style, and your agent can never be regenerated or
          replaced.
        </p>
        <p>
          One prompt. One agent. Once.
        </p>
      </div>

      <div className="flex justify-center gap-4 mt-14">
        <Link to="/mint"><Button variant="primary">Mint Agent</Button></Link>
        <Link to="/"><Button variant="secondary">Back home</Button></Link>
      </div>
    </main>
  );
}
