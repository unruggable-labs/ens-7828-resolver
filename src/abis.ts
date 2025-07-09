// ENS Name Resolver ABI
export const ENS_RESOLVER_ABI = [
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "node",
        type: "bytes32",
      },
      {
        internalType: "uint256",
        name: "coinType",
        type: "uint256",
      },
    ],
    name: "addr",
    outputs: [
      {
        internalType: "bytes",
        name: "",
        type: "bytes",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

// ENS Registry ABI (minimal)
export const ENS_REGISTRY_ABI = [
  "function resolver(bytes32 node) external view returns (address)",
];
