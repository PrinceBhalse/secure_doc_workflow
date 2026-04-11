import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { getProvider } from '../blockchain/provider';
import { CONTRACT_ADDRESS } from '../blockchain/contractAddress';
import DocumentRegistryABI from '../blockchain/DocumentRegistry.json';
import { FileText, CheckCircle, Clock } from 'lucide-react';

export default function Overview({ account }) {
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const provider = getProvider();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, DocumentRegistryABI.abi, provider);
        
        const filter = contract.filters.DocumentRegistered();
        const logs = await contract.queryFilter(filter, -1000);
        
        let total = 0, completed = 0, pending = 0;
        
        for (const log of logs) {
          const hash = log.args[0];
          
          const doc = await contract.documents(hash);
          const isParticipant = 
            account.toLowerCase() === doc.seller.toLowerCase() || 
            account.toLowerCase() === doc.buyer.toLowerCase() || 
            account.toLowerCase() === doc.intermediary.toLowerCase();
            
          if (isParticipant) {
            total++;
            const status = Number(doc.status);
            if (status === 3) completed++;
            else pending++;
          }
        }
        setStats({ total, completed, pending });
      } catch (err) {
        console.error(err);
      }
    };
    if (account) fetchStats();
  }, [account]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-surface/60 border border-border p-6 rounded-2xl flex items-center space-x-6 hover:border-border/80 transition-colors shadow-sm">
        <div className="p-4 bg-primary/10 text-primary rounded-xl ring-1 ring-primary/20">
          <FileText size={32} />
        </div>
        <div>
          <p className="text-slate-400 text-sm font-medium uppercase tracking-wide">Total Documents</p>
          <p className="text-4xl font-bold text-white mt-1">{stats.total}</p>
        </div>
      </div>
      <div className="bg-surface/60 border border-border p-6 rounded-2xl flex items-center space-x-6 hover:border-border/80 transition-colors shadow-sm">
        <div className="p-4 bg-warning/10 text-warning rounded-xl ring-1 ring-warning/20">
          <Clock size={32} />
        </div>
        <div>
          <p className="text-slate-400 text-sm font-medium uppercase tracking-wide">Pending Action</p>
          <p className="text-4xl font-bold text-white mt-1">{stats.pending}</p>
        </div>
      </div>
      <div className="bg-surface/60 border border-border p-6 rounded-2xl flex items-center space-x-6 hover:border-border/80 transition-colors shadow-sm">
        <div className="p-4 bg-success/10 text-success rounded-xl ring-1 ring-success/20">
          <CheckCircle size={32} />
        </div>
        <div>
          <p className="text-slate-400 text-sm font-medium uppercase tracking-wide">Completed</p>
          <p className="text-4xl font-bold text-white mt-1">{stats.completed}</p>
        </div>
      </div>
    </div>
  );
}
