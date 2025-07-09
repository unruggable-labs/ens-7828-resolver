# ENS-7828-Resolver

## Quick Test

```bash
npm install
npx tsx test-resolver.js
```

Run these commands to install dependencies and quickly verify the library resolves EIP-7828 names across multiple chains.

---

**[See Architecture Overview →](./ARCHITECTURE.md)**

A fully-featured TypeScript library for parsing, resolving and displaying EIP-7828-style human-readable, chain-specific ENS names.

## Overview

This library implements the [EIP-7828](https://github.com/jrudolf/ERCs/blob/master/ERCS/erc-7828.md) specification for human-readable, chain-specific ENS names. It supports parsing and resolving names like:

- `alice.eth@base`
- `vitalik.eth@1`
- `bob.app.eth@optimism`
- `test.eth@base#abcd1234`

## Features

- **EIP-7828 Compliant**: Full implementation of the EIP-7828 specification
- **Multi-chain Support**: Resolves addresses across Ethereum, Base, Optimism, Arbitrum, Polygon, Solana, Bitcoin, and more
- **Standards Compliant**:
  - Multi-coin address lookup via [ENSIP-9](https://eips.ethereum.org/EIPS/eip-2055)
  - Chain metadata via CAIP-2/CAIP-10
  - Future support for [EIP-7785](https://eips.ethereum.org/EIPS/eip-7785) ENS chain specification
- **Zero-friction Installation**: Pre-compiled chain mapping shipped in package

## Installation

```bash
npm install @unruggable-labs/ens-7828-resolver
```

## Quick Start

```typescript
import { resolve7828 } from "@unruggable-labs/ens-7828-resolver";

// Resolve an ENS name on a specific chain
const result = await resolve7828("vitalik.eth@ethereum");

console.log(result);
// {
//   address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
//   chainId: 1,
//   chainName: 'Ethereum Mainnet',
//   caip10: 'eip155:1:0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
//   coinType: 60
// }
```

## API Reference

### Core Functions

#### `resolve7828(input: string, options?: ResolveOptions): Promise<ResolvedAddress>`

Resolves an EIP-7828 formatted name to an address.

**Parameters:**

- `input`: EIP-7828 formatted name (e.g., "alice.eth@base")
- `options`: Optional configuration
  - `provider`: ethers.js provider instance
  - `rpcUrl`: RPC URL for the provider

**Returns:** Promise resolving to `ResolvedAddress`

**Example:**

```typescript
const result = await resolve7828("ndeto.eth@solana");
// {
//   address: 'GwjiVpwPmfmh8T4EXqtsiuU1YoYknxAKLe6ujMDgLgmV',
//   chainId: 'So11111111111111111111111111111111111111112',
//   chainName: 'Solana',
//   caip10: 'solana:So11111111111111111111111111111111111111112:GwjiVpwPmfmh8T4EXqtsiuU1YoYknxAKLe6ujMDgLgmV',
//   coinType: 501
// }
```

#### `parse7828Name(input: string): Parsed7828Name`

Parses an EIP-7828 name without resolving it.

**Parameters:**

- `input`: EIP-7828 formatted name

**Returns:** `Parsed7828Name` object

**Example:**

```typescript
const parsed = parse7828Name("alice.eth@base#abcd1234");
// {
//   ensName: "alice.eth",
//   chainSpec: "base",
//   checksum: "abcd1234"
// }
```

#### `validate7828Name(input: string): boolean`

Validates an EIP-7828 name format.

**Parameters:**

- `input`: EIP-7828 formatted name

**Returns:** `boolean` indicating if the name is valid

### Chain Resolution

#### `resolveChain(chainSpec: string): ResolvedChain`

Resolves a chain specification to chain information.

**Supported formats:**

- Chain ID: `1`, `8453`, `10`
- Short names: `base`, `oeth`, `arb1`
- Display names: `ethereum`, `optimism`, `arbitrum`, `polygon`

**Future EIP-7785 Support:**

- ENS domain-based specs: `base.l2.eth`, `optimism.l2.eth` (planned)

### Utility Functions

#### `format7828Name(address: ResolvedAddress): string`

Formats a resolved address as an EIP-7828 name string (e.g., `<address>@<chainName>`).

## Supported Chains

The library includes pre-compiled chain mappings for popular networks:

### EVM Chains

| Chain           | Chain ID | Short Name | Display Name | Coin Type  |
| --------------- | -------- | ---------- | ------------ | ---------- |
| Ethereum        | 1        | eth        | ethereum     | 60         |
| Base            | 8453     | base       | base         | 2147492101 |
| Optimism        | 10       | oeth       | optimism     | 2147483658 |
| Arbitrum One    | 42161    | arb1       | arbitrum     | 2147525809 |
| Polygon         | 137      | pol        | polygon      | 966        |
| BNB Smart Chain | 56       | bnb        | bnb          | 714        |
| Avalanche       | 43114    | avax       | avalanche    | 9000       |
| Fantom          | 250      | ftm        | fantom       | 250        |
| Celo            | 42220    | celo       | celo         | 2147525868 |

### Non-EVM Chains

| Chain   | Short Name | Display Name | Coin Type | Namespace |
| ------- | ---------- | ------------ | --------- | --------- |
| Solana  | solana     | solana       | 501       | solana    |
| Bitcoin | bitcoin    | bitcoin      | 0         | bip122    |

## Chain Specification Formats

### Valid EIP-7828 Examples

```bash
# Chain ID format
alice.eth@1
vitalik.eth@8453

# Display name format
bob.eth@ethereum
test.eth@base
clowes.eth@solana

# Short name format
user.eth@oeth
app.eth@arb1
```

### Invalid Formats

```bash
# Full CAIP-2 in chainSpec (not supported)
alice.eth@eip155:1
test.eth@solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d

# Invalid ENS name
invalid@1
no-at-symbol.eth
```

## Future Standards Support

For the long-term vision of decentralized multi-chain ENS resolution—including how ERC-7930 and ERC-7785 mapping will work together, see [ARCHITECTURE.md](./ARCHITECTURE.md) for details on the end-state and technical flow.

## Development

### Building

```bash
# Install dependencies
npm install

# Build the library
npm run build

# Run tests
npm test
```

### Adding New EVM Chains

To add a new EVM chain to the pre-populated list:

1. **Edit `scripts/chains.ts`:**

   ```typescript
   export const MAJOR_CHAINS = [
     // ... existing chains
     { chainId: YOUR_CHAIN_ID, identifier: "your-chain" },
   ];
   ```

2. **Regenerate chain mapping:**
   ```bash
   npm run prepare
   ```

### Adding Non-EVM Chains

To add a new non-EVM chain:

1. **Edit `scripts/chains.ts`:**

   ```typescript
   export const MANUAL_CHAINS: ChainInfo[] = [
     // ... existing chains
     {
       chainId: "your-chain", // String identifier
       shortName: "your-chain",
       name: "Your Chain",
       slip44: YOUR_COIN_TYPE, // From SLIP-44 standard
       namespace: "your-namespace", // e.g., "solana", "bip122"
       reference: "your-genesis-hash-or-identifier",
     },
   ];
   ```

2. **Regenerate chain mapping:**
   ```bash
   npm run prepare
   ```

## Coin Type Derivation

The library uses the following rules for coin type derivation:

- **EVM Chains:**
  - Coin type is derived using [ENSIP-11](https://docs.ens.domains/ensip/11):
    - Formula: `(chainId | 0x80000000) >>> 0` (i.e., 0x80000000 + chainId)
    - Example: Chain ID 42220 (Celo) → Coin Type 2147525868
- **Non-EVM Chains:**
  - Coin type is the [SLIP-44](https://github.com/satoshilabs/slips/blob/master/slip-0044.md) value for the chain (no offset):
    - Example: Solana: 501, Bitcoin: 0

**Note:** Coin type is always represented as a uint (unsigned integer), and is the value used by ENS contracts and multicoin records. For EVM chains, ENSIP-11 is the source of truth; for non-EVM chains, SLIP-44 is the source of truth.

## Contributing

### Adding New Chains

1. **EVM Chains**: Add to `MAJOR_CHAINS` in `scripts/chains.ts`
2. **Non-EVM Chains**: Add to `MANUAL_CHAINS` in `scripts/chains.ts`
3. **Regenerate**: Run `npm run prepare` to update mappings
4. **Test**: Add test cases to `test-library.js`

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `npm run prepare` && `npm run build`
5. Submit a pull request

### Testing

```bash
# Run the test suite
npx tsx test-resolver.js
```

## License

MIT
