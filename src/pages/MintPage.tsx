import { useMemo, useState } from "react";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { parseEther } from "viem";
import { PixelShowcase, usePixelShowcase } from "@/components/PixelShowcase";
import { WalletConnectButton } from "@/components/WalletConnectButton";
import { EQUIX_ADDRESS, equixAbi } from "@/lib/contract";

const MAX_SUPPLY = 9491;
const PRICE_ETH = 0.0004;
const MAX_PER_WALLET = 5;

const FIELDS = [
  { key: "hair", label: "HAIR", placeholder: "mohawk" },
  { key: "eyes", label: "EYES", placeholder: "focused" },
  { key: "mouth", label: "MOUTH", placeholder: "smirk" },
  { key: "cloth", label: "CLOTH", placeholder: "field jacket" },
  { key: "accessories", label: "GEAR", placeholder: "gold chain" },
];

const BASES = ["male", "female", "robot", "pet"] as const;
const API = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

type Phase = "form" | "generating" | "previewed" | "authorizing" | "minting" | "done" | "error";

export default function MintPage() {
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const show = usePixelShowcase();

  const [base, setBase] = useState<(typeof BASES)[number] | null>(null);
  const [traits, setTraits] = useState<Record<string, string>>({});
  const [qty, setQty] = useState(1);
  const [phase, setPhase] = useState<Phase>("form");
  const [previews, setPreviews] = useState<string[]>([]);
  const [generationIds, setGenerationIds] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data: minted } = useReadContract({
    address: EQUIX_ADDRESS,
    abi: equixAbi,
    functionName: "totalMinted",
    query: { enabled: !!EQUIX_ADDRESS, refetchInterval: 15_000 },
  });

  const mintedN = Number((minted as bigint | undefined) ?? 0n);
  const pct = ((mintedN / MAX_SUPPLY) * 100).toFixed(2);
  const filled = FIELDS.every((f) => (traits[f.key] ?? "").trim());
  const total = (PRICE_ETH * qty).toFixed(4);

  // Supply bar: 48 pixel blocks, filled proportionally
  const blocks = useMemo(() => {
    const filledBlocks = Math.round((mintedN / MAX_SUPPLY) * 48);
    return Array.from({ length: 48 }, (_, i) => i < filledBlocks);
  }, [mintedN]);

  async function generate() {
    if (!base || !filled || !address) return;
    setPhase("generating");
    setErrorMsg(null);
    try {
      const results = await Promise.all(
        Array.from({ length: qty }, async () => {
          const res = await fetch(`${API}/api/generate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ base, traits, wallet: address }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error ?? "Generation failed");
          return data;
        })
      );
      setPreviews(results.map((r) => r.preview));
      setGenerationIds(results.map((r) => r.generationId));
      setPhase("previewed");
    } catch (e: any) {
      setErrorMsg(e.message);
      setPhase("error");
    }
  }

  async function mint() {
    if (!address || generationIds.length === 0) return;
    setPhase("authorizing");
    setErrorMsg(null);
    try {
      const auths = await Promise.all(
        generationIds.map(async (generationId) => {
          const res = await fetch(`${API}/api/authorize`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ generationId, wallet: address }),
          });
          const a = await res.json();
          if (!res.ok) throw new Error(a.error ?? "Authorization failed");
          return a;
        })
      );

      setPhase("minting");
      if (auths.length === 1) {
        await writeContractAsync({
          address: EQUIX_ADDRESS,
          abi: equixAbi,
          functionName: "mint",
          args: [auths[0].uri, BigInt(auths[0].nonce), BigInt(auths[0].deadline), auths[0].signature],
          value: parseEther(String(PRICE_ETH)),
        });
      } else {
        await writeContractAsync({
          address: EQUIX_ADDRESS,
          abi: equixAbi,
          functionName: "mintBatch",
          args: [
            auths.map((a) => a.uri),
            auths.map((a) => BigInt(a.nonce)),
            auths.map((a) => BigInt(a.deadline)),
            auths.map((a) => a.signature),
          ],
          value: parseEther(String(PRICE_ETH * auths.length)),
        });
      }
      setPhase("done");
    } catch (e: any) {
      setErrorMsg(e.message ?? "Mint failed");
      setPhase("error");
    }
  }

  return (
    <main className="max-w-2xl mx-auto px-6 py-10 font-pixel">
      {/* ---- Cycling showcase, A NONYM style ---- */}
      <div className="border border-dashed border-border p-8 md:p-12">
        <div className="aspect-square max-w-sm mx-auto">
          <PixelShowcase base={show.base} variantCells={show.variant.cells} subframe={show.subframe} />
        </div>
      </div>

      {/* ---- Trait readout ---- */}
      <div className="mt-8 space-y-3 text-[11px]">
        <div className="flex justify-between"><span className="text-ink/50">BASE</span><span>{show.base.toUpperCase()}</span></div>
        <div className="flex justify-between"><span className="text-ink/50">VARIANT</span><span>{show.variant.name}</span></div>
        <div className="flex justify-between"><span className="text-ink/50">PALETTE</span><span>CREAM / INK / SAGE</span></div>
      </div>

      <p className="mt-6 text-[10px] text-ink/50 leading-relaxed">
        4 BASES × 5 FREEFORM TRAITS = ∞ COMBINATIONS. YOUR WORDS, NOT OUR LIST.
      </p>

      {/* ---- Supply ---- */}
      <div className="mt-12">
        <div className="flex justify-between text-[12px] mb-3">
          <span className="font-bold">SUPPLY</span>
          <span>
            {mintedN.toLocaleString()} / {MAX_SUPPLY.toLocaleString()}{" "}
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
      <div className="mt-10 pt-8 border-t border-ink/15 grid grid-cols-3 gap-4 text-[11px]">
        <div>
          <p className="text-ink/50 mb-2">PRICE</p>
          <p className="text-[14px]">{PRICE_ETH} ETH</p>
        </div>
        <div>
          <p className="text-ink/50 mb-2">MAX / WALLET</p>
          <p className="text-[14px]">{MAX_PER_WALLET}</p>
        </div>
        <div>
          <p className="text-ink/50 mb-2">MINT TYPE</p>
          <p className="text-[14px]">PUBLIC</p>
        </div>
      </div>

      {/* ---- Prompt console ---- */}
      <div className="mt-10 pt-8 border-t border-ink/15">
        <p className="text-[12px] font-bold mb-5">PROMPT YOUR AGENT</p>

        <div className="grid grid-cols-4 gap-2 mb-5">
          {BASES.map((b) => (
            <button
              key={b}
              onClick={() => setBase(b)}
              className={`text-[9px] py-3 border transition-colors ${
                base === b ? "border-sage text-sage" : "border-border text-ink hover:border-ink"
              }`}
            >
              {b.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {FIELDS.map((f) => (
            <div key={f.key} className="flex items-center gap-3">
              <span className="text-[9px] text-ink/50 w-16 shrink-0">{f.label}</span>
              <input
                value={traits[f.key] ?? ""}
                maxLength={30}
                placeholder={f.placeholder}
                onChange={(e) => setTraits((t) => ({ ...t, [f.key]: e.target.value }))}
                className="flex-1 bg-transparent border border-border px-3 py-2.5 font-sans text-[14px] placeholder:text-ink/30 focus:outline-none focus:border-ink"
              />
            </div>
          ))}
        </div>
      </div>

      {/* ---- Quantity + mint ---- */}
      <div className="mt-8 flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-3">
          <span className="text-ink/50">QUANTITY</span>
          <div className="flex border border-border">
            <button className="px-4 py-2.5 hover:bg-ink/5" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
            <span className="px-5 py-2.5 border-x border-border">{qty}</span>
            <button className="px-4 py-2.5 hover:bg-ink/5" onClick={() => setQty((q) => Math.min(MAX_PER_WALLET, q + 1))}>+</button>
          </div>
        </div>
        <span className="text-[14px]">{total} ETH</span>
      </div>

      {previews.length > 0 && (
        <div className={`mt-6 grid gap-3 ${previews.length > 1 ? "grid-cols-2 md:grid-cols-3" : "grid-cols-1 max-w-xs mx-auto"}`}>
          {previews.map((p, i) => (
            <img key={i} src={p} alt={`Agent preview ${i + 1}`} className="w-full border border-border [image-rendering:pixelated]" />
          ))}
        </div>
      )}

      {errorMsg && <p className="mt-5 text-[10px] text-red-800">{errorMsg}</p>}

      <div className="mt-6">
        {!isConnected ? (
          <div className="[&>*]:w-full"><WalletConnectButton /></div>
        ) : phase === "previewed" ? (
          <div className="flex gap-3">
            <button
              onClick={() => { setPhase("form"); setPreviews([]); setGenerationIds([]); }}
              className="px-6 py-4 text-[11px] border border-border hover:border-ink transition-colors"
            >
              REGENERATE
            </button>
            <button
              onClick={mint}
              className="flex-1 py-4 text-[11px] bg-ink text-cream hover:bg-sage transition-colors"
            >
              MINT {qty} — {total} ETH
            </button>
          </div>
        ) : phase === "generating" || phase === "authorizing" || phase === "minting" ? (
          <button disabled className="w-full py-4 text-[11px] bg-ink text-cream opacity-50">
            {phase === "generating" ? `GENERATING ${qty} AGENT${qty > 1 ? "S" : ""}…`
              : phase === "authorizing" ? "PREPARING…" : "CONFIRM IN WALLET…"}
          </button>
        ) : phase === "done" ? (
          <p className="text-center text-[12px] text-sage py-4">MINTED. WELCOME, HANDLER.</p>
        ) : (
          <button
            onClick={generate}
            disabled={!base || !filled}
            className="w-full py-4 text-[11px] bg-ink text-cream hover:bg-sage transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            GENERATE {qty} AGENT{qty > 1 ? "S" : ""}
          </button>
        )}
      </div>

      <p className="mt-6 text-[10px] text-ink/50 leading-relaxed">
        FULLY PUBLIC MINT. NO PRESALE, NO ALLOWLIST, NO TEAM SUPPLY. WHAT YOU
        PREVIEW IS WHAT YOU MINT — PERMANENTLY.
      </p>
    </main>
  );
}
