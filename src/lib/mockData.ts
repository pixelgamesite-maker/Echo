export type Rarity = "Common" | "Rare" | "Legendary";

export type Agent = {
  id: string;
  number: string;
  role: string;
  generation: string;
  rarity: Rarity;
  owner: string;
};

export const featuredAgents: Agent[] = [
  { id: "1", number: "#0142", role: "Research Assistant", generation: "Gen 1", rarity: "Rare", owner: "0x4a2…9f1c" },
  { id: "2", number: "#0187", role: "Trading Analyst", generation: "Gen 1", rarity: "Common", owner: "0x88b…22ad" },
  { id: "3", number: "#0203", role: "Security Auditor", generation: "Gen 2", rarity: "Legendary", owner: "0x0e1…77f4" },
  { id: "4", number: "#0219", role: "Coding Companion", generation: "Gen 1", rarity: "Common", owner: "0x9c3…14bb" },
  { id: "5", number: "#0244", role: "DeFi Strategist", generation: "Gen 2", rarity: "Rare", owner: "0x5f7…e02d" },
  { id: "6", number: "#0261", role: "Design Partner", generation: "Gen 1", rarity: "Common", owner: "0x1d8…c930" },
];

export type Category = { name: string; icon: string };

export const categories: Category[] = [
  { name: "Research", icon: "search" },
  { name: "Trading", icon: "trending-up" },
  { name: "Coding", icon: "code" },
  { name: "Security", icon: "shield" },
  { name: "Design", icon: "pen-tool" },
  { name: "Gaming", icon: "gamepad-2" },
  { name: "Marketing", icon: "megaphone" },
  { name: "DeFi", icon: "coins" },
  { name: "Custom", icon: "sparkles" },
];

export type Collection = {
  name: string;
  description: string;
  count: number;
};

export const collections: Collection[] = [
  { name: "Genesis Echoes", description: "The first 500 agents ever minted.", count: 500 },
  { name: "Builder Echoes", description: "Agents trained for coding and infrastructure.", count: 320 },
  { name: "Research Echoes", description: "Agents built for analysis and discovery.", count: 410 },
  { name: "Trading Echoes", description: "Agents tuned for markets and strategy.", count: 275 },
  { name: "Community Picks", description: "Curated by the Echo community.", count: 150 },
];

export type MintEvent = {
  number: string;
  role: string;
  minutesAgo: number;
};

export const mintFeed: MintEvent[] = [
  { number: "#0184", role: "Research Agent", minutesAgo: 2 },
  { number: "#0185", role: "Trading Agent", minutesAgo: 5 },
  { number: "#0186", role: "Security Agent", minutesAgo: 9 },
  { number: "#0187", role: "Coding Agent", minutesAgo: 14 },
  { number: "#0188", role: "Design Agent", minutesAgo: 21 },
];
