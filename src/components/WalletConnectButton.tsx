import { useAccount, useConnect, useDisconnect } from "wagmi";
import { Button } from "./ui/Button";

export function WalletConnectButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
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

  return (
    <Button
      variant="secondary"
      className="text-[10px] px-4 py-2.5"
      onClick={() => connect({ connector: connectors[0] })}
    >
      Connect Wallet
    </Button>
  );
}
