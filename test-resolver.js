import {
  parse7828Name,
  validateENSName,
  parseCAIP2ChainId,
} from "./src/parser.js";
import { resolveChain } from "./src/chain-resolver.js";
import { resolve7828 } from "./src/resolver.js";
import { byShortName } from "./src/chain-mapping.js";

console.log("Testing EIP-7828 Resolver Library\n");

// Test 1: Chain Mapping
console.log("Chain Mapping Test:");
console.log("Available chains:", Object.keys(byShortName).length);
console.log("Sample chains:", Object.keys(byShortName).slice(0, 5));
console.log("");

// Test 2: ENS Name Validation
console.log("ENS Name Validation Test:");
const testNames = [
  "alice.eth",
  "vitalik.eth",
  "test.app.eth",
  "invalid", // should fail
  "no-dot", // should fail
];

testNames.forEach((name) => {
  const isValid = validateENSName(name);
  console.log(`${isValid ? "✅" : "❌"} "${name}" -> ${isValid}`);
});
console.log("");

// Test 3: Chain Resolution
console.log("Chain Resolution Test:");
const testChains = [
  "1", // Ethereum
  "10", // Optimism
  "8453", // Base
  "137", // Polygon
  "ethereum", // Display name
  "optimism", // Display name
  "base", // Short name
  "polygon", // Short name
  "solana", // Non-EVM
  "bitcoin", // Non-EVM
  "invalid-chain", // Should fail
];

testChains.forEach((chain) => {
  try {
    const resolved = resolveChain(chain);
    console.log(`✅ "${chain}" -> ${JSON.stringify(resolved)}`);
  } catch (error) {
    console.log(`❌ "${chain}" -> ${error.message}`);
  }
});
console.log("");

// Test 4: CAIP-2 Parsing
console.log("CAIP-2 Parsing Test:");
const testCAIP2 = [
  "1", // Shorthand
  "eip155:1", // Full format
  "solana", // Non-EVM
  "bitcoin", // Non-EVM
  "optimism", // Display name
  "base", // Short name
  "invalid:format", // Should fail
];

testCAIP2.forEach((spec) => {
  try {
    const parsed = parseCAIP2ChainId(spec);
    console.log(
      `✅ "${spec}" -> namespace: ${parsed.namespace}, reference: ${parsed.reference}`
    );
  } catch (error) {
    console.log(`❌ "${spec}" -> ${error.message}`);
  }
});
console.log("");

// Test 5: Full EIP-7828 Name Parsing
console.log("EIP-7828 Name Parsing Test:");
const test7828Names = [
  "alice.eth@1",
  "vitalik.eth@ethereum",
  "test.app.eth@base",
  "bob.eth@optimism#abcd1234",
  "solana.eth@solana",
  "bitcoin.eth@bitcoin",
  "invalid@1", // Should fail
  "test.eth@invalid", // Should fail
  "no-at-symbol.eth", // Should fail
];

test7828Names.forEach((name) => {
  try {
    const parsed = parse7828Name(name);
    console.log(`✅ "${name}" -> ${JSON.stringify(parsed)}`);
  } catch (error) {
    console.log(`❌ "${name}" -> ${error.message}`);
  }
});
console.log("");

// Test 6: Full Resolution (if ethers is available)
console.log("Full Resolution Test:");
const resolutionTestNames = [
  "premm.eth@1",
  "ndeto.eth@solana",
  "vitalik.eth@ethereum",
  "clowes.eth@celo",
  "ndeto.eth@bitcoin",
];

// Use async/await for resolution
async function runResolutionTests() {
  for (const name of resolutionTestNames) {
    try {
      const resolved = await resolve7828(name);
      console.log(`✅ "${name}" -> ${JSON.stringify(resolved)}`);
    } catch (error) {
      console.log(`❌ "${name}" -> ${error.message}`);
    }
  }
}

// Run the test
runResolutionTests()
  .then(() => {
    console.log("\n🎉 Test completed!");
  })
  .catch((error) => {
    console.error("Test failed:", error);
  });

console.log("\n Test completed!");
