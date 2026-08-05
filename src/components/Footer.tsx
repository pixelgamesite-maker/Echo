import { Link } from "react-router-dom";
import { Logo } from "./Logo";
import { EQUIX_ADDRESS } from "@/lib/contract";

const EXTERNAL = [
  { label: "X", href: "https://x.com/equixAI" },
  {
    label: "EXPLORER",
    href: `https://robinhoodchain.blockscout.com/address/${EQUIX_ADDRESS}`,
  },
  { label: "OPENSEA", href: "https://opensea.io/collection/equix-ai" },
];

const INTERNAL = [
  { label: "MINT", to: "/mint" },
  { label: "MY AGENTS", to: "/my-agents" },
  { label: "DOCS", to: "/docs" },
  { label: "ABOUT", to: "/about" },
];

export function Footer() {
  return (
    <footer className="border-t border-border mt-20">
      <div className="max-w-4xl mx-auto px-6 py-14 flex flex-col md:flex-row md:justify-between gap-10">
        <div>
          <Logo />
          <p className="mt-4 font-pixel text-[10px] text-ink/50 leading-loose max-w-xs">
            9,491 ANIMATED AGENT IDENTITIES
            <br />
            ON ROBINHOOD CHAIN
          </p>
        </div>

        <div className="flex gap-14">
          <nav className="flex flex-col gap-3">
            <span className="font-pixel text-[9px] text-ink/30 mb-1">SITE</span>
            {INTERNAL.map((l) => (
              <Link
                key={l.label}
                to={l.to}
                className="font-pixel text-[10px] text-ink/60 hover:text-sage transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <nav className="flex flex-col gap-3">
            <span className="font-pixel text-[9px] text-ink/30 mb-1">LINKS</span>
            {EXTERNAL.map((l) => (
              <a
                key={l.label}
                href={l.href}
                target="_blank"
                rel="noreferrer"
                className="font-pixel text-[10px] text-ink/60 hover:text-sage transition-colors"
              >
                {l.label} ↗
              </a>
            ))}
          </nav>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="max-w-4xl mx-auto px-6 py-5 flex flex-col sm:flex-row justify-between gap-2">
          <p className="font-pixel text-[9px] text-ink/30">
            © {new Date().getFullYear()} EQUIX AI
          </p>
          <p className="font-pixel text-[9px] text-ink/30 break-all">
            {EQUIX_ADDRESS.slice(0, 10)}…{EQUIX_ADDRESS.slice(-8)}
          </p>
        </div>
      </div>
    </footer>
  );
}
