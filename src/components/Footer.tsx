const LINKS = ["Robinhood Chain", "Docs", "X", "Discord", "GitHub"];

export function Footer() {
  return (
    <footer className="border-t-2 border-border">
      <div className="max-w-6xl mx-auto px-6 py-16 flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div>
          <span className="font-pixel text-sm">Echo</span>
          <p className="mt-4 text-sm text-ink/70 leading-relaxed max-w-xs">
            Prompt an Agent.
            <br />
            Mint it Forever.
          </p>
        </div>

        <nav className="flex flex-wrap gap-6">
          {LINKS.map((link) => (
            <a
              key={link}
              href="#"
              className="font-pixel text-[9px] text-ink/70 hover:text-ink transition-colors duration-150"
            >
              {link}
            </a>
          ))}
        </nav>
      </div>
      <div className="border-t border-border">
        <p className="max-w-6xl mx-auto px-6 py-5 text-xs text-ink/40">
          © {new Date().getFullYear()} Echo. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
