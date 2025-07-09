/**
 * Display name mappings for human-readable chain names
 * Important! Display names are supported by the authors preference
 * These display names map to valid chain shortnames from the chainlist repo
 * https://github.com/ethereum-lists/chains/tree/master/_data/chains
 */

import { byShortName } from "./chain-mapping.js";

export const displayNameMappings: Record<string, string> = {
  // Major L1s
  ethereum: "eth",
  polygon: "pol",
  bnb: "bnb",
  avalanche: "avax",
  celo: "celo",

  // Major L2s and Superchains
  arbitrum: "arb1",
  optimism: "oeth",
  base: "base",
  zkevm: "zkevm",
  linea: "linea",
  zora: "zora",
  scroll: "scr",

  // Non-EVM chains (from MANUAL_CHAINS)
  solana: "solana",
  bitcoin: "bitcoin",
};

/**
 * Resolve a display name to its official short name
 * @param displayName - The human-readable display name
 * @returns The official short name, or the original if no mapping exists
 */
export function resolveDisplayName(displayName: string): string {
  const normalized = displayName.toLowerCase().trim();
  const resolved = displayNameMappings[normalized] || displayName;
  if (byShortName[resolved]) {
    return resolved;
  }
  return normalized;
}

/**
 * Get all available display names
 * @returns Array of all available display names
 */
export function getAvailableDisplayNames(): Array<string> {
  return Object.keys(displayNameMappings);
}

/**
 * Get the mapping for a specific display name
 * @param displayName - The display name to look up
 * @returns The official short name, or undefined if not found
 */
export function getDisplayNameMapping(displayName: string): string | undefined {
  const normalized = displayName.toLowerCase().trim();
  return displayNameMappings[normalized];
}
