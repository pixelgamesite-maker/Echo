import { Card } from "@/components/ui/Card";

const SECTIONS = [
  {
    title: "What is Echo?",
    body: "Echo is a prompt-to-mint collection on Robinhood Chain. You pick a base, describe five traits in your own words, and the Echo engine generates a unique pixel agent. What you preview is exactly what you mint — the image and its metadata are pinned to IPFS and locked to your token forever.",
  },
  {
    title: "Bases",
    body: "Every agent starts from one of four fixed bases: Male, Female, Robot, or Pet. The base sets the silhouette and proportions. Your trait prompts never change the base shape — they style what sits on top of it.",
  },
  {
    title: "Traits",
    body: "Five freeform fields: Hair, Eyes (mood), Mouth, Cloth, and Accessories. Up to 30 characters each, plain words only. Your exact words are written into the token's metadata as attributes, so marketplaces can filter and rank them.",
  },
  {
    title: "The palette",
    body: "Every agent is exactly three colors: cream background, ink base, sage details. The generation pipeline enforces this on every mint — no gradients, no color drift, no off-style agents. The details rendered in sage are the parts you prompted.",
  },
  {
    title: "Minting",
    body: "Previews are free and rate-limited per wallet. When you mint, the backend pins your agent to IPFS and signs it; the contract only accepts backend-signed metadata, so nobody can mint arbitrary images into the collection. Mint price is 0.002 ETH on Robinhood Chain.",
  },
  {
    title: "Supply and fairness",
    body: "5,555 agents. Max 10 per wallet. Supply can be reduced by the team but never increased — that rule is enforced by the contract itself. Every signature is single-use, and every preview expires after 15 minutes.",
  },
  {
    title: "Verifying your agent",
    body: "Each agent links to Robinhood Chain's block explorer from your My Agents page. Metadata and images live on IPFS, independent of this website.",
  },
];

export default function DocsPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-14">
      <h1 className="font-pixel text-xl mb-3">Docs</h1>
      <p className="text-ink/70 mb-12">Everything you need to know before minting.</p>

      <div className="flex flex-col gap-6">
        {SECTIONS.map((s) => (
          <Card key={s.title} className="p-6 md:p-8">
            <h2 className="font-pixel text-[12px] mb-4">{s.title}</h2>
            <p className="text-[15px] leading-relaxed text-ink/80">{s.body}</p>
          </Card>
        ))}
      </div>

      <p className="font-pixel text-[9px] text-ink/40 mt-12 leading-loose">
        Contract address and audit links will be published here before mint opens.
      </p>
    </main>
  );
}
