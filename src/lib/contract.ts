// Equix AI — blind-mint-and-reveal contract bindings.
// Replaces the old signature-gated prompt-to-mint ABI.

export const EQUIX_ADDRESS = (import.meta.env.VITE_EQUIX_ADDRESS ??
  "0x5566207EcdBcCc06F7cFE40735AaA4fFfE7940b1") as `0x${string}`;

export const equixAbi = [
  { type: "function", name: "mint", stateMutability: "payable",
    inputs: [{ name: "quantity", type: "uint256" }], outputs: [] },
  { type: "function", name: "mintPrice", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "maxPerWallet", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "mintedPerWallet", stateMutability: "view",
    inputs: [{ name: "", type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "totalSupply", stateMutability: "view", inputs: [], outputs: [{ name: "result", type: "uint256" }] },
  { type: "function", name: "MAX_SUPPLY", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "revealed", stateMutability: "view", inputs: [], outputs: [{ type: "bool" }] },
  { type: "function", name: "placeholderURI", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
  { type: "function", name: "baseURI", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
  { type: "function", name: "tokenURI", stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }], outputs: [{ type: "string" }] },
  { type: "function", name: "ownerOf", stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }], outputs: [{ type: "address" }] },
  { type: "function", name: "balanceOf", stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }], outputs: [{ type: "uint256" }] },
  {
    type: "event", name: "Transfer", anonymous: false,
    inputs: [
      { indexed: true, name: "from", type: "address" },
      { indexed: true, name: "to", type: "address" },
      { indexed: true, name: "tokenId", type: "uint256" },
    ],
  },
  {
    type: "event", name: "Minted", anonymous: false,
    inputs: [
      { indexed: true, name: "to", type: "address" },
      { indexed: false, name: "quantity", type: "uint256" },
    ],
  },
] as const;

export const IPFS_GATEWAY = "https://gateway.pinata.cloud/ipfs/";
export function resolveIpfs(uri: string): string {
  return uri.startsWith("ipfs://") ? IPFS_GATEWAY + uri.slice(7) : uri;
}
