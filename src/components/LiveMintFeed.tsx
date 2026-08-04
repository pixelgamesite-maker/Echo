import { useEffect, useState } from "react";
import { watchContractEvent, readContract } from "wagmi/actions";
import { wagmiConfig } from "@/lib/wagmiConfig";
import { EQUIX_ADDRESS, equixAbi } from "@/lib/contract";

const ZERO = "0x0000000000000000000000000000000000000000";

type MintRow = { tokenId: bigint; to: string; at: number };

export function LiveMintFeed() {
  const [rows, setRows] = useState<MintRow[]>([]);

  useEffect(() => {
    if (!EQUIX_ADDRESS) return;

    const unwatch = watchContractEvent(wagmiConfig, {
      address: EQUIX_ADDRESS,
      abi: equixAbi,
      eventName: "Transfer",
      onLogs: (logs) => {
        const mints = logs
          .filter((l) => (l.args as any).from?.toLowerCase() === ZERO)
          .map((l) => ({
            tokenId: (l.args as any).tokenId as bigint,
            to: (l.args as any).to as string,
            at: Date.now(),
          }));
        if (mints.length) {
          setRows((prev) => [...mints.reverse(), ...prev].slice(0, 30));
        }
      },
    });

    return () => unwatch();
  }, []);

  return (
    <section className="max-w-2xl mx-auto px-6 py-14 font-pixel">
      <p className="text-[12px] font-bold mb-5">LIVE MINT FEED</p>
      {rows.length === 0 ? (
        <p className="text-[11px] text-ink/40">watching for mints…</p>
      ) : (
        <div className="border border-border divide-y divide-border">
          {rows.map((r, i) => (
            <div key={`${r.tokenId}-${i}`} className="flex justify-between items-center px-4 py-3 text-[11px]">
              <span>AGENT #{r.tokenId.toString().padStart(4, "0")}</span>
              <span className="text-ink/40">{r.to.slice(0, 6)}…{r.to.slice(-4)}</span>
              <span className="text-sage">JUST NOW</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
