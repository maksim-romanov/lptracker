import { Address } from "viem";

import { container } from "../di/container";
import { UniswapV4Service } from "../features/uniswap-v4/api/uniswap-v4-service";
import { GetUserPositionsUseCaseImpl } from "../features/uniswap-v4/model/use-cases/get-user-positions";

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
        console.log(`  Raw info: ${position.info}`);
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
      const getUserPositionsUseCase = container.resolve(GetUserPositionsUseCaseImpl);
      const positions = await getUserPositionsUseCase.execute(userAddress);

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
  // store example removed
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
