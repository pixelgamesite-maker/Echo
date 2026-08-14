import { useEffect } from "react";

const OPENSEA_COLLECTION = "https://opensea.io/collection/equix-ai-976744474/overview";

// Minting moved to OpenSea's own minting tool, on a different contract
// than this page used to write to. Rather than a page with a click-through
// link, this now redirects automatically the moment someone lands here —
// catches old bookmarks, shared links, and search results pointing at /mint.
export default function MintPage() {
  useEffect(() => {
    window.location.replace(OPENSEA_COLLECTION);
  }, []);

  return (
    <main className="max-w-xl mx-auto px-6 py-24 font-pixel text-center">
      <p className="text-[12px] text-sage mb-4">REDIRECTING TO OPENSEA…</p>
      <a
        href={OPENSEA_COLLECTION}
        className="text-[11px] text-ink/50 hover:text-sage transition-colors underline"
      >
        Click here if you're not redirected automatically
      </a>
    </main>
  );
}
