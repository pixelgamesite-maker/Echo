import { useState } from "react";
import { useSignMessage } from "wagmi";
import { Button } from "@/components/ui/Button";

const API = import.meta.env.VITE_API_URL ?? "";

const BASES = ["male", "female", "robot", "pet"] as const;
const ROLES = ["Scout", "Research", "Trading", "Minting", "Dev / Ops", "Personal"];

const FIELDS = [
  { key: "hair", label: "HAIR", placeholder: "mohawk" },
  { key: "eyes", label: "EYES", placeholder: "focused" },
  { key: "mouth", label: "MOUTH", placeholder: "smirk" },
  { key: "cloth", label: "CLOTH", placeholder: "field jacket" },
  { key: "gear", label: "GEAR", placeholder: "gold chain" },
];

type Phase = "form" | "signing" | "generating" | "preview" | "confirming" | "done" | "error";

export function RevealConsole({
  tokenId,
  address,
  onRevealed,
  onClose,
}: {
  tokenId: bigint;
  address: `0x${string}`;
  onRevealed: () => void;
  onClose: () => void;
}) {
  const { signMessageAsync } = useSignMessage();

  const [base, setBase] = useState<(typeof BASES)[number] | null>(null);
  const [traits, setTraits] = useState<Record<string, string>>({});
  const [role, setRole] = useState(ROLES[0]);
  const [name, setName] = useState("");

  const [phase, setPhase] = useState<Phase>("form");
  const [preview, setPreview] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const traitsFilled = FIELDS.every((f) => (traits[f.key] ?? "").trim());
  const nameOk = /^[A-Za-z0-9 ]{1,24}$/.test(name.trim());
  const ready = !!base && traitsFilled && nameOk;

  async function generate() {
    if (!ready) return;
    setErrorMsg(null);
    try {
      // Ownership proof: a signed message, not a transaction. No gas.
      setPhase("signing");
      const message = `Reveal Equix Agent #${tokenId}\nBase: ${base}\nName: ${name.trim()}`;
      const signature = await signMessageAsync({ message });

      setPhase("generating");
      const res = await fetch(`${API}/api/reveal/preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tokenId: tokenId.toString(),
          base,
          traits,
          role,
          name: name.trim(),
          address,
          message,
          signature,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generation failed");

      setPreview(data.preview);
      setPreviewId(data.previewId);
      setPhase("preview");
    } catch (e: any) {
      setErrorMsg(e.shortMessage ?? e.message ?? "Something went wrong");
      setPhase("error");
    }
  }

  async function confirm() {
    if (!previewId) return;
    setPhase("confirming");
    setErrorMsg(null);
    try {
      const message = `Confirm Equix Agent #${tokenId}\nPreview: ${previewId}`;
      const signature = await signMessageAsync({ message });

      const res = await fetch(`${API}/api/reveal/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tokenId: tokenId.toString(),
          previewId,
          address,
          message,
          signature,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Confirmation failed");

      setPhase("done");
      onRevealed();
    } catch (e: any) {
      setErrorMsg(e.shortMessage ?? e.message ?? "Couldn't confirm");
      setPhase("error");
    }
  }

  const busy = phase === "signing" || phase === "generating" || phase === "confirming";
  const confirmLabel = phase === "confirming" ? "Confirming…" : "Confirm forever";

  return (
    <div className="fixed inset-0 z-50 bg-ink/40 flex items-start md:items-center justify-center overflow-y-auto p-4">
      <div className="bg-cream border border-border w-full max-w-lg my-8">
        {/* header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <span className="font-pixel text-[11px]">
            REVEAL AGENT #{tokenId.toString().padStart(4, "0")}
          </span>
          <button
            onClick={onClose}
            className="font-pixel text-[11px] text-ink/40 hover:text-ink transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="p-5 md:p-7">
          {phase === "done" ? (
            <div className="text-center py-10">
              <p className="font-pixel text-[13px] text-sage mb-3">REVEALED</p>
              <p className="text-[14px] text-ink/70 mb-8">
                {name.trim()} is now permanent.
              </p>
              <Button variant="primary" onClick={onClose}>Done</Button>
            </div>
          ) : phase === "preview" && preview ? (
            <>
              <img
                src={preview}
                alt="Agent preview"
                className="w-full max-w-[260px] mx-auto border border-border mb-6 [image-rendering:pixelated]"
              />
              <div className="font-pixel text-[10px] space-y-2 mb-7">
                <div className="flex justify-between"><span className="text-ink/40">NAME</span><span>{name.trim()}</span></div>
                <div className="flex justify-between"><span className="text-ink/40">BASE</span><span>{base?.toUpperCase()}</span></div>
                <div className="flex justify-between"><span className="text-ink/40">ROLE</span><span>{role.toUpperCase()}</span></div>
              </div>
              <p className="text-[11px] text-ink/50 mb-5 leading-relaxed">
                Confirming locks this agent permanently. You can regenerate as
                many times as you like before confirming — never after.
              </p>
              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setPhase("form")} disabled={busy}>
                  Regenerate
                </Button>
                <Button variant="primary" className="flex-1" onClick={confirm} disabled={busy}>
                  {confirmLabel}
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="font-pixel text-[9px] text-ink/40 mb-3">BASE</p>
              <div className="grid grid-cols-4 gap-2 mb-6">
                {BASES.map((b) => (
                  <button
                    key={b}
                    onClick={() => setBase(b)}
                    className={`py-3 text-[9px] font-pixel border transition-colors ${
                      base === b
                        ? "border-sage text-sage bg-sage/[0.05]"
                        : "border-ink/15 text-ink/60 hover:border-ink"
                    }`}
                  >
                    {b.toUpperCase()}
                  </button>
                ))}
              </div>

              <p className="font-pixel text-[9px] text-ink/40 mb-3">TRAITS</p>
              <div className="space-y-2.5 mb-6">
                {FIELDS.map((f) => (
                  <div key={f.key} className="flex items-center gap-3">
                    <span className="font-pixel text-[8px] text-ink/40 w-12 shrink-0">
                      {f.label}
                    </span>
                    <input
                      value={traits[f.key] ?? ""}
                      maxLength={30}
                      placeholder={f.placeholder}
                      onChange={(e) =>
                        setTraits((t) => ({ ...t, [f.key]: e.target.value }))
                      }
                      className="flex-1 min-w-0 bg-transparent border border-border px-3 py-2 text-[14px] placeholder:text-ink/25 focus:outline-none focus:border-sage"
                    />
                  </div>
                ))}
              </div>

              <p className="font-pixel text-[9px] text-ink/40 mb-3">ROLE</p>
              <div className="grid grid-cols-3 gap-2 mb-6">
                {ROLES.map((r) => (
                  <button
                    key={r}
                    onClick={() => setRole(r)}
                    className={`py-2.5 text-[8px] font-pixel border transition-colors ${
                      role === r
                        ? "border-sage text-sage bg-sage/[0.05]"
                        : "border-ink/15 text-ink/60 hover:border-ink"
                    }`}
                  >
                    {r.toUpperCase()}
                  </button>
                ))}
              </div>

              <p className="font-pixel text-[9px] text-ink/40 mb-3">NAME</p>
              <input
                value={name}
                maxLength={24}
                placeholder="Nightrunner"
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-transparent border border-border px-3 py-3 text-[15px] placeholder:text-ink/25 focus:outline-none focus:border-sage mb-2"
              />
              <p className="text-[10px] text-ink/40 mb-7">
                {name.length}/24 · letters, numbers and spaces
              </p>

              {errorMsg && (
                <p className="text-[11px] text-red-800 mb-5">{errorMsg}</p>
              )}

              <Button
                variant="primary"
                className="w-full"
                onClick={generate}
                disabled={!ready || busy}
              >
                {phase === "signing"
                  ? "Sign in wallet…"
                  : phase === "generating"
                  ? "Generating…"
                  : "Generate agent"}
              </Button>

              <p className="text-[10px] text-ink/40 mt-4 text-center leading-relaxed">
                Signing proves you own this agent. It costs no gas.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
