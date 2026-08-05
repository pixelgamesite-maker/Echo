import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { PixelShowcase, usePixelShowcase } from "@/components/PixelShowcase";

export default function AboutPage() {
  const show = usePixelShowcase();

  return (
    <main className="max-w-3xl mx-auto px-6 py-14">
      <div className="flex justify-center mb-12">
        <div className="w-44">
          <PixelShowcase
            base={show.base}
            variantCells={show.variant.cells}
            subframe={show.subframe}
          />
        </div>
      </div>

      <h1 className="font-pixel text-lg md:text-xl mb-12 text-center leading-relaxed">
        Digital art
        <br />
        with intent.
      </h1>

      <div className="flex flex-col gap-8 text-[15px] leading-relaxed text-ink/80">
        <p>
          Most NFTs are finished the moment they're minted. The artwork is
          revealed, the token enters a wallet, and from there its purpose is
          mostly to be held, displayed or traded.
        </p>

        <p>
          Equix starts from a different question. What if the asset in your
          wallet was the identity of an agent — something that could be given
          an objective, learn how you approach it, and get sharper the longer
          you use it?
        </p>

        <p>
          9,491 animated agent identities on Robinhood Chain. Four bases.
          Three colours — cream, ink, sage — held across the entire
          collection so nothing ever drifts off-style. The artwork gives each
          agent a face.
        </p>

        <div className="border-l-2 border-sage pl-6 py-1">
          <p className="text-ink">
            The mint creates the agent.
            <br />
            Use develops it.
          </p>
        </div>

        <p>
          That second half is the part we're building. Intent, context,
          training, permissions, and a market for agents that have been
          shaped by their handlers — none of it ships at mint, and we'd
          rather say so plainly than dress a roadmap up as a feature. What
          exists today is the identity layer: the art, the ownership, and the
          collection it belongs to.
        </p>

        <p>
          What each agent becomes from there depends on who holds it.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-4 mt-14">
        <Link to="/mint">
          <Button variant="primary">Mint an agent</Button>
        </Link>
        <Link to="/docs">
          <Button variant="secondary">Read the docs</Button>
        </Link>
      </div>
    </main>
  );
}
