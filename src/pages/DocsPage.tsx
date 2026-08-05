import { Card } from "@/components/ui/Card";
import { EQUIX_ADDRESS } from "@/lib/contract";

const LIVE = [
  {
    title: "What is Equix?",
    body: "Equix is a collection of 9,491 animated pixel agent identities on Robinhood Chain. Each agent is a one-of-one character rendered in a fixed three-colour palette. The artwork gives every agent a face; what it becomes from there is up to its handler.",
  },
  {
    title: "The mint",
    body: "Fully public. 0.0004 ETH per agent, maximum 50 per wallet. No presale, no allowlist, no whitelist phases. Choose your quantity, confirm one transaction, and your agents land directly in your wallet.",
  },
  {
    title: "Reveal",
    body: "Agents mint with placeholder art and reveal after the mint closes. Until then, every token shows the same holding image. Once reveal runs, each token's metadata points to its own unique artwork — permanently.",
  },
  {
    title: "The art",
    body: "Every agent is exactly three colours: cream background, ink silhouette, sage detail. Four base types — male, female, robot and pet — each with distinct variants. The palette is enforced across the entire collection, so no agent ever drifts off-style.",
  },
  {
    title: "Ownership",
    body: "Your agents appear on the My Agents page, read directly from the contract. Each links to Robinhood Chain's block explorer, and artwork lives on IPFS — independent of this website. Agents are freely tradable on OpenSea.",
  },
  {
    title: "Contract",
    body: `Deployed on Robinhood Chain at ${EQUIX_ADDRESS}. Supply, price, wallet limit and mint status are all readable on-chain — every number shown on this site is pulled live from the contract, not hardcoded.`,
  },
];

const ROADMAP = [
  {
    title: "Intent",
    body: "Handlers will be able to assign their agent an objective — what it should focus on and what outcome it works toward. An agent with a purpose behaves differently from a generic assistant.",
  },
  {
    title: "Context and training",
    body: "Over time, handlers will be able to give agents sources, examples, preferences and feedback. A trained agent and a fresh agent will not be the same thing — usefulness will be built through repeated use.",
  },
  {
    title: "Permissions",
    body: "Agents will begin in inform-only mode: able to monitor, research and report, but not to transact. Any expansion of access will be explicit and controlled by the handler. Owning an agent will never grant it unrestricted wallet access.",
  },
  {
    title: "Agent classes",
    body: "Scout, research, trading, minting, dev/ops, or something shaped entirely around a handler's own workflow. Classes will be starting directions, not permanent restrictions.",
  },
  {
    title: "The Corner Shop",
    body: "A dedicated secondary market for trained agents, where what's sold is the identity plus the transferable profile its owner approves. Private strategies and credentials will never transfer automatically with the token.",
  },
];

export default function DocsPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-14">
      <h1 className="font-pixel text-xl mb-3">DOCS</h1>
      <p className="text-ink/60 mb-14 text-[15px]">
        Everything you need to know before minting.
      </p>

      <div className="flex items-center gap-3 mb-6">
        <span className="w-1.5 h-1.5 bg-sage" />
        <h2 className="font-pixel text-[11px] text-sage">LIVE NOW</h2>
      </div>

      <div className="flex flex-col gap-5 mb-16">
        {LIVE.map((s) => (
          <Card key={s.title} className="p-6 md:p-8">
            <h3 className="font-pixel text-[12px] mb-4">{s.title}</h3>
            <p className="text-[15px] leading-relaxed text-ink/80 break-words">
              {s.body}
            </p>
          </Card>
        ))}
      </div>

      <div className="flex items-center gap-3 mb-3">
        <span className="w-1.5 h-1.5 border border-ink/30" />
        <h2 className="font-pixel text-[11px] text-ink/50">ROADMAP</h2>
      </div>
      <p className="text-[13px] text-ink/50 mb-6 leading-relaxed">
        The following describes where Equix is going. None of it is live at
        mint — it is direction, not a shipped feature. No fixed dates.
      </p>

      <div className="flex flex-col gap-5">
        {ROADMAP.map((s) => (
          <Card key={s.title} className="p-6 md:p-8 border-dashed">
            <h3 className="font-pixel text-[12px] mb-4 text-ink/70">{s.title}</h3>
            <p className="text-[15px] leading-relaxed text-ink/70">{s.body}</p>
          </Card>
        ))}
      </div>

      <p className="font-pixel text-[9px] text-ink/40 mt-14 leading-loose">
        NFTS ARE HIGH RISK AND VALUES CAN GO TO ZERO. NOTHING HERE IS
        FINANCIAL ADVICE. ONLY SPEND WHAT YOU CAN AFFORD TO LOSE.
      </p>
    </main>
  );
}
