import { createConfig, http } from "wagmi";
import { injected, walletConnect } from "wagmi/connectors";
import { defineChain } from "viem";

const mainnetRpc =
  import.meta.env.VITE_RPC_URL_MAINNET || "https://rpc.mainnet.chain.robinhood.com";

export const robinhoodChain = defineChain({
  id: 4663,
  name: "Robinhood Chain",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: { default: { http: [mainnetRpc] } },
  blockExplorers: {
    default: { name: "Blockscout", url: "https://robinhoodchain.blockscout.com" },
  },
});

const wcProjectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID as string | undefined;

export const wagmiConfig = createConfig({
  chains: [robinhoodChain],
  // Note: we deliberately do NOT hardcode a single injected() target.
  // wagmi v2 auto-discovers every EIP-6963-announcing wallet (MetaMask,
  // Rabby, Zerion, Coinbase Wallet, etc.) and adds each as its own entry
  // in useConnect().connectors automatically. injected() below is just
  // the generic fallback for wallets that don't support EIP-6963 yet.
  connectors: [
    injected(),
    ...(wcProjectId
      ? [
          walletConnect({
            projectId: wcProjectId,
            metadata: {
              name: "Equix AI",
              description: "9,491 animated agent identities on Robinhood Chain.",
              url: "https://equixai.xyz",
              icons: ["https://equixai.xyz/favicon.png"],
            },
          }),
        ]
      : []),
  ],
  transports: {
    [robinhoodChain.id]: http(mainnetRpc),
  },
});

export const activeChain = robinhoodChain;
