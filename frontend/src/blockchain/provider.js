import { ethers } from 'ethers';

let sharedProvider = null;

export const getProvider = () => {
  if (!window.ethereum) return null;
  if (!sharedProvider) {
    // Reusing a single BrowserProvider instance prevents ethers v6 from starting multiple 
    // eth_blockNumber polling loops, which causes "RPC rate limit" errors.
    sharedProvider = new ethers.BrowserProvider(window.ethereum, 'any');
  }
  return sharedProvider;
};
