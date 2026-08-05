import { useEffect, useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { Button } from "./ui/Button";

/** Maps wagmi's internal errors to something a human can act on. */
function friendlyError(err: unknown): string {
  const raw = (err as any)?.name ?? "";
  const msg = String((err as any)?.message ?? "");

  if (raw === "ProviderNotFoundError" || /provider not found/i.test(msg)) {
    return "No wallet detected in this browser";
  }
  if (raw === "UserRejectedRequestError" || /rejected|denied/i.test(msg)) {
    return "Connection cancelled";
  }
  if (/already pending|request of type/i.test(msg)) {
    return "Check your wallet — a request is already open";
  }
  if (/chain|network/i.test(msg)) {
    return "Wrong network — switch to Robinhood Chain";
  }
  // Never surface raw wagmi/viem internals (they include version strings)
  return "Couldn't connect. Please try again";
}

export function WalletConnectButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  const [hasInjected, setHasInjected] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setHasInjected(typeof window !== "undefined" && !!(window as any).ethereum);
  }, []);

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

  const injectedConnector = connectors.find((c) => c.type === "injected");
  const wcConnector = connectors.find((c) => c.type === "walletConnect");

  // Prefer a real injected wallet; otherwise WalletConnect (QR / deep link).
  const target = hasInjected ? injectedConnector ?? wcConnector : wcConnector;

  // Last resort: no injected wallet and no WalletConnect configured.
  // Send mobile users into their wallet's in-app browser.
  if (!target) {
    const host = typeof window !== "undefined" ? window.location.host + window.location.pathname : "";
    const deepLink = `https://metamask.app.link/dapp/${host}`;

    return (
      <div className="flex flex-col items-center gap-2">
        <a href={deepLink} target="_blank" rel="noreferrer">
          <Button variant="secondary" className="text-[10px] px-4 py-2.5">
            Open in wallet
          </Button>
        </a>
        <span className="font-pixel text-[8px] text-ink/40 text-center max-w-[200px] leading-relaxed">
          No wallet found in this browser
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        variant="secondary"
        className="text-[10px] px-4 py-2.5"
        disabled={isPending}
        onClick={() => {
          setErrorMsg(null);
          connect(
            { connector: target },
            { onError: (e) => setErrorMsg(friendlyError(e)) }
          );
        }}
      >
        {isPending ? "Connecting…" : "Connect wallet"}
      </Button>

      {errorMsg && (
        <span className="font-pixel text-[8px] text-ink/50 text-center max-w-[220px] leading-relaxed">
          {errorMsg}
        </span>
      )}
    </div>
  );
}
