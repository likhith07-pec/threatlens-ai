import { apiClient } from './client';
import type { ReportResponse } from '@/types/api';

export const reportsApi = {
  getReport: async (id: string): Promise<ReportResponse> => {
    const res = await apiClient.get<ReportResponse>(`/investigations/${id}/report`);
    return res.data;
  },

  exportReport: async (id: string, format: 'markdown' | 'json'): Promise<void> => {
    const res = await apiClient.get(`/investigations/${id}/export`, {
      params: { format },
      responseType: 'blob',
    });

    const contentType =
      format === 'markdown' ? 'text/markdown;charset=utf-8;' : 'application/json;charset=utf-8;';
    const blob = new Blob([res.data], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `threatlens-report-${id}.${format === 'markdown' ? 'md' : 'json'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};
