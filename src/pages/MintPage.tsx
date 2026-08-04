import { useMemo, useState } from "react";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { parseEther, formatEther } from "viem";
import { WalletConnectButton } from "@/components/WalletConnectButton";
import { LiveMintFeed } from "@/components/LiveMintFeed";
import { EQUIX_ADDRESS, equixAbi } from "@/lib/contract";
import { activeChain } from "@/lib/wagmiConfig";

const PRESETS = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50];

const EXPLORER_URL = `${activeChain.blockExplorers?.default.url}/address/${EQUIX_ADDRESS}`;
const OPENSEA_URL =
  (import.meta.env.VITE_OPENSEA_URL as string | undefined) ??
  `https://opensea.io/assets/robinhood/${EQUIX_ADDRESS}`;

type Phase = "idle" | "minting" | "done" | "error";

export default function MintPage() {
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const [qty, setQty] = useState(1);
  const [customQty, setCustomQty] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data: totalSupply } = useReadContract({
    address: EQUIX_ADDRESS, abi: equixAbi, functionName: "totalSupply",
    query: { enabled: !!EQUIX_ADDRESS, refetchInterval: 12_000 },
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
    query: { enabled: !!address },
  });

  const minted = Number((totalSupply as bigint | undefined) ?? 0n);
  const max = Number((maxSupply as bigint | undefined) ?? 9491n);
  const priceEach = mintPrice ? Number(formatEther(mintPrice as bigint)) : 0.0004;
  const wallCap = Number((maxPerWallet as bigint | undefined) ?? 50n);
  const already = Number((mintedByMe as bigint | undefined) ?? 0n);
  const remaining = Math.max(0, wallCap - already);

  const pct = ((minted / max) * 100).toFixed(2);
  const blocks = useMemo(() => {
    const filled = Math.round((minted / max) * 48);
    return Array.from({ length: 48 }, (_, i) => i < filled);
  }, [minted, max]);

  const total = (priceEach * qty).toFixed(4);

  function pick(n: number) {
    setQty(Math.min(n, remaining || n));
    setCustomQty("");
  }

  function onCustomChange(v: string) {
    setCustomQty(v);
    const n = parseInt(v, 10);
    if (!isNaN(n) && n > 0) setQty(Math.min(n, remaining || n));
  }

  async function mint() {
    if (!address || qty < 1) return;
    setPhase("minting");
    setErrorMsg(null);
    try {
      await writeContractAsync({
        address: EQUIX_ADDRESS,
        abi: equixAbi,
        functionName: "mint",
        args: [BigInt(qty)],
        value: parseEther(total),
      });
      setPhase("done");
    } catch (e: any) {
      setErrorMsg(e.shortMessage ?? e.message ?? "Mint failed");
      setPhase("error");
    }
  }

  return (
    <>
      <main className="max-w-2xl mx-auto px-6 py-10 font-pixel">
        <h1 className="text-[18px] mb-2">EQUIX AI</h1>
        <p className="text-[11px] text-ink/50 mb-8 font-sans">
          9,491 animated agent identities on Robinhood Chain.
        </p>

        {/* ---- Supply ---- */}
        <div className="mb-8">
          <div className="flex justify-between text-[12px] mb-3">
            <span className="font-bold">SUPPLY</span>
            <span>
              {minted.toLocaleString()} / {max.toLocaleString()}{" "}
              <span className="text-ink/40">{pct}%</span>
            </span>
          </div>
          <div className="flex gap-[3px] h-8">
            {blocks.map((f, i) => (
              <div key={i} className={`flex-1 ${f ? "bg-ink" : "bg-ink/15"}`} />
            ))}
          </div>
        </div>

        {/* ---- Price row ---- */}
        <div className="grid grid-cols-3 gap-4 text-[11px] mb-8 pb-8 border-b border-ink/15">
          <div><p className="text-ink/50 mb-2">PRICE</p><p className="text-[14px]">{priceEach} ETH</p></div>
          <div><p className="text-ink/50 mb-2">MAX / WALLET</p><p className="text-[14px]">{wallCap}</p></div>
          <div><p className="text-ink/50 mb-2">YOU'VE MINTED</p><p className="text-[14px]">{already}</p></div>
        </div>

        {/* ---- Quantity presets ---- */}
        <p className="text-[11px] text-ink/50 mb-3">AMOUNT</p>
        <div className="grid grid-cols-5 gap-2 mb-4">
          {PRESETS.map((n) => (
            <button
              key={n}
              onClick={() => pick(n)}
              disabled={n > wallCap}
              className={`text-[12px] py-3 border transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                qty === n && !customQty ? "border-sage text-sage" : "border-border text-ink hover:border-ink"
              }`}
            >
              {n}
            </button>
          ))}
        </div>

        {/* ---- Custom amount ---- */}
        <div className="flex items-center gap-3 mb-8">
          <span className="text-[11px] text-ink/50 shrink-0">CUSTOM</span>
          <input
            type="number"
            min={1}
            max={remaining || wallCap}
            value={customQty}
            onChange={(e) => onCustomChange(e.target.value)}
            placeholder="Enter exact amount"
            className="flex-1 bg-transparent border border-border px-3 py-2.5 font-sans text-[14px] placeholder:text-ink/30 focus:outline-none focus:border-ink"
          />
        </div>

        {errorMsg && <p className="text-[10px] text-red-800 mb-5">{errorMsg}</p>}

        {/* ---- Mint action ---- */}
        {!isConnected ? (
          <div className="[&>*]:w-full mb-4"><WalletConnectButton /></div>
        ) : phase === "minting" ? (
          <button disabled className="w-full py-4 text-[11px] bg-ink text-cream opacity-50 mb-4">
            CONFIRM IN WALLET…
          </button>
        ) : phase === "done" ? (
          <p className="text-center text-[12px] text-sage py-4 mb-4">
            MINTED {qty}. WELCOME, HANDLER{qty > 1 ? "S" : ""}.
          </p>
        ) : (
          <button
            onClick={mint}
            disabled={qty < 1 || remaining <= 0}
            className="w-full py-4 text-[11px] bg-ink text-cream hover:bg-sage transition-colors disabled:opacity-40 disabled:cursor-not-allowed mb-4"
          >
            {remaining <= 0 ? "WALLET LIMIT REACHED" : `MINT ${qty} — ${total} ETH`}
          </button>
        )}

        <p className="text-[10px] text-ink/50 leading-relaxed mb-10">
          FULLY PUBLIC MINT. IDENTITY REVEALS AFTER MINT CLOSES.
        </p>

        {/* ---- Links ---- */}
        <div className="flex gap-4 text-[10px] pt-6 border-t border-ink/15">
          <a href={EXPLORER_URL} target="_blank" rel="noreferrer" className="text-sage hover:underline">
            VIEW ON EXPLORER ↗
          </a>
          <a href={OPENSEA_URL} target="_blank" rel="noreferrer" className="text-sage hover:underline">
            VIEW ON OPENSEA ↗
          </a>
        </div>
      </main>

      <LiveMintFeed />
    </>
  );
}
