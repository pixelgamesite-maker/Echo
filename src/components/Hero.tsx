import { motion } from "framer-motion";
import { Button } from "./ui/Button";
import { PixelAgent } from "./PixelAgent";

const OPENSEA_COLLECTION = "https://opensea.io/collection/equix-ai-976744474/overview";

export function Hero() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20 md:py-32 grid md:grid-cols-2 gap-16 items-center">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
      >
        <h1 className="font-pixel text-2xl md:text-4xl leading-relaxed md:leading-relaxed">
          Prompt an Agent.
          <br />
          Mint it Forever.
        </h1>
        <p className="mt-8 text-base md:text-lg text-ink/80 max-w-md leading-relaxed">
          Every prompt creates a unique AI Agent permanently minted on
          Robinhood Chain.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <a href={OPENSEA_COLLECTION} target="_blank" rel="noreferrer">
            <Button variant="primary">Mint on OpenSea</Button>
          </a>
          <a href="#explore"><Button variant="secondary">Explore Agents</Button></a>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.25 }}
        className="flex justify-center"
      >
        <PixelAgent />
      </motion.div>
    </section>
  );
}
