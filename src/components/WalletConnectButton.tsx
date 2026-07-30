import { useAccount, useConnect, useDisconnect } from "wagmi";
import { Button } from "./ui/Button";

export function WalletConnectButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending, error } = useConnect();
  const { disconnect } = useDisconnect();

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

  // Prefer an installed browser wallet if one exists; otherwise fall
  // back to WalletConnect (QR / deep link) so mobile browsers still work.
  const injectedConnector = connectors.find((c) => c.type === "injected");
  const fallbackConnector = connectors.find((c) => c.type === "walletConnect");
  const target = injectedConnector ?? fallbackConnector ?? connectors[0];

  return (
    <div className="flex flex-col items-end gap-1.5">
      <Button
        variant="secondary"
        className="text-[10px] px-4 py-2.5"
        disabled={!target || isPending}
        onClick={() => target && connect({ connector: target })}
      >
        {isPending ? "Connecting…" : "Connect Wallet"}
      </Button>
      {!target && (
        <span className="font-pixel text-[8px] text-ink/50">
          no wallet detected
        </span>
      )}
      {error && (
        <span className="font-pixel text-[8px] text-red-800 max-w-[200px] text-right">
          {error.message.slice(0, 60)}
        </span>
      )}
    </div>
  );
}
