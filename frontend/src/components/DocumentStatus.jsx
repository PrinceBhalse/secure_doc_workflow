import { useState } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS } from '../blockchain/contractAddress';
import DocumentRegistryABI from '../blockchain/DocumentRegistry.json';

export default function DocumentStatus() {
  const [hash, setHash] = useState('');
  const [status, setStatus] = useState(null);
  const statusMap = ["Pending", "Signed by Seller", "Signed by Buyer", "Completed"];

  const checkStatus = async () => {
  if (!hash) return alert("Please enter a hash");
  
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    
    // DEBUG: Log the network to ensure we aren't on Mainnet
    const network = await provider.getNetwork();
    console.log("Current Chain ID:", network.chainId); 

    const contract = new ethers.Contract(CONTRACT_ADDRESS, DocumentRegistryABI.abi, provider);

    // DEBUG: Try to fetch the bytecode at that address
    const code = await provider.getCode(CONTRACT_ADDRESS);
    if (code === "0x") {
       alert("🚨 CONTRACT NOT FOUND! Verify your address in contractAddress.js matches the terminal.");
       return;
    }

    const result = await contract.getStatus(hash);
    setStatus(statusMap[Number(result)]);
  } catch (err) {
    console.error(err);
    alert("Error communicating with contract.");
  }
};

  return (
    <div className="card">
      <h3>3. Track Progress</h3>
      <input 
        type="text" 
        placeholder="Enter File Hash to check" 
        value={hash}
        onChange={e => setHash(e.target.value)} 
      />
      <button onClick={checkStatus}>Check Status</button>
      {status && (
        <p style={{ marginTop: '10px' }}>
          Current Status: <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>{status}</span>
        </p>
      )}
    </div>
  );
}