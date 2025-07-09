import namehash from "@ensdomains/eth-ens-namehash";
import { bech32, bech32m } from "bech32";
import bs58 from "bs58";
import { ethers } from "ethers";

import { ENS_RESOLVER_ABI, ENS_REGISTRY_ABI } from "./abis.js";
import { resolveChain } from "./chain-resolver.js";
import { ENS_REGISTRY_ADDRESS } from "./constants.js";
import { parse7828Name } from "./parser.js";
import {
  ResolvedAddress,
  ResolveOptions,
  Parsed7828Name,
  ResolvedChain,
} from "./types.js";

/**
 * Resolve an EIP-7828 style ENS name to an address
 *
 * @param input - The EIP-7828 formatted name (e.g., "alice.eth@base")
 * @param options - Resolution options including provider and/or rpcUrl
 * @returns Promise resolving to a ResolvedAddress object with address, chainId, chainName, caip10, and coinType
 * @example
 * await resolve7828("alice.eth@base");
 * // {
 * //   address: '0x...',
 * //   chainId: 8453,
 * //   chainName: 'Base',
 * //   caip10: 'eip155:8453:0x...',
 * //   coinType: 2147492101
 * // }
 */
export async function resolve7828(
  input: string,
  options: ResolveOptions = {}
): Promise<ResolvedAddress> {
  // Parse input, validate format
  const parsed: Parsed7828Name = parse7828Name(input);

  // resolve the chain spec
  let resolvedChain: ResolvedChain;
  try {
    resolvedChain = resolveChain(parsed.chainSpec);
  } catch (error) {
    throw new Error(
      `Invalid chain specification: ${parsed.chainSpec} - ${error instanceof Error ? error.message : "Unknown chain"}`
    );
  }

  // Get or create provider
  let provider = options.provider;
  if (!provider) {
    if (options.rpcUrl) {
      provider = new ethers.JsonRpcProvider(options.rpcUrl);
    } else {
      // Use default Ethereum mainnet provider
      provider = new ethers.JsonRpcProvider("https://eth.llamarpc.com");
    }
  }

  // Compute the namehash
  const node = namehash.hash(parsed.ensName);

  // Get the resolver address from ENS registry
  const ensRegistry = new ethers.Contract(
    ENS_REGISTRY_ADDRESS,
    ENS_REGISTRY_ABI,
    provider
  );

  const resolverAddress: string = await ensRegistry.resolver(node);
  if (!resolverAddress || resolverAddress === ethers.ZeroAddress) {
    throw new Error(`No resolver found for ${parsed.ensName}`);
  }

  // Create resolver contract instance
  let resolver: ethers.Contract;
  let rawAddress: string;
  try {
    resolver = new ethers.Contract(resolverAddress, ENS_RESOLVER_ABI, provider);
    rawAddress = await resolver.addr(node, resolvedChain.coinType);
  } catch (error) {
    throw new Error(
      `Failed to resolve address for ${parsed.ensName} on chain ${resolvedChain.chainInfo.name} (coin type: ${resolvedChain.coinType}): ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }

  if (!rawAddress || rawAddress === ethers.ZeroAddress || rawAddress === "0x") {
    throw new Error(
      `No address found for ${parsed.ensName} on chain ${resolvedChain.chainInfo.name} (coin type: ${resolvedChain.coinType})`
    );
  }

  // Format the address based on chain type
  let formattedAddress: string;
  if (resolvedChain.coinType === 0) {
    formattedAddress = formatBitcoinAddress(rawAddress);
  } else if (resolvedChain.chainInfo.namespace === "solana") {
    formattedAddress = formatSolanaAddress(rawAddress);
  } else {
    formattedAddress = formatEvmAddress(rawAddress);
  }

  // Generate CAIP-10 identifier
  const caip10: string = `${resolvedChain.chainInfo.namespace}:${resolvedChain.chainInfo.reference}:${formattedAddress}`;

  return {
    address: formattedAddress,
    chainId: resolvedChain.chainId,
    chainName: resolvedChain.chainInfo.name,
    caip10,
    coinType: resolvedChain.coinType,
  };
}

/**
 * Validate an EIP-7828 name without resolving it
 *
 * @param input - The EIP-7828 formatted name
 * @returns boolean - Whether the name is valid
 * @example
 * validate7828Name("alice.eth@base") // true
 * validate7828Name("invalid@1") // false
 */
export function validate7828Name(input: string): boolean {
  try {
    // Parse for basic format validation
    const parsed = parse7828Name(input);

    // Validate that the chain specification is actually valid
    resolveChain(parsed.chainSpec);

    return true;
  } catch {
    return false;
  }
}

/**
 * Format a resolved address as an EIP-7828 name
 *
 * @param address - The resolved address
 * @returns string - The EIP-7828 formatted name (e.g., "0x...@Base")
 * @example
 * format7828Name({ address: "0x...", chainName: "Base", ... }) // "0x...@Base"
 */
export function format7828Name(address: ResolvedAddress): string {
  return `${address.address}@${address.chainName}`;
}

/**
 * Format a raw Bitcoin address (scriptPubKey bytes) to a bech32/bech32m address string.
 *
 * @param rawAddress - The raw address as a hex string (0x...)
 * @returns The formatted Bitcoin address (bech32 or bech32m)
 * @throws If the address format or witness version is unsupported
 */
function formatBitcoinAddress(rawAddress: string): string {
  if (typeof rawAddress === "string" && rawAddress.startsWith("0x")) {
    const script = Buffer.from(rawAddress.slice(2), "hex");
    let version: number;
    if (script[0] === 0x00) {
      version = 0;
    } else if (script[0] >= 0x51 && script[0] <= 0x60) {
      version = script[0] - 0x50;
    } else {
      throw new Error(
        `Unsupported witness version: 0x${script[0].toString(16)}`
      );
    }
    const progLen = script[1];
    const program = script.subarray(2, 2 + progLen);
    const words = bech32.toWords(program);
    words.unshift(version);
    const prefix = "bc";
    return (version === 0 ? bech32.encode : bech32m.encode)(prefix, words);
  }
  throw new Error("Invalid raw Bitcoin address format");
}

/**
 * Format a raw Solana address (hex string) to a base58 address string.
 *
 * @param rawAddress - The raw address as a hex string (0x...)
 * @returns The formatted Solana address (base58)
 * @throws If the address format is invalid
 */
function formatSolanaAddress(rawAddress: string): string {
  if (typeof rawAddress === "string" && rawAddress.startsWith("0x")) {
    const bytes = Buffer.from(rawAddress.slice(2), "hex");
    return bs58.encode(bytes);
  }
  throw new Error("Invalid raw Solana address format");
}

/**
 * Format a raw EVM address to a checksummed hex address string.
 * Handles both padded and standard 20-byte hex strings.
 *
 * @param rawAddress - The raw address as a hex string (0x...)
 * @returns The formatted EVM address (checksummed hex)
 * @throws If the address format is invalid
 */
function formatEvmAddress(rawAddress: string): string {
  if (
    typeof rawAddress === "string" &&
    rawAddress.startsWith("0x") &&
    rawAddress.length > 42
  ) {
    return ethers.getAddress(rawAddress.slice(0, 42));
  } else if (ethers.isHexString(rawAddress, 20)) {
    return ethers.getAddress(rawAddress);
  }
  throw new Error("Invalid raw EVM address format");
}
