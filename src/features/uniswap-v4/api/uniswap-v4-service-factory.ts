import { SupportedChain } from "./configs";
import { UniswapV4Service } from "./uniswap-v4-service";

/**
 * Factory for creating and managing UniswapV4Service instances
 * Implements singleton pattern to avoid creating multiple instances for the same chain
 */
export class UniswapV4ServiceFactory {
  private services = new Map<SupportedChain, UniswapV4Service>();

  /**
   * Gets or creates a UniswapV4Service instance for the specified chain
   */
  getService(chain: SupportedChain): UniswapV4Service {
    if (!this.services.has(chain)) {
      this.services.set(chain, new UniswapV4Service(chain));
    }
    return this.services.get(chain)!;
  }

  /**
   * Gets services for all supported chains
   */
  getAllServices(): UniswapV4Service[] {
    const chains: SupportedChain[] = ["ethereum", "arbitrum"];
    return chains.map((chain) => this.getService(chain));
  }

  /**
   * Clears all cached service instances
   * Useful for testing or when configuration changes
   */
  clearCache(): void {
    this.services.clear();
  }
}
