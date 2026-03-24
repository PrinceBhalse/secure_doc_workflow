import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Layout from './components/Layout';
import './index.css';

function App() {
  const [account, setAccount] = useState("");

  const ensureHardhatNetwork = async () => {
    const hardhatChainId = '0x7A69'; 
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: hardhatChainId }],
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: hardhatChainId,
              chainName: 'Hardhat Local',
              rpcUrls: ['http://127.0.0.1:8545'],
              nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
            }],
          });
        } catch (addError) {
          console.error("Failed to add network", addError);
        }
      }
    }
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        await ensureHardhatNetwork();
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);
      } catch (err) {
        console.error("Connection failed", err);
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        } else {
          setAccount("");
        }
      });
    }
  }, []);

  return <Layout account={account} connectWallet={connectWallet} />;
}

export default App;