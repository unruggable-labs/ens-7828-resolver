import {
  byChainId,
  byShortName,
  byNameSpaceReference,
} from "./chain-mapping.js";
import { resolveDisplayName } from "./display-names.js";
import { parseCAIP2ChainId } from "./parser.js";
import { ChainInfo, ResolvedChain } from "./types.js";

/**
 * Resolve a chain specification to chain information
 * Supports multiple formats:
 * - Shorthand: 1, 8453 (EVM)
 * - Short names: base, optimism, ethereum, solana, bitcoin
 * - Display names: mapped to official chainlist shortnames src/display-names.ts
 * - ENS domains: base.l2.eth, optimism.l2.eth - Future 7785 support
 * - Non-EVM support: manual mapping for chains like Solana, Bitcoin, etc.
 *
 * @param chainSpec - The chain specification string (e.g., "base", "1", "ethereum")
 * @returns ResolvedChain object with chainId, coinType, and chainInfo
 * @example
 * resolveChain("base") // { chainId: 8453, coinType: 2147492101, chainInfo: { ... } }
 * resolveChain("solana") // { chainId: "solana", coinType: 501, chainInfo: { ... } }
 */
export function resolveChain(chainSpec: string): ResolvedChain {
  if (!chainSpec || typeof chainSpec !== "string") {
    throw new Error("Chain specification must be a non-empty string");
  }

  const trimmedSpec = chainSpec.trim().toLowerCase();

  // First, try to resolve display names to official short names
  const resolvedSpec = resolveDisplayName(trimmedSpec);

  // Try to parse as CAIP-2 format
  try {
    const { namespace, reference } = parseCAIP2ChainId(resolvedSpec);

    if (namespace === "eip155") {
      const chainId = parseInt(reference, 10);
      if (!chainId) {
        throw new Error(`Invalid chain ID: ${reference}`);
      }

      const chainInfo = byChainId[chainId];
      if (!chainInfo) {
        throw new Error(`Unknown chain ID: ${chainId}`);
      }

      return {
        chainId,
        coinType: chainInfo.coinType,
        chainInfo,
      };
    } else {
      const chainInfo = byNameSpaceReference[reference];
      if (!chainInfo) {
        throw new Error(`Unknown chain reference: ${reference}`);
      }
      return {
        chainId: (chainInfo.chainId as number) ?? 0,
        coinType: chainInfo.coinType,
        chainInfo,
      };
    }
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("Invalid CAIP-2 format")
    ) {
      throw error;
    }
  }

  // Try short name lookup (using resolved spec)
  const shortNameMatch = byShortName[resolvedSpec];
  if (shortNameMatch) {
    return {
      chainId: shortNameMatch.chainId as number,
      coinType: shortNameMatch.coinType,
      chainInfo: shortNameMatch,
    };
  }

  // @TODO Implement ENS domain format (e.g., base.l2.eth) once ERC-7785 is implemented

  // Try direct chain ID if it's a number
  const chainId = parseInt(resolvedSpec, 10);
  if (!isNaN(chainId)) {
    const directMatch = byChainId[chainId];
    if (directMatch) {
      return {
        chainId,
        coinType: directMatch.coinType,
        chainInfo: directMatch,
      };
    }
  }

  throw new Error(`Unknown chain specification: ${chainSpec}`);
}

/**
 * Get all available chains as an array of ChainInfo objects
 * @returns Array of ChainInfo for all supported chains
 */
export function getAvailableChains(): Array<ChainInfo> {
  return Object.values(byChainId);
}

/**
 * Get chain information by chain ID
 * @param chainId - The numeric chain ID
 * @returns ChainInfo object or undefined if not found
 */
export function getChainById(chainId: number): ChainInfo | undefined {
  return byChainId[chainId];
}

/**
 * Get chain information by short name
 * @param shortName - The short name of the chain (e.g., "eth", "base")
 * @returns ChainInfo object or undefined if not found
 */
export function getChainByShortName(shortName: string): ChainInfo | undefined {
  return byShortName[shortName.toLowerCase()];
}
