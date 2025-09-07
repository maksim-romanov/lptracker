import { PackedPositionInfo } from "../types/uniswap-v4";

/**
 * Decodes packed position info from v4
 * v4 stores position info in packed format
 */
export function decodePositionInfo(value: bigint): PackedPositionInfo {
  return {
    getTickUpper: () => {
      const raw = Number((value >> BigInt(32)) & BigInt(0xffffff));
      return raw >= 0x800000 ? raw - 0x1000000 : raw;
    },

    getTickLower: () => {
      const raw = Number((value >> BigInt(8)) & BigInt(0xffffff));
      return raw >= 0x800000 ? raw - 0x1000000 : raw;
    },

    hasSubscriber: () => (value & BigInt(0xff)) !== BigInt(0),
  };
}
