import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { Button } from "./ui/Button";
import { activeChain } from "@/lib/wagmiConfig";

/**
 * Hard gate: returns whether the connected wallet is actually on
 * Robinhood Chain right now. Nothing that spends money should render
 * or be clickable unless this is true — a mismatched chain means the
 * wallet will sign and broadcast on whatever network it's ACTUALLY
 * connected to, not the one the app intended. That's how real funds
 * get sent to an uncontrolled address on the wrong chain.
 */
export function useIsCorrectChain() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  return isConnected && chainId === activeChain.id;
}

export function NetworkGuard({ children }: { children: React.ReactNode }) {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending } = useSwitchChain();
  const correct = isConnected && chainId === activeChain.id;

  if (!isConnected) return <>{children}</>;
  if (correct) return <>{children}</>;

  return (
    <div className="border-2 border-red-800 bg-red-50 p-5 text-center font-pixel">
      <p className="text-[12px] text-red-800 mb-2">WRONG NETWORK</p>
      <p className="text-[11px] text-ink/70 mb-5 leading-relaxed font-sans">
        Your wallet is connected to a different chain. Minting is disabled
        until you switch to {activeChain.name} — proceeding on the wrong
        network can send real funds to an address you don't control.
      </p>
      <Button
        variant="primary"
        onClick={() => switchChain({ chainId: activeChain.id })}
        disabled={isPending}
      >
        {isPending ? "Switching…" : `Switch to ${activeChain.name}`}
      </Button>
    </div>
  );
}
