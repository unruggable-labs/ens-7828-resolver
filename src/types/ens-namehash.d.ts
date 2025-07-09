declare module "@ensdomains/eth-ens-namehash" {
  export interface NameHash {
    hash(name: string): string;
    normalize(name: string): string;
  }

  const namehash: NameHash;
  export default namehash;
}
