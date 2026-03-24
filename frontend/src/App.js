import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS } from './blockchain/contractAddress';
import DocumentRegistryABI from './blockchain/DocumentRegistry.json';
import DocumentRegister from './components/DocumentRegister';
import DocumentSign from './components/DocumentSign';
import DocumentStatus from './components/DocumentStatus';
import './index.css';

function App() {
  const [account, setAccount] = useState("");
  const [history, setHistory] = useState([]);

  // 1. FORCED NETWORK SWITCH LOGIC
  const ensureHardhatNetwork = async () => {
    const hardhatChainId = '0x7A69'; // 31337 in Hex

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: hardhatChainId }],
      });
    } catch (switchError) {
      // This error code (4902) indicates the network is not added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: hardhatChainId,
                chainName: 'Hardhat Local',
                rpcUrls: ['http://127.0.0.1:8545'],
                nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
              },
            ],
          });
        } catch (addError) {
          console.error("Failed to add network", addError);
        }
      }
    }
  };

  // 2. Connect Wallet Logic
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        // FORCE the switch to Hardhat first to stop the "Deceptive" warning
        await ensureHardhatNetwork();

        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();

        setAccount(address);
        console.log("Connected to:", address);
      } catch (err) {
        console.error("Connection failed", err);
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  // 3. Fetch History using Events
  const fetchHistory = useCallback(async () => {
    try {
      const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
      const contract = new ethers.Contract(CONTRACT_ADDRESS, DocumentRegistryABI.abi, provider);

      const filter = contract.filters.DocumentRegistered();
      const logs = await contract.queryFilter(filter, -1000);

      const parsedHistory = logs.map(log => ({
        hash: log.args[0],
        seller: log.args[1],
        buyer: log.args[2],
        type: "Registration"
      }));

      setHistory(parsedHistory.reverse());
    } catch (err) {
      console.error("Failed to fetch history:", err);
    }
  }, []);

  useEffect(() => {
    if (window.ethereum) {
      // Listen for account changes
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          console.log("Switched to account:", accounts[0]);
        } else {
          setAccount("");
        }
      });
    }
  }, []);

  useEffect(() => {
    if (account) {
      fetchHistory();
    }
  }, [account, fetchHistory]);

  return (
    <div className="container">
      <header style={{ padding: "20px", textAlign: "center" }}>
        <h1>🔐 Secure Doc Workflow</h1>
        {!account ? (
          <button onClick={connectWallet} className="connect-btn">
            Connect Wallet (Hardhat)
          </button>
        ) : (
          <div className="account-info">
            <p>Connected to Hardhat Local: <strong>{account}</strong></p>
          </div>
        )}
      </header>

      {account && (
        <div className="main-content">
          <div className="grid">
            <DocumentRegister onUpdate={fetchHistory} />
            <DocumentSign onUpdate={fetchHistory} />
            <DocumentStatus />
          </div>

          <section className="history-section">
            <h2>📜 Recent Activity</h2>
            <div className="history-list">
              {history.length === 0 ? (
                <p>No documents found. Start by registering one!</p>
              ) : (
                history.map((doc, index) => (
                  <div key={index} className="history-item">
                    <p><strong>Hash:</strong> {doc.hash.substring(0, 20)}...</p>
                    <p><small>Seller: {doc.seller.substring(0, 10)}... | Buyer: {doc.buyer.substring(0, 10)}...</small></p>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default App;