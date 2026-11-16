import React from 'react';
import { ShieldCheck, ShieldAlert } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export const OfflineBadge: React.FC = () => {
  const isOfflineSafe = useAppStore((state) => state.isOfflineSafe);
  const securityViolation = useAppStore((state) => state.securityViolation);

  if (!isOfflineSafe) {
    return (
      <div
        className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FF3B30]/15 text-[#FF3B30] border border-[#FF3B30]/30 shadow-sm cursor-pointer animate-pulse"
        title={securityViolation || 'Outbound connection attempt detected!'}
      >
        <ShieldAlert className="w-3.5 h-3.5 text-[#FF3B30]" />
        <span>Egress Blocked</span>
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#34C759]/15 text-[#1D1D1F] border border-[#34C759]/30 shadow-sm"
      title="Offline Mode Active: zero external network traffic, 100% local inference"
    >
      <ShieldCheck className="w-3.5 h-3.5 text-[#34C759]" />
      <span>Offline Guard: <strong className="text-[#34C759] font-semibold">ON</strong></span>
    </div>
  );
};
