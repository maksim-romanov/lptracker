export interface ApiClientConfig {
  baseURL: string;
  headers?: Record<string, string>;
  timeout?: number;
}

export interface ApiError extends Error {
  status?: number;
  statusText?: string;
}