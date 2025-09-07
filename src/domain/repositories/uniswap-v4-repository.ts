import { Address } from 'viem'
import { SupportedChain, UniswapV4Position } from '../../types/uniswap-v4'

export interface UniswapV4Repository {
  /**
   * Получает позиции пользователя на конкретной сети
   */
  getUserPositions(userAddress: Address, chain: SupportedChain): Promise<UniswapV4Position[]>

  /**
   * Получает позиции пользователя на всех поддерживаемых сетях
   */
  getUserPositionsAllChains(userAddress: Address): Promise<UniswapV4Position[]>

  /**
   * Получает позиции пользователя с кэшированием
   */
  getCachedUserPositions(userAddress: Address, chain?: SupportedChain): Promise<UniswapV4Position[]>

  /**
   * Очищает кэш позиций
   */
  clearPositionsCache(userAddress: Address): Promise<void>
}
