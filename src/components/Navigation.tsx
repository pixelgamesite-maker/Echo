import { motion } from "framer-motion";
import { Button } from "./ui/Button";

const LINKS = ["Mint", "Explore", "Collections", "Docs"];

export function Navigation() {
  return (
    <motion.header
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="sticky top-0 z-50 bg-cream/95 backdrop-blur-none border-b-2 border-border"
    >
      <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <span className="font-pixel text-sm">Echo</span>

        <nav className="hidden md:flex items-center gap-8">
          {LINKS.map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              className="font-pixel text-[10px] text-ink hover:text-sage transition-colors duration-150"
            >
              {link}
            </a>
          ))}
          <Button variant="secondary" className="text-[10px] px-4 py-2.5">
            Connect Wallet
          </Button>
        </nav>
      </div>
    </motion.header>
  );
}
