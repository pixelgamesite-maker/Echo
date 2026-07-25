import { useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { parseEther } from "viem";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { WalletConnectButton } from "@/components/WalletConnectButton";
import { ECHO_ADDRESS, echoAbi } from "@/lib/contract";

const BASES = [
  { id: "male", label: "MALE" },
  { id: "female", label: "FEMALE" },
  { id: "robot", label: "ROBOT" },
  { id: "pet", label: "PET" },
];

const FIELDS = [
  { key: "hair", label: "Hair", placeholder: "e.g. neat side part" },
  { key: "eyes", label: "Eyes (mood)", placeholder: "e.g. focused" },
  { key: "mouth", label: "Mouth", placeholder: "e.g. calm smile" },
  { key: "cloth", label: "Cloth", placeholder: "e.g. collared shirt" },
  { key: "accessories", label: "Accessories", placeholder: "e.g. pocket pen" },
];

const API = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

type Phase = "form" | "previewing" | "previewed" | "authorizing" | "minting" | "done" | "error";

export default function MintPage() {
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const [base, setBase] = useState<string | null>(null);
  const [traits, setTraits] = useState<Record<string, string>>({});
  const [phase, setPhase] = useState<Phase>("form");
  const [preview, setPreview] = useState<string | null>(null);
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const filled = FIELDS.every((f) => (traits[f.key] ?? "").trim().length > 0);
  const canGenerate = !!base && filled && isConnected;

  async function handleGenerate() {
    if (!canGenerate || !address) return;
    setPhase("previewing");
    setErrorMsg(null);
    try {
      const res = await fetch(`${API}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base, traits, wallet: address }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generation failed");
      setPreview(data.preview);
      setGenerationId(data.generationId);
      setPhase("previewed");
    } catch (e: any) {
      setErrorMsg(e.message);
      setPhase("error");
    }
  }

  async function handleMint() {
    if (!generationId || !address) return;
    setPhase("authorizing");
    setErrorMsg(null);
    try {
      const res = await fetch(`${API}/api/authorize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ generationId, wallet: address }),
      });
      const auth = await res.json();
      if (!res.ok) throw new Error(auth.error ?? "Authorization failed");

      setPhase("minting");
      await writeContractAsync({
        address: ECHO_ADDRESS,
        abi: echoAbi,
        functionName: "mint",
        args: [auth.uri, BigInt(auth.nonce), BigInt(auth.deadline), auth.signature],
        value: parseEther("0.002"),
      });
      setPhase("done");
    } catch (e: any) {
      setErrorMsg(e.message ?? "Mint failed");
      setPhase("error");
    }
  }

  return (
    <main className="max-w-6xl mx-auto px-6 py-14">
      <h1 className="font-pixel text-xl mb-3">Create Your Agent</h1>
      <p className="text-ink/70 mb-12 max-w-md">
        Pick a base, describe your agent, preview it, mint it forever.
      </p>

      <div className="grid lg:grid-cols-2 gap-12 items-start">
        <div>
          <section className="mb-10">
            <h2 className="font-pixel text-[11px] text-sage mb-4">STEP 1 — BASE</h2>
            <div className="grid grid-cols-4 gap-3">
              {BASES.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setBase(b.id)}
                  className={`font-pixel text-[9px] py-3.5 border-2 transition-colors duration-150 ${
                    base === b.id
                      ? "border-sage text-sage"
                      : "border-border text-ink hover:border-ink"
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </section>

          <section className="mb-10">
            <h2 className="font-pixel text-[11px] text-sage mb-4">STEP 2 — TRAITS</h2>
            <div className="flex flex-col gap-4">
              {FIELDS.map((f) => (
                <label key={f.key} className="flex flex-col gap-1.5">
                  <span className="font-pixel text-[9px] text-ink/70">{f.label}</span>
                  <input
                    value={traits[f.key] ?? ""}
                    maxLength={30}
                    placeholder={f.placeholder}
                    onChange={(e) => setTraits((t) => ({ ...t, [f.key]: e.target.value }))}
                    className="bg-transparent border-2 border-border px-4 py-2.5 text-[15px] text-ink placeholder:text-ink/35 focus:outline-none focus:border-ink"
                  />
                </label>
              ))}
            </div>
          </section>

          {errorMsg && (
            <p className="font-pixel text-[10px] text-red-800 mb-6">{errorMsg}</p>
          )}

          {!isConnected ? (
            <WalletConnectButton />
          ) : phase === "previewed" ? (
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => { setPhase("form"); setPreview(null); }}>
                Regenerate
              </Button>
              <Button variant="primary" className="flex-1" onClick={handleMint}>
                Mint Agent — 0.002 ETH
              </Button>
            </div>
          ) : phase === "authorizing" || phase === "minting" ? (
            <Button variant="primary" className="w-full" disabled>
              {phase === "authorizing" ? "Preparing…" : "Confirm in wallet…"}
            </Button>
          ) : phase === "done" ? (
            <p className="font-pixel text-[11px] text-sage">Minted. Welcome, Agent.</p>
          ) : (
            <Button
              variant="primary"
              className="w-full"
              disabled={!canGenerate || phase === "previewing"}
              onClick={handleGenerate}
            >
              {phase === "previewing" ? "Generating…" : "Preview Agent"}
            </Button>
          )}
        </div>

        <Card className="lg:sticky lg:top-24">
          <div className="border-b-2 border-border px-5 py-3">
            <span className="font-pixel text-[10px] text-ink/70">agent preview</span>
          </div>
          <div className="aspect-square flex items-center justify-center p-8">
            {preview ? (
              <img
                src={preview}
                alt="Agent preview"
                className="w-full h-full object-contain [image-rendering:pixelated]"
              />
            ) : (
              <span className="font-pixel text-[10px] text-ink/40 text-center leading-loose">
                fill base + traits,
                <br />
                then preview
              </span>
            )}
          </div>
        </Card>
      </div>
    </main>
  );
}
