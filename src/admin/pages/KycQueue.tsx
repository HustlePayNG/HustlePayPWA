import React, { useState, useEffect } from 'react';
import { adminDb, type AdminKycApplicant } from '../services/adminDb';
import { KycAuditModal } from '../components/KycAuditModal';
import { Verify, Eye, SearchNormal1 } from 'iconsax-react';
import { Button, Spinner } from '@heroui/react';

export const KycQueue: React.FC = () => {
  const [applicants, setApplicants] = useState<AdminKycApplicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApplicant, setSelectedApplicant] = useState<AdminKycApplicant | null>(null);

  useEffect(() => {
    loadQueue();
  }, []);

  const loadQueue = async () => {
    setLoading(true);
    const data = await adminDb.getPendingKycApplications();
    setApplicants(data);
    setLoading(false);
  };

  const filtered = applicants.filter(a => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      a.fullName.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q) ||
      a.businessName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 text-left animate-in fade-in">
      
      {/* Header Bar */}
      <div className="flex justify-between items-center">
        <div>
          <span className="text-[9px] text-brand-600 font-extrabold uppercase tracking-widest block">Compliance Audit</span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Artisan KYC Verification Queue</h1>
        </div>
        <Button onClick={loadQueue} className="bg-white border border-slate-200 text-slate-900 font-extrabold text-xs h-9 px-4 rounded-xl cursor-pointer hover:bg-slate-50 shadow-xs">
          Refresh Queue
        </Button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-2.5 px-3.5 h-11 bg-white border border-slate-200 rounded-2xl max-w-md focus-within:border-brand-500 transition-all shadow-xs">
        <SearchNormal1 size={15} color="#64748b" variant="Broken" />
        <input 
          type="text" 
          placeholder="Filter applicants by name, email, or business..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="bg-transparent text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none w-full"
        />
      </div>

      {/* Table Container */}
      <div className="bg-white border border-slate-200 rounded-[28px] overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-slate-700 text-xs flex flex-col items-center gap-2">
            <Spinner size="md" />
            <span className="font-extrabold">Loading pending KYC applications...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
            <Verify size={36} color="#3b82f6" variant="Broken" className="mb-1" />
            <p className="font-black text-slate-900 text-sm">No Applicants in Queue</p>
            <p className="text-slate-500 font-medium">All submitted artisan KYC applications have been reviewed.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-black uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Artisan</th>
                  <th className="px-6 py-4">Business Name</th>
                  <th className="px-6 py-4">Experience</th>
                  <th className="px-6 py-4">Base / Callout Fee</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-900">
                {filtered.map(app => (
                  <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={app.avatarUrl} className="h-9 w-9 rounded-xl border border-slate-200 object-cover" alt="" />
                        <div>
                          <span className="font-black text-slate-900 block">{app.fullName}</span>
                          <span className="text-[10px] text-slate-500 block">{app.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-black text-slate-900">{app.businessName}</td>
                    <td className="px-6 py-4 text-slate-700 font-bold">{app.yearsExperience} Year(s)</td>
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">
                      ₦{app.baseRate.toLocaleString()} / ₦{app.calloutFee.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        app.kycStatus === 'approved' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : app.kycStatus === 'rejected'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {app.kycStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        onClick={() => setSelectedApplicant(app)}
                        className="bg-brand-500 hover:bg-brand-600 text-white font-black text-xs h-8 px-3 rounded-xl flex items-center gap-1.5 ml-auto cursor-pointer shadow-xs"
                      >
                        <Eye size={14} color="#ffffff" variant="Broken" />
                        <span>Audit Documents</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* KYC Audit Modal */}
      {selectedApplicant && (
        <KycAuditModal
          applicant={selectedApplicant}
          onClose={() => setSelectedApplicant(null)}
          onRefresh={loadQueue}
        />
      )}

    </div>
  );
};
