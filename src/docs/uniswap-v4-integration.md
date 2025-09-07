# Uniswap V4 Integration

This document describes the integration with Uniswap V4 for fetching liquidity position data.

## Overview

The integration includes:

- Fetching positions from subgraph
- Decoding packed position data
- Support for Ethereum and Arbitrum networks
- Data caching with React Query
- React hooks for state management

## Architecture

### Types (`src/types/uniswap-v4.ts`)

- `SupportedChain` - supported networks (ethereum, arbitrum)
- `UniswapV4Config` - configuration for each network
- `UniswapV4Position` - position data structure
- `PositionDetails` - detailed position information

### Services (`src/data/services/uniswap-v4-service.ts`)

- `UniswapV4Service` - main service for API interaction
- Methods for fetching positions from subgraph
- Decoding data from blockchain

### Utils (`src/utils/uniswap-v4.ts`)

- `decodePositionInfo` - decoding packed position data

### Repository (`src/data/repositories/uniswap-v4-repository-impl.ts`)

- `UniswapV4RepositoryImpl` - repository implementation
- Data caching (TTL: 5 minutes)
- Error handling

### Use Cases (`src/domain/use-cases/uniswap-v4-positions.ts`)

- `GetUserPositionsUseCaseImpl` - getting user positions
- `ClearPositionsCacheUseCaseImpl` - clearing cache

### React Query Hooks (`src/hooks/use-uniswap-v4-positions-query.ts`)

- `useUniswapV4Positions` - main hook for fetching positions
- `useUniswapV4PositionsCache` - cache management utilities
- `useUniswapV4PositionsByChain` - positions filtered by chain
- `useUniswapV4AllPositions` - all positions across chains
- Automatic caching, background refetching, and error handling

## Configuration

### React Query Setup

The app is configured with QueryClientProvider in `src/app/_layout.tsx`:

```typescript
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "lib/query-client";

// In your app layout
<QueryClientProvider client={queryClient}>
  {/* Your app components */}
</QueryClientProvider>
```

QueryClient configuration in `src/lib/query-client.ts`:

- Default stale time: 5 minutes
- Default cache time: 10 minutes
- Retry failed requests 3 times with exponential backoff
- Refetch on reconnect

### Networks and Addresses

```typescript
const UNISWAP_V4_CONFIGS = {
  ethereum: {
    chain: "ethereum",
    positionManagerAddress: "0xbd216513d74c8cf14cf4747e6aaa6420ff64ee9e",
    subgraphUrl:
      "https://gateway.thegraph.com/api/subgraphs/id/G5TsTKNi8yhPSV7kycaE23oWbqv9zzNqR49FoEQjzq1r",
    subgraphKey: "483aa90f30cf4a8250dee1c72c643c9d",
  },
  arbitrum: {
    chain: "arbitrum",
    positionManagerAddress: "0xd88f38f930b7952f2db2432cb002e7abbf3dd869",
    subgraphUrl:
      "https://gateway.thegraph.com/api/subgraphs/id/G5TsTKNi8yhPSV7kycaE23oWbqv9zzNqR49FoEQjzq1r",
    subgraphKey: "483aa90f30cf4a8250dee1c72c643c9d",
  },
};
```

## Usage

### 1. Direct service usage

```typescript
import { UniswapV4Service } from "./data/services/uniswap-v4-service";

const service = new UniswapV4Service("ethereum");
const positions = await service.fetchUserPositions(userAddress);
```

### 2. Using through use case

```typescript
import { GetUserPositionsUseCaseImpl } from "./domain/use-cases/uniswap-v4-positions";
import { container } from "./di/container";

const useCase = container.resolve(GetUserPositionsUseCaseImpl);
const positions = await useCase.execute(userAddress, "ethereum");
```

### 3. Using through React Query hooks

```typescript
import { useUniswapV4Positions, useUniswapV4PositionsCache } from './hooks/use-uniswap-v4-positions-query'

const MyComponent = () => {
  const { positions, isLoading, error, refetch } = useUniswapV4Positions(userAddress, 'arbitrum')
  const { invalidatePositions, clearAllPositions } = useUniswapV4PositionsCache()

  return (
    <div>
      {isLoading && <div>Loading...</div>}
      {error && <div>Error: {error.message}</div>}
      {positions.map(position => (
        <div key={position.tokenId}>
          Position {position.tokenId}
        </div>
      ))}
      <button onClick={() => refetch()}>Refresh</button>
      <button onClick={() => invalidatePositions(userAddress)}>Invalidate Cache</button>
    </div>
  )
}
```

### 4. Using cache management

```typescript
import { useUniswapV4PositionsCache } from './hooks/use-uniswap-v4-positions-query'

const CacheManager = () => {
  const { invalidatePositions, removePositions, clearAllPositions, prefetchPositions } = useUniswapV4PositionsCache()

  return (
    <div>
      <button onClick={() => invalidatePositions(userAddress, 'arbitrum')}>
        Invalidate Arbitrum Positions
      </button>
      <button onClick={() => clearAllPositions()}>
        Clear All Positions
      </button>
      <button onClick={() => prefetchPositions(userAddress, 'ethereum')}>
        Prefetch Ethereum Positions
      </button>
    </div>
  )
}
```

## Error Handling

All methods include error handling:

- Error logging to console
- Throwing errors with descriptive messages
- Graceful degradation on network errors

## Caching

- React Query automatic caching with configurable TTL
- Cache by user address and network
- Background refetching and stale-while-revalidate
- Automatic cache invalidation and cleanup
- Prefetching capabilities

## Dependencies

- `viem` - for blockchain interaction
- `graphql-request` - for subgraph requests
- `@tanstack/react-query` - for caching and state management
- `tsyringe` - for dependency injection

## Examples

- `src/examples/uniswap-v4-example.ts` - Basic service usage examples
- `src/examples/uniswap-v4-react-query-example.ts` - React Query hooks usage examples
