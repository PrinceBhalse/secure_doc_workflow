import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS } from '../blockchain/contractAddress';
import DocumentRegistryABI from '../blockchain/DocumentRegistry.json';
import { PenTool, CheckCircle, Clock, Download } from 'lucide-react';

export default function DocumentTable({ account, filter }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [signingHash, setSigningHash] = useState(null);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, DocumentRegistryABI.abi, provider);
      
      const eventFilter = contract.filters.DocumentRegistered();
      const logs = await contract.queryFilter(eventFilter, -1000);
      
      const docs = [];
      
      for (const log of logs) {
        const hash = log.args[0];
        const docInfo = await contract.documents(hash);
        
        const isParticipant = 
          account.toLowerCase() === docInfo.seller.toLowerCase() || 
          account.toLowerCase() === docInfo.buyer.toLowerCase() || 
          account.toLowerCase() === docInfo.intermediary.toLowerCase();
          
        if (isParticipant) {
          const statusNum = Number(docInfo.status);
          
          let displayStatus = 'Pending';
          let statusColor = 'bg-warning/20 text-warning border-warning/30';
          let statusIcon = <Clock size={14} className="mr-1" />;
          
          if (statusNum === 3) {
            displayStatus = 'Completed';
            statusColor = 'bg-success/20 text-success border-success/30';
            statusIcon = <CheckCircle size={14} className="mr-1" />;
          } else if (statusNum === 2) {
            displayStatus = 'Signed';
            statusColor = 'bg-primary/20 text-primary border-primary/30';
            statusIcon = <PenTool size={14} className="mr-1" />;
          }

          const actionRequired = 
            (account.toLowerCase() === docInfo.buyer.toLowerCase() && statusNum === 1) ||
            (account.toLowerCase() === docInfo.intermediary.toLowerCase() && statusNum === 2);

          // Filtering
          if (filter === 'pending' && !actionRequired) {
             continue; // pending tab only shows docs needing MY signature
          }

          docs.push({
            hash,
            seller: docInfo.seller,
            buyer: docInfo.buyer,
            intermediary: docInfo.intermediary,
            statusNum,
            displayStatus,
            statusColor,
            statusIcon,
            actionRequired
          });
        }
      }
      setDocuments(docs.reverse());
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (account) fetchDocuments();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, filter]);

  const signDocument = async (hash) => {
    setSigningHash(hash);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, DocumentRegistryABI.abi, signer);
      
      const tx = await contract.signDocument(hash);
      await tx.wait();
      
      fetchDocuments();
    } catch (e) {
      alert(e.message || "Failed to sign document");
    }
    setSigningHash(null);
  };

  return (
    <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden text-slate-200">
      <div className="p-6 border-b border-border flex justify-between items-center">
        <h3 className="text-xl font-bold text-white">
          {filter === 'pending' ? 'Documents Requiring Your Signature' : 'Document Vault'}
        </h3>
        <button onClick={fetchDocuments} className="text-sm px-4 py-2 bg-background border border-border rounded-lg hover:bg-border transition-colors font-medium cursor-pointer relative z-10">
          Refresh List
        </button>
      </div>
      
      <div className="overflow-x-auto relative">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading documents from blockchain...</div>
        ) : documents.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            No documents found matching the criteria.
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-background border-b border-border">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Document Hash</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden md:table-cell">Seller</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden md:table-cell">Buyer</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {documents.map((doc, idx) => (
                <tr key={idx} className="hover:bg-background/80 transition-colors">
                  <td className="px-6 py-4 font-mono text-sm max-w-xs truncate" title={doc.hash}>{doc.hash.substring(0, 16)}...</td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-400 hidden md:table-cell">
                    {doc.seller.toLowerCase() === account.toLowerCase() ? <span className="text-white font-bold bg-white/10 px-2 py-1 rounded">You</span> : doc.seller.substring(0, 8) + '...'}
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-400 hidden md:table-cell">
                    {doc.buyer.toLowerCase() === account.toLowerCase() ? <span className="text-white font-bold bg-white/10 px-2 py-1 rounded">You</span> : doc.buyer.substring(0, 8) + '...'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${doc.statusColor}`}>
                      {doc.statusIcon} {doc.displayStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right flex items-center justify-end space-x-3">
                    {doc.actionRequired ? (
                      <button 
                        onClick={() => signDocument(doc.hash)}
                        disabled={signingHash === doc.hash}
                        className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors cursor-pointer relative z-10 ${
                          signingHash === doc.hash 
                            ? 'bg-primary/50 text-white cursor-not-allowed' 
                            : 'bg-primary hover:bg-blue-600 text-white shadow-lg shadow-primary/20'
                        }`}
                      >
                        <PenTool size={16} />
                        <span>{signingHash === doc.hash ? 'Signing...' : 'Sign Now'}</span>
                      </button>
                    ) : (
                      <span className="text-slate-500 text-sm italic pr-4">No action needed</span>
                    )}
                    <a 
                      href={`https://gateway.pinata.cloud/ipfs/${doc.hash}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-bold border border-border hover:bg-border transition-colors"
                      title="Download/View Document"
                    >
                      <Download size={16} />
                      <span className="hidden md:inline">View</span>
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
