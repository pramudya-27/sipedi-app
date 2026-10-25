import { api } from './api';

export const paymentService = {
  getInvoice: async (invoiceNumber: string) => {
    const res = await api.get(`/payments/invoice/${invoiceNumber}`);
    return res.data;
  },

  verifyPayment: async (orderId: string, params?: { transaction_status?: string; status_code?: string }) => {
    const query = new URLSearchParams();
    if (params?.transaction_status) query.append('transaction_status', params.transaction_status);
    if (params?.status_code) query.append('status_code', params.status_code);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    const res = await api.get(`/payments/verify/${orderId}${queryString}`);
    return res.data;
  },

  simulatePayment: async (orderId: string, status: string = 'settlement', paymentType: string = 'QRIS') => {
    const res = await api.post('/payments/simulate-pay', {
      order_id: orderId,
      status,
      payment_type: paymentType
    });
    return res.data;
  },

  getRevenueSummary: async () => {
    const res = await api.get('/revenue/summary');
    return res.data;
  },

  getRevenueTransactions: async (status?: string, search?: string) => {
    const params = new URLSearchParams();
    if (status && status !== 'ALL') params.append('status', status);
    if (search) params.append('search', search);

    const res = await api.get(`/revenue/transactions?${params.toString()}`);
    return res.data;
  },

  getExportExcelUrl: (status?: string, search?: string) => {
    const params = new URLSearchParams();
    if (status && status !== 'ALL') params.append('status', status);
    if (search) params.append('search', search);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return `http://localhost:8000/api/v1/revenue/export-excel${queryString}`;
  },

  deleteInvoice: async (invoiceNumber: string) => {
    const res = await api.delete(`/revenue/invoice/${invoiceNumber}`);
    return res.data;
  }
};
