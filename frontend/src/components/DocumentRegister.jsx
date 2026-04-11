import { useState, useRef } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';
import { getProvider } from '../blockchain/provider';
import { CONTRACT_ADDRESS } from '../blockchain/contractAddress';
import DocumentRegistryABI from '../blockchain/DocumentRegistry.json';
import { UploadCloud, CheckCircle } from 'lucide-react';


export default function DocumentRegister({ account }) {
  const [file, setFile] = useState(null);
  const [buyer, setBuyer] = useState('');
  const [intermediary, setIntermediary] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [successHash, setSuccessHash] = useState('');

  const fileInputRef = useRef(null);

  const onDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = () => setIsDragging(false);
  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const uploadToIPFS = async (fileToUpload) => {
    const formData = new FormData();
    formData.append('file', fileToUpload);
    const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
      headers: {
        'Authorization': `Bearer ${process.env.REACT_APP_PINATA_JWT}`
      }
    });
    return res.data.IpfsHash;
  };

  const register = async () => {
    if (!file || !buyer || !intermediary) return alert("Missing fields!");
    setLoading(true);
    setSuccessHash('');
    
    let cid;
    try {
      setLoadingText('Uploading to Decentralized Storage...');
      cid = await uploadToIPFS(file);
    } catch (e) {
      setLoading(false);
      return alert("IPFS Upload Failed");
    }

    try {
      setLoadingText('Processing Transaction...');
      const provider = getProvider();
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, DocumentRegistryABI.abi, signer);

      const tx = await contract.registerDocument(cid, buyer, intermediary);
      await tx.wait();
      setSuccessHash(cid);
      setFile(null);
      setBuyer('');
      setIntermediary('');
    } catch (e) { 
      alert(e.message || "Failed to register document"); 
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto bg-surface border border-border rounded-xl p-8 shadow-sm">
      <h3 className="text-xl font-bold mb-6 text-white">Register & Sign New Document</h3>
      
      <div 
        className={`border-2 border-dashed rounded-xl p-10 mb-6 text-center transition-colors cursor-pointer
          ${isDragging ? 'border-primary bg-primary/10' : 'border-border hover:border-slate-500'}
          ${file ? 'bg-surface/80' : ''}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input type="file" ref={fileInputRef} className="hidden" onChange={e => {
            if (e.target.files && e.target.files.length > 0) setFile(e.target.files[0]);
        }} />
        {!file ? (
          <div className="flex flex-col items-center">
            <UploadCloud size={48} className="text-slate-400 mb-4" />
            <p className="text-slate-300 font-medium text-lg">Drag & drop a file here</p>
            <p className="text-slate-500 text-sm mt-2">or click to browse</p>
          </div>
        ) : (
          <div className="flex flex-col items-center flex-wrap" style={{wordBreak: "break-all"}}>
            <CheckCircle size={48} className="text-success mb-4" />
            <p className="text-slate-200 font-medium text-lg">{file.name}</p>
            <p className="text-slate-500 text-sm mt-2">{(file.size / 1024).toFixed(2)} KB</p>
          </div>
        )}
      </div>

      <div className="space-y-4 mb-8">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Buyer Address</label>
          <input 
            type="text" 
            className="w-full bg-background border border-border rounded-lg px-4 py-3 text-slate-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            placeholder="0x..." 
            value={buyer}
            onChange={e => setBuyer(e.target.value)} 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Law Firm (Intermediary) Address</label>
          <input 
            type="text" 
            className="w-full bg-background border border-border rounded-lg px-4 py-3 text-slate-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            placeholder="0x..." 
            value={intermediary}
            onChange={e => setIntermediary(e.target.value)} 
          />
        </div>
      </div>

      <button 
        onClick={register} 
        disabled={loading || !file || !buyer || !intermediary}
        className={`w-full py-4 rounded-xl font-bold transition-all shadow-lg text-lg ${
          loading || !file || !buyer || !intermediary 
            ? 'bg-primary/50 text-white/50 cursor-not-allowed' 
            : 'bg-primary hover:bg-blue-600 text-white shadow-primary/25'
        }`}
      >
        {loading ? loadingText : "Register & Sign First"}
      </button>

      {successHash && (
        <div className="mt-6 p-4 bg-success/20 border border-success/30 rounded-lg flex items-start space-x-3">
          <CheckCircle className="text-success mt-0.5" size={20} />
          <div className="flex-1 w-full" style={{wordBreak: "break-all"}}>
            <h4 className="text-success font-bold">Successfully Registered!</h4>
            <p className="text-slate-300 text-sm mt-1">Hash: {successHash}</p>
          </div>
        </div>
      )}
    </div>
  );
}