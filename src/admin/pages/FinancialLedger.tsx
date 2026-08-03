import React, { useState, useEffect } from 'react';
import { adminDb, type AdminTransaction } from '../services/adminDb';
import { CardSend, Refresh, SearchNormal1 } from 'iconsax-react';
import { Button, Spinner } from '@heroui/react';

export const FinancialLedger: React.FC = () => {
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadLedger();
  }, []);

  const loadLedger = async () => {
    setLoading(true);
    const data = await adminDb.getAllTransactions();
    setTransactions(data);
    setLoading(false);
  };

  const filtered = transactions.filter(t => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.reference.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q) ||
      (t.userName && t.userName.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 text-left animate-in fade-in">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <span className="text-[9px] text-brand-600 font-extrabold uppercase tracking-widest block">Audit Trail</span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Master Financial Ledger</h1>
        </div>
        <Button onClick={loadLedger} className="bg-white border border-slate-200 text-slate-900 font-extrabold text-xs h-9 px-4 rounded-xl cursor-pointer hover:bg-slate-50 shadow-xs flex items-center gap-1.5">
          <Refresh size={14} color="#0f172a" variant="Broken" />
          <span>Sync Transactions</span>
        </Button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-2.5 px-3.5 h-11 bg-white border border-slate-200 rounded-2xl max-w-md focus-within:border-brand-500 transition-all shadow-xs">
        <SearchNormal1 size={15} color="#64748b" variant="Broken" />
        <input 
          type="text" 
          placeholder="Filter by ref, user, or category..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="bg-transparent text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none w-full"
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-[28px] overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-slate-700 text-xs flex flex-col items-center gap-2">
            <Spinner size="md" />
            <span className="font-extrabold">Loading ledger entries...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
            <CardSend size={36} color="#3b82f6" variant="Broken" className="mb-1" />
            <p className="font-black text-slate-900 text-sm">No Transactions Found</p>
            <p className="text-slate-500 font-medium">No financial transactions match your current query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-black uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Reference</th>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-900">
                {filtered.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-mono font-black text-slate-900">{t.reference}</td>
                    <td className="px-6 py-4 font-black text-slate-900">{t.userName}</td>
                    <td className="px-6 py-4 font-extrabold text-brand-600 uppercase tracking-wider text-[10px]">{t.category}</td>
                    <td className="px-6 py-4">
                      <span className={`font-black ${t.type === 'credit' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {t.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono font-black text-slate-900">₦{t.amount.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {t.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-bold">{new Date(t.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
