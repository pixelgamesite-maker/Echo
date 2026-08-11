import { useEffect, useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { Button } from "./ui/Button";

function friendlyError(err: unknown): string {
  const raw = (err as any)?.name ?? "";
  const msg = String((err as any)?.message ?? "");

  if (raw === "ProviderNotFoundError" || /provider not found/i.test(msg)) {
    return "No wallet detected in this browser";
  }
  if (raw === "UserRejectedRequestError" || /rejected|denied|cancelled/i.test(msg)) {
    return "Connection cancelled";
  }
  if (/already pending|request of type/i.test(msg)) {
    return "Check your wallet — a request is already open";
  }
  if (/chain|network/i.test(msg)) {
    return "Wrong network — switch to Robinhood Chain";
  }
  return "Couldn't connect. Please try again";
}

export function WalletConnectButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending, pendingConnector } = useConnect();
  const { disconnect } = useDisconnect();

  const [open, setOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Close the picker on outside click / escape
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") setOpen(false); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (isConnected && address) {
    return (
      <Button
        variant="secondary"
        className="text-[10px] px-4 py-2.5"
        onClick={() => disconnect()}
        title="Click to disconnect"
      >
        {address.slice(0, 6)}…{address.slice(-4)}
      </Button>
    );
  }

  // De-dupe: wagmi lists a "injected" fallback plus one entry per
  // EIP-6963-announced wallet. If a named wallet is already present,
  // drop the generic fallback so it isn't shown twice.
  const named = connectors.filter((c) => c.type !== "injected" || c.id !== "injected");
  const hasNamed = named.some((c) => c.type === "injected");
  const list = hasNamed ? connectors.filter((c) => c.id !== "injected") : connectors;

  return (
    <div className="relative inline-block">
      <Button
        variant="secondary"
        className="text-[10px] px-4 py-2.5"
        onClick={() => setOpen((o) => !o)}
        disabled={isPending}
      >
        {isPending ? "Connecting…" : "Connect wallet"}
      </Button>

      {errorMsg && !open && (
        <p className="font-pixel text-[8px] text-ink/50 text-center mt-2 max-w-[220px] leading-relaxed">
          {errorMsg}
        </p>
      )}

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-64 bg-cream border border-border z-50 shadow-sm">
            <div className="px-4 py-3 border-b border-border">
              <span className="font-pixel text-[9px] text-ink/50">CHOOSE A WALLET</span>
            </div>

            {list.length === 0 && (
              <p className="px-4 py-4 text-[11px] text-ink/50 font-sans">
                No wallets detected.
              </p>
            )}

            <ul>
              {list.map((connector) => (
                <li key={connector.uid}>
                  <button
                    onClick={() => {
                      setErrorMsg(null);
                      setOpen(false);
                      connect(
                        { connector },
                        { onError: (e) => setErrorMsg(friendlyError(e)) }
                      );
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-ink/5 transition-colors border-b border-border last:border-b-0"
                  >
                    {connector.icon ? (
                      <img src={connector.icon} alt="" className="w-5 h-5 shrink-0" />
                    ) : (
                      <span className="w-5 h-5 shrink-0 border border-ink/20" />
                    )}
                    <span className="text-[13px] font-sans">
                      {connector.name}
                    </span>
                    {isPending && pendingConnector?.uid === connector.uid && (
                      <span className="ml-auto text-[9px] text-sage font-pixel">…</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
