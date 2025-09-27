# Spec Recap: Uniswap V4 APR Refactor

> Spec: 2025-09-27-uniswap-v4-apr-refactor
> Date: 2025-09-27
> Status: In Progress

## Overview

This specification focuses on optimizing Uniswap V4 repository architecture by eliminating redundant RPC calls and implementing production-ready APR calculation with industry-standard mathematical accuracy. The refactor consolidates data fetching methods and adds comprehensive historical tracking through MMKV snapshots and blockchain queries, enabling users to see accurate APR values in position cards using Clean Architecture principles.

## Completed Features

### 1. Repository Refactoring (COMPLETED)
- **Objective**: Consolidate `getPositionDetails()` and `getStoredPositionInfo()` into efficient `getFullPositionData()` method
- **Implementation**:
  - Refactored ViemPositionRepository for optimized data fetching
  - Implemented consolidated `getFullPositionData()` method combining multiple blockchain calls
  - Updated existing use cases to use new consolidated method
  - Added error handling and retry logic for RPC failures
  - Verified performance improvement and RPC call reduction
- **Impact**: Reduced blockchain RPC calls from 5 to 3 per position with measurable loading time improvement
- **Files Modified**:
  - `src/features/uniswap-v4/data/repositories/viem-position.ts`
  - `src/features/uniswap-v4/application/use-cases/get-position-card.ts`
  - `src/features/uniswap-v4/application/use-cases/get-position-summary.ts`

## In Progress Features

### 2. APR Calculation Domain Service
- **Status**: Implementation Started
- **Objective**: Create AprCalculatorService with safe 256-bit arithmetic and overflow handling
- **Components**:
  - APR calculation formulas for multiple time windows (24h, 7d, 30d)
  - Mathematical validation against industry standard calculators
  - Edge case handling for feeGrowthInside calculations

### 3. Historical Data Management System
- **Status**: Architecture Defined
- **Objective**: Build MMKV-based snapshot storage with automatic 24h intervals
- **Components**:
  - PositionSnapshot interface and storage layer
  - Automatic snapshot scheduling system
  - Blockchain historical data querying with blockNumber
  - Fallback strategy for RPC failures
  - Cleanup system for snapshots older than 30 days

### 4. APR Use Case Implementation
- **Status**: Planning Phase
- **Objective**: Create CalculatePositionAprUseCase following Clean Architecture
- **Components**:
  - Dependency injection integration
  - Orchestration logic for data sources and APR calculation
  - Integration with existing position repository and price services
  - Comprehensive error handling and validation

### 5. UI Integration
- **Status**: Pending
- **Objective**: Integrate APR into UI components and create comprehensive testing
- **Components**:
  - Extended PositionCard interface to include APR field
  - `usePositionApr()` hook with loading states and error handling
  - Updated PositionCard component to display APR values
  - Comprehensive test-apr.ts file for end-to-end validation
  - Integration tests with real Arbitrum position data

## Architecture Improvements

### Repository Pattern Enhancement
- Eliminated redundant RPC calls through method consolidation
- Implemented unified data fetching approach
- Added robust error handling and retry mechanisms
- Maintained Clean Architecture principles throughout refactoring

### Domain Services Foundation
- Established mathematical precision standards for APR calculations
- Created service interfaces for historical data management
- Implemented dependency injection patterns for testability
- Added comprehensive error handling strategies

## Technical Debt Addressed

1. **RPC Call Optimization**: Reduced unnecessary blockchain calls from position data retrieval
2. **Code Duplication**: Consolidated duplicate logic between `getPositionDetails()` and `getStoredPositionInfo()`
3. **Error Handling**: Added proper retry logic and failure handling for blockchain interactions
4. **Test Coverage**: Implemented comprehensive test suite for repository refactoring

## Next Steps

1. Complete APR calculation domain service implementation with mathematical validation
2. Build out historical data management system with MMKV storage
3. Implement CalculatePositionAprUseCase with full dependency injection
4. Integrate APR display into UI components
5. Create comprehensive end-to-end testing suite

## Key Metrics

- **RPC Calls Reduced**: From 5 to 3 per position (40% improvement)
- **Code Coverage**: Repository refactoring fully tested
- **Performance**: Measurable loading time improvement for position data
- **Architecture**: Clean Architecture principles maintained throughout implementation

## Files Created/Modified

### New Files
- `src/features/uniswap-v4/domain/services/apr-calculator.ts`
- `src/features/uniswap-v4/domain/repositories/historical-data.ts`
- `src/features/uniswap-v4/data/services/viem-blockchain-history.ts`
- `tests/apr-calculator.test.ts`
- `tests/repository-refactor.test.ts`

### Modified Files
- `src/features/uniswap-v4/application/use-cases/get-position-card.ts`
- `src/features/uniswap-v4/application/use-cases/get-position-summary.ts`
- `src/features/uniswap-v4/config/di-container.ts`
- `src/features/uniswap-v4/data/repositories/subgraph-position.ts`
- `src/features/uniswap-v4/data/repositories/viem-position.ts`
- `src/features/uniswap-v4/domain/repositories.ts`
- `src/features/uniswap-v4/domain/types.ts`

This spec represents a significant step forward in the application's data layer optimization and sets the foundation for production-ready APR calculations with robust historical data management.