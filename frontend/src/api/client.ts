import axios, { AxiosError } from 'axios';
import type { ErrorResponse } from '@/types/api';

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';

export const apiClient = axios.create({
  baseURL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export class ApiError extends Error {
  code: string;
  statusCode?: number;
  detail: string;

  constructor(message: string, code = 'UNKNOWN_ERROR', statusCode?: number, detail?: string) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.statusCode = statusCode;
    this.detail = detail || message;
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ErrorResponse>) => {
    if (error.response) {
      const data = error.response.data;
      const detail = data?.detail || error.message || 'Server error';
      const code = data?.code || `HTTP_${error.response.status}`;
      return Promise.reject(new ApiError(detail, code, error.response.status, detail));
    }
    if (error.request) {
      return Promise.reject(
        new ApiError(
          'Unable to connect to ThreatLens backend. Please ensure the backend is running.',
          'NETWORK_DISCONNECTED',
          0
        )
      );
    }
    return Promise.reject(new ApiError(error.message, 'CLIENT_CONFIG_ERROR'));
  }
);

