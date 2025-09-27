# Spec Requirements Document

> Spec: Uniswap V4 APR Refactor
> Created: 2025-09-27

## Overview

Optimize the existing Uniswap V4 data fetching architecture and implement production-ready APR calculation for LP positions with industry-standard mathematical accuracy and Clean Architecture principles.

## User Stories

### LP Position Tracking Optimization

As a developer working with the Uniswap V4 codebase, I want optimized data fetching that eliminates redundant RPC calls, so that position loading is faster and more cost-effective.

The current implementation has `getStoredPositionInfo()` duplicating blockchain calls from `getPositionDetails()`, creating unnecessary overhead. This refactor will consolidate data fetching into a single efficient method while maintaining the same data output.

### APR Calculation and Display

As a DeFi user viewing my LP positions, I want to see accurate APR calculations displayed alongside my position value, so that I can make informed decisions about my liquidity provision strategy.

The APR calculation will use industry-standard formulas with proper overflow handling, historical data tracking, and multiple time windows (24h, 7d, 30d) to provide comprehensive yield information.

### Reliable Historical Data

As a mobile app user, I want APR calculations to work reliably even when blockchain RPC services are slow or rate-limited, so that I can always access my position performance data.

The system will implement a hybrid approach using blockchain historical queries with local snapshot fallbacks to ensure data availability under all network conditions.

## Spec Scope

1. **Repository Refactoring** - Consolidate `getPositionDetails()` and `getStoredPositionInfo()` into efficient `getFullPositionData()` method
2. **APR Use Case** - Implement `CalculatePositionAprUseCase` following Clean Architecture patterns
3. **Domain Service** - Create `AprCalculatorService` with mathematical precision and overflow handling
4. **Historical Data System** - MMKV-based snapshot storage with automatic 24h intervals
5. **UI Integration** - Extend PositionCard component and create `usePositionApr()` hook

## Out of Scope

- Impermanent Loss calculations (future enhancement)
- APR breakdown by individual tokens (future detailed screen)
- Multi-DEX APR comparison features
- Real-time notifications for APR changes
- Historical APR charting and visualization

## Expected Deliverable

1. **Optimized Performance** - Reduced blockchain RPC calls from 5 to 3 per position with measurable loading time improvement
2. **Accurate APR Display** - Position cards show mathematically verified APR values matching industry calculators
3. **Comprehensive Test Suite** - `test-apr.ts` file validating all formulas and edge cases with real position data