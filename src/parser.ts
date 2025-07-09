import { ethers } from "ethers";

import { byShortName } from "./chain-mapping.js";
import { Parsed7828Name, ResolvedAddress } from "./types.js";

/**
 * Parse an EIP-7828 style ENS name
 * Format: <ensName>@<chainSpec>[#<checksum>]
 *
 * @param input - The EIP-7828 formatted name (e.g., "alice.eth@base#abcd1234")
 * @returns Parsed7828Name object:
 *   {
 *     ensName: string,      // normalized ENS name
 *     chainSpec: string,    // chain spec (e.g., "base", "1")
 *     checksum?: string     // optional checksum (if present)
 *   }
 *
 * @example
 * parse7828Name("alice.eth@base#abcd1234")
 * // returns:
 * // {
 * //   ensName: "alice.eth",
 * //   chainSpec: "base",
 * //   checksum: "abcd1234"
 * // }
 *
 * parse7828Name("vitalik.eth@1")
 * // returns:
 * // {
 * //   ensName: "vitalik.eth",
 * //   chainSpec: "1",
 * //   checksum: undefined
 * // }
 */
export function parse7828Name(input: string): Parsed7828Name {
  if (!input || typeof input !== "string") {
    throw new Error("Input must be a non-empty string");
  }

  // Split on @ to separate ENS name from chain spec
  const parts = input.split("@");
  if (parts.length !== 2) {
    throw new Error("Invalid format: must contain exactly one @ symbol");
  }

  const [ensName, chainPart] = parts;

  // Validate ENS name
  if (!validateENSName(ensName)) {
    throw new Error("Invalid ENS name format");
  }

  // Check for checksum
  let chainSpec = chainPart;
  let checksum: string | undefined;

  const checksumIndex = chainPart.indexOf("#");
  if (checksumIndex !== -1) {
    chainSpec = chainPart.substring(0, checksumIndex);
    checksum = chainPart.substring(checksumIndex + 1);

    // Validate checksum format (4 hex bytes)
    if (!/^[0-9a-fA-F]{8}$/.test(checksum)) {
      throw new Error("Checksum must be exactly 8 hexadecimal characters");
    }

    // @TODO: Validate checksum. Done via ERC-7930 and dependant on implementation of EIP-7785
  }

  // Validate chain spec is not empty
  if (!chainSpec || chainSpec.trim() === "") {
    throw new Error("Chain specification cannot be empty");
  }

  const trimmedChainSpec = chainSpec.trim();

  // Basic validation - chain specification should not be empty
  if (!trimmedChainSpec) {
    throw new Error("Chain specification cannot be empty");
  }

  return {
    ensName: ethers.ensNormalize(ensName),
    chainSpec: trimmedChainSpec,
    checksum,
  };
}

/**
 * Validate that an ENS name follows basic format rules
 * @param name - The ENS name to validate
 * @returns boolean - true if valid, false otherwise
 */
export function validateENSName(name: string): boolean {
  if (!name || typeof name !== "string") {
    return false;
  }

  // Must contain at least one dot
  if (!name.includes(".")) {
    return false;
  }

  // Basic character validation (simplified)
  const validChars = /^[a-zA-Z0-9.-]+$/;
  return validChars.test(name);
}

/**
 * Parse CAIP-2 chain identifier
 * Supports formats:
 *   - eip155:<chainId>
 *   - <chainId> (shorthand for eip155)
 *   - bip122:<genesisHash>
 * @param chainSpec - The chain specification string
 * @returns An object with namespace and reference fields
 * @example
 * parseCAIP2ChainId("1") // { namespace: "eip155", reference: "1" }
 * parseCAIP2ChainId("solana") // { namespace: "eip155", reference: "solana" }
 */
export function parseCAIP2ChainId(chainSpec: string): {
  namespace: string;
  reference: string;
} {
  // Handle shorthand format e.g vitalik.eth@1
  if (/^\d+$/.test(chainSpec)) {
    return {
      namespace: "eip155",
      reference: chainSpec,
    };
  }

  // Check for short names and display names in the generated chain mapping
  const chain = byShortName[chainSpec.toLowerCase()];
  if (chain && chain.namespace && chain.reference) {
    return {
      namespace: chain.namespace,
      reference: chain.reference,
    };
  }

  // If it's not a number, and not in chain mapping, treat as short name (default to eip155)
  return {
    namespace: "eip155",
    reference: chainSpec,
  };
}

/**
 * Format a resolved address as an EIP-7828 name
 *
 * @param address - The resolved address
 * @returns string - The EIP-7828 formatted name
 */
export function format7828Name(address: ResolvedAddress): string {
  return `${address.address}@${address.chainName}`;
}
