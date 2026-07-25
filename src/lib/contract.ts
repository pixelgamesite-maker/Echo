export const ECHO_ADDRESS = import.meta.env.VITE_ECHO_ADDRESS as `0x${string}`;

export const echoAbi = [
  {
    type: "function",
    name: "mint",
    stateMutability: "payable",
    inputs: [
      { name: "uri", type: "string" },
      { name: "nonce", type: "uint256" },
      { name: "deadline", type: "uint256" },
      { name: "signature", type: "bytes" },
    ],
    outputs: [],
  },
  { type: "function", name: "mintPrice", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "totalMinted", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  {
    type: "function",
    name: "tokensOfOwner",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ type: "uint256[]" }],
  },
  {
    type: "function",
    name: "tokenURI",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ type: "string" }],
  },
] as const;

export const IPFS_GATEWAY = "https://gateway.pinata.cloud/ipfs/";
export function resolveIpfs(uri: string): string {
  return uri.startsWith("ipfs://") ? IPFS_GATEWAY + uri.slice(7) : uri;
}
