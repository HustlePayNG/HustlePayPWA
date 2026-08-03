import React, { useState, useEffect } from 'react';
import { adminDb } from '../services/adminDb';
import { People, SearchNormal1, SecuritySafe } from 'iconsax-react';
import { Button, Spinner } from '@heroui/react';

export const UserDirectory: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await adminDb.getAllUsers();
      setUsers(data);
    } catch (err) {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = users.filter(u => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (u.full_name && u.full_name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.business_name && u.business_name.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 text-left animate-in fade-in">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <span className="text-[9px] text-brand-600 font-extrabold uppercase tracking-widest block">Account Supervision</span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">User Directory</h1>
        </div>
        <Button onClick={loadUsers} className="bg-white border border-slate-200 text-slate-900 font-extrabold text-xs h-9 px-4 rounded-xl cursor-pointer hover:bg-slate-50 shadow-xs">
          Refresh Directory
        </Button>
      </div>

      {/* Search Input */}
      <div className="flex items-center gap-2.5 px-3.5 h-11 bg-white border border-slate-200 rounded-2xl max-w-md focus-within:border-brand-500 transition-all shadow-xs">
        <SearchNormal1 size={15} color="#64748b" variant="Broken" />
        <input 
          type="text" 
          placeholder="Search user by name, email, or business..."
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
            <span className="font-extrabold">Loading user profiles...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
            <People size={36} color="#3b82f6" variant="Broken" className="mb-1" />
            <p className="font-black text-slate-900 text-sm">No Users Found</p>
            <p className="text-slate-500 font-medium">No registered profiles match your search.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-black uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Mode Preference</th>
                  <th className="px-6 py-4">Role Status</th>
                  <th className="px-6 py-4">KYC Status</th>
                  <th className="px-6 py-4">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-900">
                {filtered.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={u.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${u.full_name}`} className="h-9 w-9 rounded-xl border border-slate-200 object-cover" alt="" />
                        <div>
                          <span className="font-black text-slate-900 block">{u.full_name || 'Anonymous User'}</span>
                          <span className="text-[10px] text-slate-500 block">{u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 uppercase font-black text-brand-600 text-[10px]">{u.active_mode_preference || 'seeker'}</td>
                    <td className="px-6 py-4 font-black">
                      {u.is_artisan ? (
                        <span className="text-emerald-700 font-black flex items-center gap-1">
                          <SecuritySafe size={14} color="#16a34a" variant="Broken" />
                          Artisan Certified
                        </span>
                      ) : (
                        <span className="text-slate-500 font-bold">Seeker Only</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                        {u.kyc_status || 'none'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-bold">{new Date(u.created_at).toLocaleDateString()}</td>
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
