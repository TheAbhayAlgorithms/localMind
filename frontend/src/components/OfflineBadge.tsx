import React from 'react';
import { ShieldCheck, ShieldAlert } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export const OfflineBadge: React.FC = () => {
  const isOfflineSafe = useAppStore((state) => state.isOfflineSafe);
  const securityViolation = useAppStore((state) => state.securityViolation);

  if (!isOfflineSafe) {
    return (
      <div
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-neutral-900 text-white border border-white/60 cursor-pointer animate-pulse shadow-sm"
        title={securityViolation || 'Outbound connection attempt detected!'}
      >
        <ShieldAlert className="w-3.5 h-3.5 text-white" />
        <span>External Egress Blocked</span>
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-neutral-900 text-neutral-300 border border-neutral-700"
      title="Offline Mode Active: zero external network traffic, 100% local inference"
    >
      <ShieldCheck className="w-3.5 h-3.5 text-white" />
      <span>Offline mode: ON</span>
    </div>
  );
};

