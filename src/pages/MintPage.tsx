import { useMemo, useState } from "react";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { parseEther, formatEther } from "viem";
import { WalletConnectButton } from "@/components/WalletConnectButton";
import { LiveMintFeed } from "@/components/LiveMintFeed";
import { PixelShowcase, usePixelShowcase } from "@/components/PixelShowcase";
import { EQUIX_ADDRESS, equixAbi } from "@/lib/contract";
import { activeChain } from "@/lib/wagmiConfig";

const PRESETS = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50];

const EXPLORER_URL = `${activeChain.blockExplorers?.default.url}/address/${EQUIX_ADDRESS}`;
const OPENSEA_URL = import.meta.env.VITE_OPENSEA_URL as string | undefined;

type Phase = "idle" | "minting" | "done" | "error";

export default function MintPage() {
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const show = usePixelShowcase();

  const [qty, setQty] = useState(1);
  const [phase, setPhase] = useState<Phase>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data: totalSupply } = useReadContract({
    address: EQUIX_ADDRESS, abi: equixAbi, functionName: "totalSupply",
    query: { enabled: !!EQUIX_ADDRESS, refetchInterval: 10_000 },
  });
  const { data: maxSupply } = useReadContract({
    address: EQUIX_ADDRESS, abi: equixAbi, functionName: "MAX_SUPPLY",
    query: { enabled: !!EQUIX_ADDRESS },
  });
  const { data: mintPrice } = useReadContract({
    address: EQUIX_ADDRESS, abi: equixAbi, functionName: "mintPrice",
    query: { enabled: !!EQUIX_ADDRESS },
  });
  const { data: maxPerWallet } = useReadContract({
    address: EQUIX_ADDRESS, abi: equixAbi, functionName: "maxPerWallet",
    query: { enabled: !!EQUIX_ADDRESS },
  });
  const { data: mintedByMe } = useReadContract({
    address: EQUIX_ADDRESS, abi: equixAbi, functionName: "mintedPerWallet",
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 10_000 },
  });
  const { data: mintingActive } = useReadContract({
    address: EQUIX_ADDRESS, abi: equixAbi, functionName: "mintingActive",
    query: { enabled: !!EQUIX_ADDRESS, refetchInterval: 10_000 },
  });

  const minted = Number((totalSupply as bigint | undefined) ?? 0n);
  const max = Number((maxSupply as bigint | undefined) ?? 9491n);
  const priceEach = mintPrice ? Number(formatEther(mintPrice as bigint)) : 0.0004;
  const wallCap = Number((maxPerWallet as bigint | undefined) ?? 50n);
  const already = Number((mintedByMe as bigint | undefined) ?? 0n);
  const remaining = Math.max(0, wallCap - already);
  const isLive = mintingActive === true;
  const soldOut = minted >= max;

  const pctNum = max > 0 ? (minted / max) * 100 : 0;
  const total = (priceEach * qty).toFixed(4);

  const clamp = (n: number) => Math.max(1, Math.min(n, remaining || wallCap));

  return (
    <>
      <main className="max-w-xl mx-auto px-6 py-12 font-pixel">
        {/* ---- Showcase ---- */}
        <div className="border border-border p-10 mb-4">
          <div className="aspect-square max-w-[240px] mx-auto">
            <PixelShowcase base={show.base} variantCells={show.variant.cells} subframe={show.subframe} />
          </div>
        </div>
        <p className="text-center text-[9px] text-ink/40 mb-12 leading-relaxed">
          STYLE PREVIEW · IDENTITIES REVEAL AFTER MINT CLOSES
        </p>

        {/* ---- Progress: thin rail with marker + milestone ticks ---- */}
        <div className="mb-12">
          <div className="flex justify-between items-baseline mb-4">
            <span className="text-[11px] text-ink/50">MINTED</span>
            <span className="text-[15px]">
              {minted.toLocaleString()}
              <span className="text-ink/30"> / {max.toLocaleString()}</span>
            </span>
          </div>

          <div className="relative h-[3px] bg-ink/10 mb-3">
            <div
              className="absolute inset-y-0 left-0 bg-sage transition-all duration-700 ease-out"
              style={{ width: `${pctNum}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-[3px] h-[13px] bg-ink transition-all duration-700 ease-out"
              style={{ left: `calc(${pctNum}% - 1px)` }}
            />
          </div>

          <div className="flex justify-between text-[8px] text-ink/30">
            {[0, 25, 50, 75, 100].map((m) => (
              <span key={m} className={pctNum >= m ? "text-sage" : ""}>{m}%</span>
            ))}
          </div>
        </div>

        {/* ---- Stats ---- */}
        <div className="grid grid-cols-3 gap-6 text-center mb-12 py-6 border-y border-ink/10">
          <div>
            <p className="text-[9px] text-ink/40 mb-2">PRICE</p>
            <p className="text-[13px]">{priceEach}</p>
            <p className="text-[9px] text-ink/40 mt-1">ETH</p>
          </div>
          <div>
            <p className="text-[9px] text-ink/40 mb-2">MAX / WALLET</p>
            <p className="text-[13px]">{wallCap}</p>
            <p className="text-[9px] text-ink/40 mt-1">AGENTS</p>
          </div>
          <div>
            <p className="text-[9px] text-ink/40 mb-2">YOU OWN</p>
            <p className="text-[13px]">{already}</p>
            <p className="text-[9px] text-ink/40 mt-1">MINTED</p>
          </div>
        </div>

        {/* ---- Amount selector ---- */}
        <p className="text-center text-[11px] mb-6 tracking-wide">
          SELECT AN AMOUNT TO MINT
        </p>

        {/* premium quantity card */}
        <div className="border border-border mb-6">
          <div className="flex items-stretch">
            <button
              onClick={() => setQty((q) => clamp(q - 1))}
              disabled={qty <= 1}
              aria-label="Decrease"
              className="w-16 shrink-0 border-r border-border text-[18px] text-ink/60 hover:bg-ink hover:text-cream hover:border-ink transition-colors disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-ink/60"
            >
              −
            </button>

            <input
              type="number"
              inputMode="numeric"
              min={1}
              max={remaining || wallCap}
              value={qty}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10);
                setQty(isNaN(v) ? 1 : clamp(v));
              }}
              className="flex-1 min-w-0 text-center bg-transparent py-7 text-[32px] font-pixel leading-none focus:outline-none focus:bg-sage/[0.04] transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />

            <button
              onClick={() => setQty((q) => clamp(q + 1))}
              disabled={qty >= (remaining || wallCap)}
              aria-label="Increase"
              className="w-16 shrink-0 border-l border-border text-[18px] text-ink/60 hover:bg-ink hover:text-cream hover:border-ink transition-colors disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-ink/60"
            >
              +
            </button>
          </div>

          <div className="flex items-center justify-between px-5 py-4 border-t border-border">
            <span className="text-[9px] text-ink/40 tracking-wide">TOTAL</span>
            <span className="text-[15px]">{total} ETH</span>
          </div>
        </div>

        {/* presets */}
        <div className="grid grid-cols-5 gap-2 mb-10">
          {PRESETS.map((n) => {
            const over = n > (remaining || wallCap);
            return (
              <button
                key={n}
                onClick={() => setQty(clamp(n))}
                disabled={over}
                className={`py-3 text-[11px] border transition-colors disabled:opacity-25 disabled:cursor-not-allowed ${
                  qty === n
                    ? "border-sage text-sage bg-sage/[0.05]"
                    : "border-ink/15 text-ink/60 hover:border-ink hover:text-ink"
                }`}
              >
                {n}
              </button>
            );
          })}
        </div>

        {errorMsg && (
          <p className="text-center text-[9px] text-red-800 mb-5">{errorMsg}</p>
        )}

        <div className="flex justify-center mb-4">
          {!isConnected ? (
            <WalletConnectButton />
          ) : phase === "minting" ? (
            <button disabled className="w-full max-w-xs py-4 text-[11px] bg-ink text-cream opacity-50">
              CONFIRM IN WALLET…
            </button>
          ) : phase === "done" ? (
            <p className="text-[12px] text-sage py-4">MINTED. WELCOME, HANDLER.</p>
          ) : (
            <button
              onClick={async () => {
                if (!address) return;
                setPhase("minting"); setErrorMsg(null);
                try {
                  await writeContractAsync({
                    address: EQUIX_ADDRESS, abi: equixAbi, functionName: "mint",
                    args: [BigInt(qty)], value: parseEther(total),
                  });
                  setPhase("done");
                } catch (e: any) {
                  setErrorMsg(e.shortMessage ?? e.message ?? "Mint failed");
                  setPhase("error");
                }
              }}
              disabled={!isLive || soldOut || remaining <= 0}
              className="w-full max-w-xs py-4 text-[11px] bg-ink text-cream hover:bg-sage transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {!isLive
                ? "MINT NOT LIVE YET"
                : soldOut
                ? "SOLD OUT"
                : remaining <= 0
                ? "WALLET LIMIT REACHED"
                : `MINT ${qty}`}
            </button>
          )}
        </div>

        <p className="text-center text-[9px] mb-10 leading-relaxed">
          <span className={isLive ? "text-sage" : "text-ink/40"}>
            {isLive ? "● MINT LIVE" : "○ MINT NOT OPEN"}
          </span>
          <span className="text-ink/40"> · FULLY PUBLIC · NO PRESALE · NO ALLOWLIST</span>
        </p>

        {/* ---- Links ---- */}
        <div className="flex justify-center gap-6 text-[9px] pt-6 border-t border-ink/10">
          <a href={EXPLORER_URL} target="_blank" rel="noreferrer" className="text-ink/50 hover:text-sage transition-colors">
            EXPLORER ↗
          </a>
          {OPENSEA_URL && (
            <a href={OPENSEA_URL} target="_blank" rel="noreferrer" className="text-ink/50 hover:text-sage transition-colors">
              OPENSEA ↗
            </a>
          )}
        </div>
      </main>

      <LiveMintFeed />
    </>
  );
}
