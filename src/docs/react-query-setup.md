# React Query Setup

This document explains how React Query is configured in the application.

## Overview

React Query (TanStack Query) is used for:
- Automatic caching of API responses
- Background refetching
- Error handling and retries
- Loading states management
- Cache invalidation

## Configuration

### QueryClient Setup

The QueryClient is configured in `src/lib/query-client.ts`:

```typescript
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000,   // 10 minutes
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});
```

### Provider Setup

The QueryClientProvider is added to the app layout in `src/app/_layout.tsx`:

```typescript
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "lib/query-client";

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Your app components */}
    </QueryClientProvider>
  );
}
```

## Usage

### Basic Hook Usage

```typescript
import { useUniswapV4Positions } from "hooks/use-uniswap-v4-positions-query";

const MyComponent = () => {
  const { positions, isLoading, error, refetch } = useUniswapV4Positions(
    userAddress,
    "arbitrum"
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {positions.map(position => (
        <div key={position.tokenId}>
          Position #{position.tokenId}
        </div>
      ))}
    </div>
  );
};
```

### Cache Management

```typescript
import { useUniswapV4PositionsCache } from "hooks/use-uniswap-v4-positions-query";

const CacheManager = () => {
  const { invalidatePositions, clearAllPositions } = useUniswapV4PositionsCache();

  return (
    <div>
      <button onClick={() => invalidatePositions(userAddress, "arbitrum")}>
        Refresh Arbitrum Positions
      </button>
      <button onClick={() => clearAllPositions()}>
        Clear All Cache
      </button>
    </div>
  );
};
```

## Benefits

1. **Automatic Caching**: Data is cached automatically with configurable TTL
2. **Background Updates**: Data is refreshed in the background when stale
3. **Error Handling**: Automatic retries with exponential backoff
4. **Loading States**: Built-in loading and error states
5. **Cache Invalidation**: Easy cache management and invalidation
6. **Deduplication**: Multiple requests for the same data are deduplicated
7. **Optimistic Updates**: Support for optimistic UI updates

## Query Keys

Query keys are structured hierarchically for efficient cache management:

```typescript
export const uniswapV4QueryKeys = {
  all: ["uniswap-v4"],
  positions: () => [...uniswapV4QueryKeys.all, "positions"],
  positionsByUser: (userAddress: Address) => [...uniswapV4QueryKeys.positions(), userAddress],
  positionsByUserAndChain: (userAddress: Address, chain: SupportedChain) => 
    [...uniswapV4QueryKeys.positionsByUser(userAddress), chain],
};
```

This structure allows for:
- Invalidating all Uniswap V4 queries
- Invalidating all positions for a user
- Invalidating positions for a specific user and chain
