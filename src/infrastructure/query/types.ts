import type { QueryClient } from "@tanstack/react-query";

export interface QueryClientConfig {
  defaultStaleTime: number;
  defaultGcTime: number;
  defaultRetry: number;
  defaultRetryDelay: (attemptIndex: number) => number;
  refetchOnWindowFocus: boolean;
  refetchOnReconnect: boolean;
}

export interface QueryError extends Error {
  status?: number;
  statusText?: string;
  statusCode?: number;
  statusMessage?: string;
}

export interface QueryService {
  getClient(): QueryClient;
  invalidateAll(): Promise<void>;
  clear(): void;
}