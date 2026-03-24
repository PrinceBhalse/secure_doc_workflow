import React, { useState } from 'react';
import { LayoutDashboard, FilePlus, Clock, Archive, Wallet } from 'lucide-react';
import Overview from './Overview';
import DocumentRegister from './DocumentRegister';
import DocumentTable from './DocumentTable';

export default function Layout({ account, connectWallet }) {
  const [currentTab, setCurrentTab] = useState('Overview');

  const tabs = [
    { name: 'Overview', icon: LayoutDashboard },
    { name: 'Register New', icon: FilePlus },
    { name: 'Pending Signatures', icon: Clock },
    { name: 'Vault', icon: Archive },
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden text-slate-200">
      {/* Sidebar */}
      <aside className="w-64 bg-surface border-r border-border flex flex-col z-20 shadow-xl">
        <div className="p-6">
          <h1 className="text-xl font-bold flex items-center space-x-2 text-white">
            <span>🛡️ Notary Dashboard</span>
          </h1>
        </div>
        <nav className="flex-1 py-4">
          <ul>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <li key={tab.name} className="px-3 py-1">
                  <button
                    onClick={() => setCurrentTab(tab.name)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      currentTab === tab.name
                        ? 'bg-primary text-white shadow-lg shadow-primary/25'
                        : 'hover:bg-border/50 text-slate-400 hover:text-slate-100'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{tab.name}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="p-6 border-t border-border">
          {!account ? (
            <button
              onClick={connectWallet}
              className="w-full flex items-center justify-center space-x-2 bg-primary hover:bg-blue-600 text-white p-3 rounded-xl font-medium transition-colors shadow-lg shadow-primary/20"
            >
              <Wallet size={20} />
              <span>Connect Wallet</span>
            </button>
          ) : (
            <div className="bg-background/50 p-4 rounded-xl border border-border/50 shadow-inner">
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Connected Account</p>
              <p className="text-sm font-mono text-slate-200 truncate" title={account}>{account}</p>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto w-full relative">
        <div className="absolute inset-0 bg-gradient-to-br from-background to-surface/50 -z-10" />
        <header className="bg-surface/80 border-b border-border py-4 px-8 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-white">{currentTab}</h2>
        </header>
        <div className="p-8 max-w-6xl mx-auto">
          {!account && (
            <div className="flex flex-col items-center justify-center py-20 bg-surface/50 rounded-2xl border border-border border-dashed">
              <Wallet size={48} className="text-slate-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-white">Wallet Connection Required</h3>
              <p className="text-slate-400">Please connect your MetaMask wallet to view this section.</p>
            </div>
          )}
          {account && currentTab === 'Overview' && <Overview account={account} />}
          {account && currentTab === 'Register New' && <DocumentRegister account={account} />}
          {account && currentTab === 'Pending Signatures' && <DocumentTable account={account} filter="pending" />}
          {account && currentTab === 'Vault' && <DocumentTable account={account} filter="vault" />}
        </div>
      </main>
    </div>
  );
}
