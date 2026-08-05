import { PixelShowcase, usePixelShowcase } from "./PixelShowcase";
import { useReadContract } from "wagmi";
import { EQUIX_ADDRESS, equixAbi } from "@/lib/contract";

// Pre-reveal: nothing to show per-token (every tokenURI is identical
// placeholder art), so this stays purely decorative — cycling the 20
// hand-drawn style variants. Once `revealed` flips true on-chain, this
// can be swapped for a real "Latest Agents" grid reading actual tokenURIs.
export function FeaturedAgents() {
  const show = usePixelShowcase();

  const { data: revealed } = useReadContract({
    address: EQUIX_ADDRESS,
    abi: equixAbi,
    functionName: "revealed",
    query: { enabled: !!EQUIX_ADDRESS },
  });

  return (
    <section id="explore" className="max-w-2xl mx-auto px-6 py-20 font-pixel">
      <h2 className="text-[14px] mb-8">
        {revealed ? "AGENTS" : "COLLECTION STYLE PREVIEW"}
      </h2>
      <div className="border border-dashed border-border p-8">
        <div className="aspect-square max-w-xs mx-auto">
          <PixelShowcase base={show.base} variantCells={show.variant.cells} subframe={show.subframe} />
        </div>
      </div>
      {!revealed && (
        <p className="text-center text-[9px] text-ink/40 mt-4">
          Actual identities reveal after mint closes.
        </p>
      )}
    </section>
  );
}
