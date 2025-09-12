import { createPublicClient, http } from "viem";
import { arbitrum } from "viem/chains";

// Local public client for block lookups
const publicClient = createPublicClient({ chain: arbitrum, transport: http() });

/**
 * Find the closest block number at or before the given unix timestamp (seconds)
 * Uses binary search over block numbers. RPC-heavy but accurate and chain-agnostic.
 */
export async function findBlockNumberByTimestamp(targetTimestampSec: bigint): Promise<bigint> {
  const latestNumber = await publicClient.getBlockNumber();
  const latest = await publicClient.getBlock({ blockNumber: latestNumber });
  if ((latest.timestamp as bigint) <= targetTimestampSec) return latestNumber;

  // Establish lower bound by exponential backoff
  let low = 1n;
  let high = latestNumber;
  while (true) {
    const mid = high > 2n ? high / 2n : 1n;
    const b = await publicClient.getBlock({ blockNumber: mid });
    if ((b.timestamp as bigint) <= targetTimestampSec) {
      low = mid;
      break;
    }
    if (mid === 1n) break;
    high = mid;
  }

  // Binary search between low..latestNumber
  high = latestNumber;
  while (low < high) {
    const mid = (low + high + 1n) / 2n;
    const b = await publicClient.getBlock({ blockNumber: mid });
    if ((b.timestamp as bigint) <= targetTimestampSec) {
      low = mid; // move up
    } else {
      high = mid - 1n; // move down
    }
  }
  return low;
}

/**
 * Convenience: get block number approximately N days ago (at or before target timestamp)
 */
export async function getBlockNumberDaysAgo(days: number): Promise<bigint> {
  const nowSec = BigInt(Math.floor(Date.now() / 1000));
  const target = nowSec - BigInt(days * 24 * 60 * 60);
  return findBlockNumberByTimestamp(target);
}
