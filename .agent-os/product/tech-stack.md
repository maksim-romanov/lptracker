# Technical Stack

> Last Updated: 2025-09-27
> Version: 1.0.0

## Application Framework

- **Framework:** React Native + Expo
- **Version:** Expo 54 with New Architecture enabled
- **Navigation:** Expo Router with file-based routing
- **Runtime:** Metro bundler with custom transformer for SVG support

## Database & Caching

- **Local Storage:** react-native-mmkv for fast key-value storage
- **State Management:** MobX with mobx-persist-store for persistence
- **Query Layer:** TanStack Query v5 for server state management and caching

## JavaScript & TypeScript

- **Language:** TypeScript 5.9.2 with strict mode
- **Runtime:** React 19.1.0 + React Native 0.81.4
- **Package Manager:** Bun for fast installs and development
- **Metadata:** reflect-metadata for decorator support

## Styling & UI

- **Styling:** react-native-unistyles v3 for unified theming
- **Animations:** react-native-reanimated v4.1 + react-native-worklets
- **UI Libraries:** @grapp/stacks for layout, @expo/ui for components
- **Fonts:** Inter font family (18pt & 24pt variants)
- **Icons:** @expo/vector-icons, Expo Symbols, SF Symbols support

## Blockchain Integration

- **Ethereum Libraries:** Ethers.js v5 + Viem v2.37.4 for blockchain interaction
- **DEX SDKs:** @uniswap/v4-sdk v1.21.4, @uniswap/sdk-core v7.7.2
- **Price Feeds:** Chainlink on-chain feeds, CoinGecko API, Moralis API
- **Chain Support:** Ethereum, Arbitrum (currently), Base/Avalanche/Optimism/Unichain (planned)

## Architecture

- **Pattern:** Clean Architecture with dependency injection
- **Dependency Injection:** tsyringe
- **Data Sources:** Multiple fallback strategies for token metadata and prices

## Development Tools

- **Build System:** Expo CLI
- **Type Safety:** TypeScript with strict mode
- **Code Quality:** ESLint configuration

## Deployment

- **Mobile Platforms:** iOS and Android via Expo
- **Distribution:** App Store and Google Play Store

## External APIs

- **Price Data:** Chainlink, CoinGecko, Moralis
- **Blockchain Data:** Ethereum, Arbitrum, Base, Avalanche, Optimism, Unichain
- **Token Metadata:** Multiple providers with fallback strategies

## Code Repository

- **Repository:** Local development environment
- **Version Control:** Git