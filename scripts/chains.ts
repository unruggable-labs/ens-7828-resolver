import type { ChainInfo } from "../src/types.js";
// Major chains with their BIP-44 coin types and chain IDs
// Based on market cap, TVL, ecosystem importance, and BIP-44 standards
export const MAJOR_CHAINS = [
  { chainId: 1, identifier: "ethereum" },
  { chainId: 137, identifier: "polygon" },
  { chainId: 56, identifier: "bnb" },
  { chainId: 43114, identifier: "avalanche" },

  // Major L2s and Superchains
  { chainId: 10, identifier: "optimism" },
  { chainId: 8453, identifier: "base" },
  { chainId: 42161, identifier: "arbitrum" },
  { chainId: 1101, identifier: "zkevm" },
  { chainId: 59144, identifier: "linea" },
  { chainId: 7777777, identifier: "zora" },
  { chainId: 534352, identifier: "scroll" },
  { chainId: 42220, identifier: "celo" },
];

export const MAJOR_L2_CHAIN_IDS = [
  10, // optimism (OP Mainnet)
  8453, // base (OP Stack)
  42161, // arbitrum (Arbitrum One)
  1101, // zkevm (Polygon zkEVM)
  59144, // linea
  7777777, // zora (OP Stack)
  534352, // scroll
  42220, // celo
];

/**
 * MANUAL_CHAINS lists popular non-EVM chains that are not present in the ethereum-lists/chains repo.
 * These entries use different namespaces/specs (e.g., solana, bip122) and are included for:
 *   - coinType mapping (see: https://github.com/satoshilabs/slips/blob/master/slip-0044.md)
 *   - For non-EVM chains, coinType is always the SLIP-44 value (no offset)
 *   - Cross-chain and multi-namespace support in EIP-7828 resolution
 *   - Display name and identifier mapping for non-EVM chains
 *
 * Example entries:
 *   - Solana (namespace: "solana", coinType: 501)
 *   - Bitcoin (namespace: "bip122", coinType: 0)
 */
export const MANUAL_CHAINS: ChainInfo[] = [
  {
    chainId: "solana",
    shortName: "solana",
    name: "Solana",
    coinType: 501, // SLIP-44 coin type for Solana
    namespace: "solana",
    reference: "So11111111111111111111111111111111111111112",
  },
  {
    chainId: "bitcoin",
    shortName: "bitcoin",
    name: "Bitcoin",
    coinType: 0, // SLIP-44 coin type for Bitcoin
    namespace: "bip122",
    reference: "000000000019d6689c085ae165831e93",
  },
];
