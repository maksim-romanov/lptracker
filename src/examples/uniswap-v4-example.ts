import { Address } from "viem";

import { UniswapV4Service } from "../data/services/uniswap-v4-service";
import { container } from "../di/container";
import { ClearPositionsCacheUseCaseImpl, GetUserPositionsUseCaseImpl } from "../domain/use-cases/uniswap-v4-positions";
import { UniswapV4PositionsStore } from "../presentation/stores/uniswap-v4-positions-store";

/**
 * Пример использования Uniswap V4 API
 */
export class UniswapV4Example {
  /**
   * Пример получения позиций пользователя на конкретной сети
   */
  static async fetchPositionsOnChain(userAddress: Address, chain: "ethereum" | "arbitrum") {
    try {
      const service = new UniswapV4Service(chain);
      const positions = await service.fetchUserPositions(userAddress);

      console.log(`Found ${positions.length} positions on ${chain}`);
      positions.forEach((position) => {
        console.log(`Position ${position.tokenId}:`);
        console.log(`  Token0: ${position.poolKey.currency0}`);
        console.log(`  Token1: ${position.poolKey.currency1}`);
        console.log(`  Fee: ${position.poolKey.fee / 10000}%`);
        console.log(`  Range: ${position.tickLower} to ${position.tickUpper}`);
        console.log(`  Liquidity: ${position.liquidity}`);
        console.log("---");
      });

      return positions;
    } catch (error) {
      console.error(`Error fetching positions on ${chain}:`, error);
      throw error;
    }
  }

  /**
   * Пример получения позиций пользователя на всех сетях
   */
  static async fetchPositionsAllChains(userAddress: Address) {
    try {
      const positions = await UniswapV4Service.fetchUserPositionsAllChains(userAddress);

      console.log(`Found ${positions.length} total positions across all chains`);

      // Группируем по сетям
      const positionsByChain = positions.reduce(
        (acc, position) => {
          if (!acc[position.chain]) {
            acc[position.chain] = [];
          }
          acc[position.chain].push(position);
          return acc;
        },
        {} as Record<string, typeof positions>,
      );

      Object.entries(positionsByChain).forEach(([chain, chainPositions]) => {
        console.log(`${chain}: ${chainPositions.length} positions`);
      });

      return positions;
    } catch (error) {
      console.error("Error fetching positions on all chains:", error);
      throw error;
    }
  }

  /**
   * Пример использования store с DI
   */
  static async useStoreExample(userAddress: Address) {
    try {
      // Получаем use cases из DI контейнера
      const getUserPositionsUseCase = container.resolve(GetUserPositionsUseCaseImpl);
      const clearPositionsCacheUseCase = container.resolve(ClearPositionsCacheUseCaseImpl);

      // Создаем store
      const store = new UniswapV4PositionsStore(getUserPositionsUseCase, clearPositionsCacheUseCase);

      // Получаем позиции
      await store.fetchUserPositions(userAddress);

      console.log(`Store has ${store.positions.length} positions`);
      console.log(`Loading: ${store.isLoading}`);
      console.log(`Error: ${store.error}`);

      return store;
    } catch (error) {
      console.error("Error using store:", error);
      throw error;
    }
  }
}

// Пример использования:
// const userAddress = '0xYourAddress' as Address
//
// // Получить позиции на Ethereum
// await UniswapV4Example.fetchPositionsOnChain(userAddress, 'ethereum')
//
// // Получить позиции на Arbitrum
// await UniswapV4Example.fetchPositionsOnChain(userAddress, 'arbitrum')
//
// // Получить позиции на всех сетях
// await UniswapV4Example.fetchPositionsAllChains(userAddress)
//
// // Использовать store
// const store = await UniswapV4Example.useStoreExample(userAddress)
