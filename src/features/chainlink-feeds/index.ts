// Export presentation layer
export * from "./presentation/hooks";

// Export types for external use
export type { ChainlinkPrice, ChainlinkFeed } from "./domain/types";
export type { GetChainlinkPriceDto } from "./domain/dto/chainlink-price.dto";

// Export use cases for direct usage
export { GetChainlinkPriceUseCase } from "./application/use-cases/get-chainlink-price";

// Export configuration
export { configureChainlinkDI } from "./config/di-container";
export { CHAINLINK_SUPPORTED_CHAINS, CHAINLINK_CONFIG, type SupportedChainId } from "./configs";
