# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-09-27-uniswap-v4-apr-refactor/spec.md

> Created: 2025-09-27
> Version: 1.0.0

## Technical Requirements

### Repository Optimization
- Consolidate `getPositionDetails()` and `getStoredPositionInfo()` into single `getFullPositionData()` method
- Implement proper error handling and retry logic for blockchain RPC failures
- Add caching layer for position data to reduce redundant calls within query staleTime
- Maintain existing TypeScript interfaces while optimizing underlying implementation

### APR Calculation Architecture
- **Use Case**: `CalculatePositionAprUseCase` following Clean Architecture principles with dependency injection
- **Domain Service**: `AprCalculatorService` containing pure mathematical logic with no external dependencies
- **Overflow Safety**: Implement 256-bit arithmetic with proper wrap-around handling for feeGrowthInside calculations
- **Multiple Time Windows**: Support 24h, 7d, 30d APR calculations with configurable periods

### Historical Data Management
- **MMKV Integration**: Automatic position snapshots every 24 hours with configurable intervals
- **Blockchain Queries**: Historical data retrieval using `blockNumber` parameter for precise calculations
- **Fallback Strategy**: Local snapshots when RPC providers fail or rate limit
- **Data Cleanup**: Automatic removal of snapshots older than 30 days

### Mathematical Precision
- **Fee Formula**: `uncollectedFees = liquidity * (currentFeeGrowthInside - lastFeeGrowthInside) / Q128`
- **Overflow Handling**: `delta = current >= last ? current - last : (2^256 + current - last)`
- **APR Formula**: `(fees_earned_usd / position_value_usd) * (365 * 24 * 3600 / time_period) * 100`
- **Volume Calculation**: 7-day moving average excluding current day for stability

### UI Integration Requirements
- Extend `PositionCard` interface to include `apr: number` field
- Create `usePositionApr()` hook with proper loading states and error handling
- Implement graceful degradation when APR calculation fails
- Add proper TypeScript types for all new APR-related interfaces

### Testing Framework
- **Unit Tests**: Mathematical formulas with known values and edge cases
- **Integration Tests**: Real blockchain data validation against known calculators
- **Performance Tests**: RPC call optimization verification
- **Test File**: Comprehensive `test-apr.ts` executable with `bun run`

## Approach

### Architecture Implementation
The solution follows Clean Architecture principles with clear separation of concerns:

1. **Domain Layer**: Pure mathematical APR calculation logic in `AprCalculatorService`
2. **Use Case Layer**: `CalculatePositionAprUseCase` orchestrating data retrieval and calculation
3. **Infrastructure Layer**: MMKV storage adapter and blockchain data providers
4. **Presentation Layer**: React hooks and UI components with proper error boundaries

### Data Flow Pattern
```
UI Component → usePositionApr() → CalculatePositionAprUseCase → AprCalculatorService
                     ↓                        ↓                        ↓
              React Query Cache ← Position Repository ← MMKV + Blockchain
```

### Error Handling Strategy
- Graceful degradation when APR calculation fails (show position without APR)
- Retry logic for transient RPC failures with exponential backoff
- Fallback to cached data when real-time blockchain queries fail
- Comprehensive error logging without exposing sensitive data

### Performance Optimization
- Batch position data requests where possible
- Implement stale-while-revalidate pattern for APR calculations
- Use React Query's built-in caching to prevent duplicate calculations
- Optimize historical data queries with strategic block number selection

## External Dependencies

No new external dependencies required. The implementation uses existing libraries:
- **@uniswap/v4-sdk**: Already present for position calculations
- **viem**: Already present for blockchain interactions
- **react-native-mmkv**: Already present for local storage
- **@tanstack/react-query**: Already present for data fetching
- **tsyringe**: Already present for dependency injection