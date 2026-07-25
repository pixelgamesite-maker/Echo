import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { WalletConnectButton } from "./WalletConnectButton";

const LINKS = [
  { label: "Mint", to: "/mint" },
  { label: "Explore", to: "/#explore" },
  { label: "My Agents", to: "/my-agents" },
  { label: "Collections", to: "/#collections" },
  { label: "Docs", to: "/docs" },
  { label: "About", to: "/about" },
];

export function Navigation() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <motion.header
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="sticky top-0 z-50 bg-cream border-b-2 border-border"
    >
      <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link to="/" className="font-pixel text-sm" onClick={() => setOpen(false)}>
          Echo
        </Link>

        {/* Desktop links */}
        <nav className="hidden lg:flex items-center gap-8">
          {LINKS.map((link) =>
            link.to.startsWith("/#") ? (
              <a
                key={link.label}
                href={link.to.slice(1)}
                className="font-pixel text-[10px] text-ink hover:text-sage transition-colors duration-150"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.label}
                to={link.to}
                className={`font-pixel text-[10px] transition-colors duration-150 ${
                  location.pathname === link.to ? "text-sage" : "text-ink hover:text-sage"
                }`}
              >
                {link.label}
              </Link>
            )
          )}
          <WalletConnectButton />
        </nav>

        {/* Hamburger — right side, mobile/tablet */}
        <button
          className="lg:hidden p-1 border-2 border-border hover:border-ink transition-colors"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X className="w-5 h-5" strokeWidth={1.5} /> : <Menu className="w-5 h-5" strokeWidth={1.5} />}
        </button>
      </div>

      {/* Mobile menu panel */}
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
              {LINKS.map((link) =>
                link.to.startsWith("/#") ? (
                  <a
                    key={link.label}
                    href={link.to.slice(1)}
                    onClick={() => setOpen(false)}
                    className="font-pixel text-[11px] text-ink hover:text-sage transition-colors"
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.label}
                    to={link.to}
                    onClick={() => setOpen(false)}
                    className="font-pixel text-[11px] text-ink hover:text-sage transition-colors"
                  >
                    {link.label}
                  </Link>
                )
              )}
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
