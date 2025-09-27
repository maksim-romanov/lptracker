# Spec Tasks

These are the tasks to be completed for the spec detailed in @.agent-os/specs/2025-09-27-uniswap-v4-apr-refactor/spec.md

> Created: 2025-09-27
> Status: Ready for Implementation

## Tasks

- [x] 1. Refactor ViemPositionRepository for optimized data fetching
  - [x] 1.1 Write tests for consolidated getFullPositionData() method
  - [x] 1.2 Implement getFullPositionData() combining getPositionDetails and getStoredPositionInfo
  - [x] 1.3 Update existing use cases to use new consolidated method
  - [x] 1.4 Add error handling and retry logic for RPC failures
  - [x] 1.5 Verify performance improvement and RPC call reduction
  - [x] 1.6 Verify all tests pass

- [x] 2. Implement APR calculation domain service and mathematics
  - [x] 2.1 Write tests for AprCalculatorService with known mathematical values
  - [x] 2.2 Create AprCalculatorService with safe 256-bit arithmetic
  - [x] 2.3 Implement overflow handling for feeGrowthInside calculations
  - [x] 2.4 Add APR calculation formulas for multiple time windows (24h, 7d, 30d)
  - [x] 2.5 Create validation against industry standard calculators
  - [x] 2.6 Verify all mathematical edge cases and tests pass

- [x] 3. Build historical data management system
  - [x] 3.1 Write tests for PositionSnapshot MMKV storage and retrieval
  - [x] 3.2 Implement PositionSnapshot interface and storage layer
  - [x] 3.3 Create automatic 24h snapshot scheduling system
  - [x] 3.4 Add blockchain historical data querying with blockNumber
  - [x] 3.5 Implement fallback strategy for RPC failures
  - [x] 3.6 Add cleanup system for snapshots older than 30 days
  - [x] 3.7 Verify all historical data operations and tests pass

- [ ] 4. Create APR Use Case following Clean Architecture
  - [ ] 4.1 Write tests for CalculatePositionAprUseCase with mocked dependencies
  - [ ] 4.2 Implement CalculatePositionAprUseCase with dependency injection
  - [ ] 4.3 Add orchestration logic for data sources and APR calculation
  - [ ] 4.4 Integrate with existing position repository and price services
  - [ ] 4.5 Add comprehensive error handling and validation
  - [ ] 4.6 Verify all use case tests pass

- [ ] 5. Integrate APR into UI components and create comprehensive testing
  - [ ] 5.1 Write tests for usePositionApr hook and PositionCard APR display
  - [ ] 5.2 Extend PositionCard interface to include APR field
  - [ ] 5.3 Create usePositionApr() hook with loading states and error handling
  - [ ] 5.4 Update PositionCard component to display APR values
  - [ ] 5.5 Create comprehensive test-apr.ts file for end-to-end validation
  - [ ] 5.6 Add integration tests with real Arbitrum position data
  - [ ] 5.7 Verify all UI components and integration tests pass