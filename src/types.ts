import { z } from "zod";

export const ChainListInfoSchema = z.object({
  chainId: z.number(),
  shortName: z.string(),
  name: z.string(),
  slip44: z.number().optional(),
  namespace: z.string().optional(),
  reference: z.string().optional(),
});

export interface ChainInfo {
  chainId: number | string;
  shortName: string;
  name: string;
  coinType: number;
  namespace?: string;
  reference?: string;
}

export type ChainListSchema = z.infer<typeof ChainListInfoSchema>;

export interface Parsed7828Name {
  ensName: string;
  chainSpec: string;
  checksum?: string;
}

export interface ResolvedChain {
  chainId: number;
  coinType: number;
  chainInfo: ChainInfo;
}

export interface ResolvedAddress {
  address: string;
  chainId: number;
  chainName: string;
  caip10: string;
  coinType: number;
}

export interface ResolveOptions {
  provider?: any;
  rpcUrl?: string;
}