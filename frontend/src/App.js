import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { getProvider } from './blockchain/provider';
import Layout from './components/Layout';
import './index.css';

function App() {
  const [account, setAccount] = useState("");

  const ensureSepoliaNetwork = async () => {
    const sepoliaChainId = '0xAA36A7'; 
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: sepoliaChainId }],
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: sepoliaChainId,
              chainName: 'Sepolia Testnet',
              rpcUrls: ['https://rpc.sepolia.org'],
              nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
              blockExplorerUrls: ['https://sepolia.etherscan.io'],
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
        await ensureSepoliaNetwork();
        const provider = getProvider();
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