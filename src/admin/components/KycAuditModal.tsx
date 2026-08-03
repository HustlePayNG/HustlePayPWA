import React, { useState } from 'react';
import { type AdminKycApplicant, adminDb } from '../services/adminDb';
import { CloseCircle, TickCircle, Warning2, DocumentText } from 'iconsax-react';
import { Button, Spinner, toast } from '@heroui/react';

interface KycAuditModalProps {
  applicant: AdminKycApplicant;
  onClose: () => void;
  onRefresh: () => void;
}

export const KycAuditModal: React.FC<KycAuditModalProps> = ({ applicant, onClose, onRefresh }) => {
  const [submitting, setSubmitting] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState('Blurry or unreadable document uploaded');
  const [activeDocTab, setActiveDocTab] = useState<'id' | 'certificate' | 'photo'>('id');

  const docs = applicant.kycDocuments || {};

  const getDocUrl = () => {
    if (activeDocTab === 'id') return docs.government_id;
    if (activeDocTab === 'certificate') return docs.skill_certificate;
    return docs.passport_photo;
  };

  const handleApprove = async () => {
    setSubmitting(true);
    try {
      await adminDb.approveKyc(applicant.id);
      toast.success(`Approved ${applicant.fullName} as a Certified Artisan!`);
      onRefresh();
      onClose();
    } catch (err) {
      toast.danger('Failed to approve artisan KYC.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.danger('Please specify a rejection reason.');
      return;
    }
    setSubmitting(true);
    try {
      await adminDb.rejectKyc(applicant.id, rejectReason.trim());
      toast.warning(`KYC application for ${applicant.fullName} rejected.`);
      onRefresh();
      onClose();
    } catch (err) {
      toast.danger('Failed to record KYC rejection.');
    } finally {
      setSubmitting(false);
    }
  };

  const docUrl = getDocUrl();

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white border border-slate-200 rounded-[28px] max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh] shadow-xl">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <img src={applicant.avatarUrl} className="h-12 w-12 rounded-2xl border border-slate-200 object-cover" alt="" />
            <div>
              <h3 className="font-black text-slate-900 text-base leading-tight">{applicant.fullName}</h3>
              <span className="text-xs text-brand-600 font-extrabold block mt-0.5">{applicant.businessName}</span>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900 p-1 cursor-pointer">
            <CloseCircle size={24} color="#0f172a" variant="Broken" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-left">
          
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Experience</span>
              <span className="text-xs font-black text-slate-900">{applicant.yearsExperience} Year(s)</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Base Rate</span>
              <span className="text-xs font-black text-slate-900">₦{applicant.baseRate.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Callout Fee</span>
              <span className="text-xs font-black text-slate-900">₦{applicant.calloutFee.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Status</span>
              <span className="text-xs font-black text-amber-600 uppercase tracking-wider">{applicant.kycStatus}</span>
            </div>
          </div>

          {/* Document Inspector Tabs */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <DocumentText size={16} color="#3b82f6" variant="Broken" />
                Submitted Verification Documents
              </span>
            </div>

            <div className="flex gap-2 mb-3">
              {[
                { key: 'id', label: 'Government ID' },
                { key: 'certificate', label: 'Trade Certificate' },
                { key: 'photo', label: 'Passport Photo' }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveDocTab(tab.key as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black border cursor-pointer transition-all ${
                    activeDocTab === tab.key
                      ? 'bg-brand-500 text-white border-brand-500'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Document Viewer Frame */}
            <div className="h-64 bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden flex items-center justify-center relative">
              {docUrl ? (
                <img src={docUrl} className="max-h-full max-w-full object-contain p-2" alt="KYC Document" />
              ) : (
                <div className="text-center p-6 text-slate-400 text-xs">
                  <Warning2 size={32} color="#94a3b8" variant="Broken" className="mx-auto mb-2" />
                  <span className="font-bold">No document uploaded for this slot</span>
                </div>
              )}
            </div>
          </div>

          {/* Rejection Form */}
          {showRejectForm && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-3">
              <span className="text-xs font-black text-rose-700 block">Specify Rejection Reason</span>
              <select
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
              >
                <option value="Blurry or unreadable document uploaded">Blurry or unreadable document uploaded</option>
                <option value="Expired Government ID">Expired Government ID</option>
                <option value="Invalid Trade or Skill Certificate">Invalid Trade or Skill Certificate</option>
                <option value="Mismatch in name or personal details">Mismatch in name or personal details</option>
                <option value="Other / Verification Failed">Other / Verification Failed</option>
              </select>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <Button
            onClick={() => setShowRejectForm(!showRejectForm)}
            className="bg-rose-50 text-rose-700 hover:bg-rose-100 font-black text-xs h-10 px-4 rounded-xl border border-rose-200 cursor-pointer"
          >
            {showRejectForm ? 'Cancel Rejection' : 'Reject KYC'}
          </Button>

          <div className="flex gap-2">
            {showRejectForm ? (
              <Button
                onClick={handleReject}
                isDisabled={submitting}
                className="bg-rose-600 hover:bg-rose-700 text-white font-black text-xs h-10 px-5 rounded-xl cursor-pointer disabled:opacity-50"
              >
                {submitting ? <Spinner size="sm" /> : 'Confirm Rejection'}
              </Button>
            ) : (
              <Button
                onClick={handleApprove}
                isDisabled={submitting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs h-10 px-6 rounded-xl flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
              >
                {submitting ? (
                  <Spinner size="sm" />
                ) : (
                  <>
                    <TickCircle size={18} color="#ffffff" variant="Broken" />
                    <span>Approve Artisan</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
