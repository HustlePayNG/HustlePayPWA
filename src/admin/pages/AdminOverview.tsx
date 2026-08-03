import React, { useState, useEffect } from 'react';
import { adminDb } from '../services/adminDb';
import { 
  People, 
  Verify, 
  ShieldSecurity, 
  CardSend, 
  TrendUp, 
  TickCircle,
  Warning2,
  Flash
} from 'iconsax-react';
import { Spinner } from '@heroui/react';

export const AdminOverview: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    setLoading(true);
    const data = await adminDb.getOverviewMetrics();
    setMetrics(data);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center text-slate-900 text-xs min-h-[70vh]">
        <Spinner size="lg" />
        <span className="mt-3 font-extrabold text-slate-700">Loading Executive Operational Metrics...</span>
      </div>
    );
  }

  const kpis = [
    { label: 'Total Platform Users', value: metrics?.totalUsers || 0, icon: People, color: 'text-brand-600', bg: 'bg-brand-50' },
    { label: 'Approved Artisans', value: metrics?.totalArtisans || 0, icon: Verify, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Gross Escrow Volume (GMV)', value: `₦${(metrics?.gmv || 0).toLocaleString()}`, icon: TrendUp, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Platform Commissions (5%)', value: `₦${(metrics?.totalCommissions || 0).toLocaleString()}`, icon: CardSend, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Open Disputes Queue', value: metrics?.openDisputes || 0, icon: ShieldSecurity, color: 'text-amber-600', bg: 'bg-amber-50' }
  ];

  return (
    <div className="space-y-6 text-left animate-in fade-in">
      
      {/* Header Banner */}
      <div>
        <span className="text-[9px] text-brand-600 font-extrabold uppercase tracking-widest block">Executive Dashboard</span>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">System Control Center</h1>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col justify-between space-y-3 shadow-xs">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">{kpi.label}</span>
                <div className={`h-8 w-8 rounded-xl ${kpi.bg} ${kpi.color} flex items-center justify-center`}>
                  <Icon size={18} color="currentColor" variant="Broken" />
                </div>
              </div>
              <div className="text-xl font-black text-slate-900">{kpi.value}</div>
            </div>
          );
        })}
      </div>

      {/* Operational Highlights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* System Health */}
        <div className="bg-white border border-slate-200 p-6 rounded-[28px] space-y-4 shadow-xs">
          <div className="flex justify-between items-center">
            <h3 className="font-black text-slate-900 text-sm">System Health</h3>
            <span className="text-[9px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wider border border-emerald-200">Operational</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-700 font-extrabold">Supabase Realtime WebSockets</span>
              <span className="text-emerald-600 font-black flex items-center gap-1">
                <TickCircle size={14} color="#16a34a" variant="Broken" />
                Active
              </span>
            </div>

            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-700 font-extrabold">Escrow Payout Engine</span>
              <span className="text-emerald-600 font-black flex items-center gap-1">
                <TickCircle size={14} color="#16a34a" variant="Broken" />
                Secured
              </span>
            </div>

            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-700 font-extrabold">Magic Link Email Service</span>
              <span className="text-emerald-600 font-black flex items-center gap-1">
                <TickCircle size={14} color="#16a34a" variant="Broken" />
                Healthy
              </span>
            </div>
          </div>
        </div>

        {/* Live Operational Stream */}
        <div className="lg:col-span-2 bg-white border border-slate-200 p-6 rounded-[28px] space-y-4 shadow-xs">
          <div className="flex justify-between items-center">
            <h3 className="font-black text-slate-900 text-sm">Real-time Platform Activity Stream</h3>
            <span className="text-[9px] text-slate-400 font-mono">Live Auditing</span>
          </div>

          <div className="space-y-3">
            {[
              { type: 'escrow', text: 'Escrow Callout Fee Locked for Booking #HP-8902', time: '2 mins ago', icon: Flash, color: 'text-brand-600 bg-brand-50' },
              { type: 'kyc', text: 'New Artisan KYC Verification Submitted by Tunde B.', time: '14 mins ago', icon: Verify, color: 'text-emerald-600 bg-emerald-50' },
              { type: 'dispute', text: 'New Dispute Claim Filed for Booking #HP-4410', time: '1 hour ago', icon: Warning2, color: 'text-amber-600 bg-amber-50' }
            ].map((act, i) => {
              const Icon = act.icon;
              return (
                <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className={`h-8 w-8 rounded-xl ${act.color} flex items-center justify-center shrink-0`}>
                    <Icon size={16} color="currentColor" variant="Broken" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-900 font-black truncate">{act.text}</p>
                    <span className="text-[9px] text-slate-400 block">{act.time}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
