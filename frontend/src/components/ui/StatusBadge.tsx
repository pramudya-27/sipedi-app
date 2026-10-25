import React from 'react';
import { clsx } from 'clsx';
import { useTranslation } from 'react-i18next';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const { t } = useTranslation();

  const getTranslatedStatus = (statusStr: string) => {
    const s = (statusStr || '').toLowerCase().trim();
    if (s === 'approved' || s === 'disetujui') return t('status.approved');
    if (s === 'selesai' || s === 'completed') return t('status.completed');
    if (s === 'izin diterbitkan' || s === 'permit issued') return t('status.permitIssued');
    if (s === 'under verification' || s === 'dalam verifikasi' || s === 'menunggu verifikasi' || s === 'verifikasi') return t('status.underVerification');
    if (s === 'dalam penanganan' || s === 'in progress' || s === 'in_progress') return t('status.inProgress');
    if (s === 'rejected' || s === 'ditolak') return t('status.rejected');
    if (s === 'revision required' || s === 'perlu revisi') return t('status.revision');
    if (s === 'draft' || s === 'draf') return t('status.draft');
    if (s === 'submitted' || s === 'diajukan') return t('status.submitted');
    if (s === 'baru' || s === 'new') return t('status.new');
    return statusStr;
  };

  const getStyles = (status: string) => {
    const s = (status || '').toLowerCase().trim();
    if (['approved', 'selesai', 'izin diterbitkan', 'disetujui', 'completed', 'permit issued'].includes(s)) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (['under verification', 'dalam penanganan', 'verifikasi', 'dalam verifikasi', 'menunggu verifikasi', 'in progress', 'in_progress'].includes(s)) {
      return 'bg-amber-50 text-amber-700 border-amber-200';
    }
    if (['rejected', 'revision required', 'ditolak', 'perlu revisi'].includes(s)) {
      return 'bg-rose-50 text-rose-700 border-rose-200';
    }
    return 'bg-slate-100 text-slate-800 border-slate-200';
  };

  return (
    <span className={clsx("px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border", getStyles(status))}>
      {getTranslatedStatus(status)}
    </span>
  );
};
