import { useState } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS } from '../blockchain/contractAddress';
import DocumentRegistryABI from '../blockchain/DocumentRegistry.json';

export default function DocumentSign({ onUpdate }) {
  const [hash, setHash] = useState('');
  const [loading, setLoading] = useState(false);

  const sign = async () => {
    if (!hash) return alert("Please enter the document hash");
    setLoading(true);
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      
      const contract = new ethers.Contract(CONTRACT_ADDRESS, DocumentRegistryABI.abi, signer);

      // 1. Fetch document data directly from the mapping
      const doc = await contract.documents(hash);
      
      // 2. Comprehensive Pre-flight Checks
      if (!doc.exists) {
        alert("❌ Error: Document hash not found. Did the seller register it yet?");
        setLoading(false);
        return;
      }

      const status = Number(doc.status);
      const isBuyer = userAddress.toLowerCase() === doc.buyer.toLowerCase();
      const isIntermediary = userAddress.toLowerCase() === doc.intermediary.toLowerCase();

      // 3. Logic Validation based on your Solidity Enums:
      // Status 1 = SignedBySeller, Status 2 = SignedByBuyer, Status 3 = Completed
      if (isBuyer && status !== 1) {
        alert(`❌ Sequence Error: Document is currently "${status === 2 ? 'Already Signed by Buyer' : 'Completed'}". You can only sign when status is "SignedBySeller".`);
      } else if (isIntermediary && status !== 2) {
        alert("❌ Sequence Error: The Law Firm can only sign AFTER the Buyer has signed.");
      } else if (!isBuyer && !isIntermediary) {
        alert(`❌ Unauthorized: Your wallet (${userAddress.substring(0, 6)}...) is not the designated Buyer or Law Firm for this document.`);
      } else {
        // 4. If all checks pass, proceed with transaction
        console.log("Checks passed. Sending transaction...");
        const tx = await contract.signDocument(hash);
        await tx.wait();
        alert("✅ Success! Document status updated.");
        if (onUpdate) onUpdate();
      }
    } catch (e) {
      console.error(e);
      alert("Blockchain Error: " + (e.reason || e.message));
    }
    setLoading(false);
  };

  return (
    <div className="card" style={{borderColor: '#2196F3', borderStyle: 'solid', borderWidth: '1px'}}>
      <h3>2. Counterparty: Sign Document</h3>
      <p style={{fontSize: '12px', color: '#666'}}>Buyer or Intermediary must sign in sequence.</p>
      <input 
        type="text" 
        placeholder="Paste Document Hash here" 
        value={hash}
        onChange={e => setHash(e.target.value)} 
      />
      <button 
        onClick={sign} 
        disabled={loading} 
        style={{background: '#2196F3', color: 'white', cursor: loading ? 'not-allowed' : 'pointer'}}
      >
        {loading ? "Processing..." : "Sign Transaction"}
      </button>
    </div>
  );
}