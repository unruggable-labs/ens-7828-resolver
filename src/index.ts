// Main exports
export { resolve7828, validate7828Name } from "./resolver.js";
export {
  format7828Name,
  parse7828Name,
  parseCAIP2ChainId,
  validateENSName,
} from "./parser.js";

// Chain Utilities
export {
  resolveChain,
  getAvailableChains,
  getChainById,
  getChainByShortName,
} from "./chain-resolver.js";

// Display name utilities
export {
  resolveDisplayName,
  getAvailableDisplayNames,
  getDisplayNameMapping,
  displayNameMappings,
} from "./display-names.js";

// Types
export type {
  ChainInfo,
  Parsed7828Name,
  ResolvedAddress,
  ResolveOptions,
} from "./types.js";

// chain mapping for advanced users
export { byChainId, byShortName, chains } from "./chain-mapping.js";
