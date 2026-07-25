import { useState } from "react";
import { Button } from "./ui/Button";

// Placeholder — swap the onClick body for real wagmi useConnect() once
// wallet integration is wired up.
export function WalletConnectButton() {
  const [connected, setConnected] = useState(false);

  return (
    <Button
      variant="secondary"
      className="text-[10px] px-4 py-2.5"
      onClick={() => setConnected((c) => !c)}
    >
      {connected ? "0x9F2…c81A" : "Connect Wallet"}
    </Button>
  );
}
