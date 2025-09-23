import { QueryClient } from "@tanstack/react-query";

import type { QueryClientConfig } from "./types";

const defaultConfig: QueryClientConfig = {
  defaultStaleTime: 5 * 60 * 1000, // 5 minutes
  defaultGcTime: 10 * 60 * 1000, // 10 minutes
  defaultRetry: 3,
  defaultRetryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
  refetchOnWindowFocus: false,
  refetchOnReconnect: true,
};

export function createQueryClient(config: Partial<QueryClientConfig> = {}): QueryClient {
  const finalConfig = { ...defaultConfig, ...config };

  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: finalConfig.defaultStaleTime,
        gcTime: finalConfig.defaultGcTime,
        retry: finalConfig.defaultRetry,
        retryDelay: finalConfig.defaultRetryDelay,
        refetchOnWindowFocus: finalConfig.refetchOnWindowFocus,
        refetchOnReconnect: finalConfig.refetchOnReconnect,
      },
      mutations: {
        retry: 1,
      },
    },
  });
}

export const queryClient = createQueryClient();
