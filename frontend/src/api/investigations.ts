import { apiClient } from './client';
import type {
  HealthResponse,
  CreateInvestigationRequest,
  CreateInvestigationResponse,
  InvestigationListResponse,
  InvestigationDetail,
  EvidenceResponse,
  GraphResponse,
} from '@/types/api';

export const investigationsApi = {
  getHealth: async (): Promise<HealthResponse> => {
    const res = await apiClient.get<HealthResponse>('/health');
    return res.data;
  },

  createInvestigation: async (cve_id: string): Promise<CreateInvestigationResponse> => {
    const payload: CreateInvestigationRequest = { cve_id: cve_id.trim().toUpperCase() };
    const res = await apiClient.post<CreateInvestigationResponse>('/investigations', payload);
    return res.data;
  },

  listInvestigations: async (page = 1, size = 20): Promise<InvestigationListResponse> => {
    const res = await apiClient.get<InvestigationListResponse>('/investigations', {
      params: { page, size },
    });
    return res.data;
  },

  getInvestigation: async (id: string): Promise<InvestigationDetail> => {
    const res = await apiClient.get<InvestigationDetail>(`/investigations/${id}`);
    return res.data;
  },

  getEvidence: async (id: string): Promise<EvidenceResponse> => {
    const res = await apiClient.get<EvidenceResponse>(`/investigations/${id}/evidence`);
    return res.data;
  },

  getGraph: async (id: string): Promise<GraphResponse> => {
    const res = await apiClient.get<GraphResponse>(`/investigations/${id}/graph`);
    return res.data;
  },
};
