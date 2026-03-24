import { useState } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS } from '../blockchain/contractAddress';
import DocumentRegistryABI from '../blockchain/DocumentRegistry.json';

export default function DocumentRegister({ onUpdate }) {
  const [file, setFile] = useState(null);
  const [buyer, setBuyer] = useState('');
  const [intermediary, setIntermediary] = useState('');
  const [loading, setLoading] = useState(false);

  const register = async () => {
    if (!file || !buyer || !intermediary) return alert("Missing fields!");
    setLoading(true);
    try {
      const buffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
      const hash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, DocumentRegistryABI.abi, signer);

      const tx = await contract.registerDocument(hash, buyer, intermediary);
      await tx.wait();
      alert("Success! Hash: " + hash);
      onUpdate();
    } catch (e) { alert(e.message); }
    setLoading(false);
  };

  return (
    <div className="card">
      <h3>1. Seller: Register Document</h3>
      <input type="file" onChange={e => setFile(e.target.files[0])} />
      <input type="text" placeholder="Buyer Address (0x...)" onChange={e => setBuyer(e.target.value)} />
      <input type="text" placeholder="Law Firm Address (0x...)" onChange={e => setIntermediary(e.target.value)} />
      <button onClick={register} disabled={loading}>{loading ? "Processing..." : "Register & Sign"}</button>
    </div>
  );
}