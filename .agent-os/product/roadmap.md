# Product Roadmap

> Last Updated: 2025-09-27
> Version: 1.0.0
> Status: In Development

## Phase 0: Already Completed

The following features have been implemented:

- [x] **Uniswap V4 position tracking** - Multi-chain support (Ethereum & Arbitrum) with real-time position fetching
- [x] **Token price feeds** - Integrated Chainlink, CoinGecko, and Moralis with fallback strategies
- [x] **Token metadata fetching** - Comprehensive metadata with caching and fallback providers
- [x] **Wallet integration** - Native wallet connection and management with MobX store
- [x] **Position value calculation** - Real-time USD value calculation with price integration
- [x] **Professional UI foundation** - Inter fonts, adaptive icons, and unistyles theming
- [x] **Clean architecture** - Domain-driven design with dependency injection using tsyringe
- [x] **Native tab navigation** - iOS and Android optimized tab layout with SF Symbols

## Phase 1: Core MVP Foundation (4-6 weeks)

**Goal:** Establish solid foundation with Uniswap v3/v4 tracking and core mobile features
**Success Criteria:** Users can track LP positions across Ethereum and Arbitrum with real-time updates

### Features

- [ ] Uniswap v3 position tracking integration - Complete v3 SDK integration for historical positions `L`
- [ ] Enhanced multi-chain support - Expand to Base, Avalanche, Optimism, Unichain `L`
- [ ] APR calculation and display - Real-time APR tracking with historical data `M`
- [ ] Push notifications system - Basic position range alerts and significant changes `L`
- [ ] iOS widgets implementation - Home screen widgets for quick portfolio overview `M`
- [ ] Position details enhancement - Detailed view with fees earned and IL calculations `M`

### Dependencies

- Uniswap v3 SDK integration
- Push notification service setup
- iOS widget development environment

## Phase 2: Mobile-First Experience (3-4 weeks)

**Goal:** Deliver superior mobile experience with Apple Watch and advanced notifications
**Success Criteria:** Users prefer Sparklr over desktop alternatives for daily LP monitoring

### Features

- [ ] Apple Watch companion app - Basic position overview and alerts on wearable `XL`
- [ ] Advanced range alerts - Customizable notifications with multiple trigger conditions `M`
- [ ] Offline mode support - Cached position data for viewing without internet `M`
- [ ] Position optimization recommendations - Smart suggestions for rebalancing `L`
- [ ] Dark mode and themes - Multiple UI themes for better mobile experience `S`

### Dependencies

- Apple Watch development setup
- Offline data caching architecture
- Advanced notification framework

## Phase 3: Multi-DEX Expansion (4-5 weeks)

**Goal:** Become the comprehensive LP tracking solution across major DeFi platforms
**Success Criteria:** Support 80% of major LP positions in DeFi ecosystem

### Features

- [ ] Curve Finance integration - Support for Curve LP positions and gauges `XL`
- [ ] Trader Joe integration - Avalanche-focused DEX support `L`
- [ ] PancakeSwap integration - BNB Chain DEX support `L`
- [ ] SushiSwap integration - Multi-chain Sushi LP tracking `M`
- [ ] Historical performance analytics - Detailed P&L and performance metrics `L`
- [ ] Portfolio insights dashboard - Advanced analytics and trend analysis `M`

### Dependencies

- Multiple DEX SDK integrations
- Cross-chain data synchronization
- Advanced analytics infrastructure