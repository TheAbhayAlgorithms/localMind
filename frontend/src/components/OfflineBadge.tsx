import React from 'react';
import { ShieldCheck, ShieldAlert } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export const OfflineBadge: React.FC = () => {
  const isOfflineSafe = useAppStore((state) => state.isOfflineSafe);
  const securityViolation = useAppStore((state) => state.securityViolation);

  if (!isOfflineSafe) {
    return (
      <div
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/50 cursor-pointer animate-pulse"
        title={securityViolation || 'Outbound connection attempt detected!'}
      >
        <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
        <span>External Egress Blocked</span>
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
      title="Offline Mode Active: zero external network traffic, 100% local inference"
    >
      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
      <span>Offline mode: ON</span>
    </div>
  );
};

