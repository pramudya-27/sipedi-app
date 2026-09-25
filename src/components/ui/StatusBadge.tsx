import React from 'react';
import { clsx } from 'clsx';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStyles = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
      case 'selesai':
      case 'izin diterbitkan':
        return 'bg-success-100 text-success-800 border-success-200';
      case 'under verification':
      case 'dalam penanganan':
      case 'verifikasi':
        return 'bg-warning-100 text-warning-800 border-warning-200';
      case 'rejected':
      case 'revision required':
        return 'bg-danger-100 text-danger-800 border-danger-200';
      case 'draft':
      case 'baru':
      case 'submitted':
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <span className={clsx("px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border", getStyles(status))}>
      {status}
    </span>
  );
};
