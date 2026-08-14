import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { WalletConnectButton } from "./WalletConnectButton";
import { Logo } from "./Logo";

const OPENSEA_COLLECTION = "https://opensea.io/collection/equix-ai-976744474/overview";

const LINKS = [
  { label: "Mint", href: OPENSEA_COLLECTION, external: true },
  { label: "Explore", to: "/#explore" },
  { label: "My Agents", to: "/my-agents" },
  { label: "Collections", to: "/#collections" },
  { label: "Docs", to: "/docs" },
  { label: "About", to: "/about" },
];

export function Navigation() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  function renderLink(link: typeof LINKS[number], mobile = false) {
    const cls = mobile
      ? "font-pixel text-[11px] text-ink hover:text-sage transition-colors"
      : "font-pixel text-[10px] transition-colors duration-150";

    if ("external" in link && link.external) {
      return (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noreferrer"
          onClick={() => mobile && setOpen(false)}
          className={`${cls} ${mobile ? "" : "text-ink hover:text-sage"}`}
        >
          {link.label} ↗
        </a>
      );
    }
    if (link.to!.startsWith("/#")) {
      return (
        <a
          key={link.label}
          href={link.to!.slice(1)}
          onClick={() => mobile && setOpen(false)}
          className={`${cls} ${mobile ? "" : "text-ink hover:text-sage"}`}
        >
          {link.label}
        </a>
      );
    }
    return (
      <Link
        key={link.label}
        to={link.to!}
        onClick={() => mobile && setOpen(false)}
        className={`${cls} ${
          mobile
            ? ""
            : location.pathname === link.to ? "text-sage" : "text-ink hover:text-sage"
        }`}
      >
        {link.label}
      </Link>
    );
  }

  return (
    <motion.header
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="sticky top-0 z-50 bg-cream border-b-2 border-border"
    >
      <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link to="/" onClick={() => setOpen(false)} aria-label="Equix home">
          <Logo />
        </Link>

        <nav className="hidden lg:flex items-center gap-8">
          {LINKS.map((l) => renderLink(l))}
          <WalletConnectButton />
        </nav>

        <button
          className="lg:hidden p-1 border-2 border-border hover:border-ink transition-colors"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X className="w-5 h-5" strokeWidth={1.5} /> : <Menu className="w-5 h-5" strokeWidth={1.5} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="lg:hidden overflow-hidden border-t-2 border-border bg-cream"
          >
            <div className="px-6 py-6 flex flex-col gap-5">
              {LINKS.map((l) => renderLink(l, true))}
              <div className="pt-2 border-t border-border">
                <WalletConnectButton />
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
