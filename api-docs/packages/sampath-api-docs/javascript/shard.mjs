/** Shard helpers for parallel probes / crawls (ESM). */

const CEB_GROUPS = "ABCDEFGHIJKLMNOPQRSTUVWXY".split("");

export function shardSlice(items, shardIndex, shardCount) {
  if (shardCount < 1) throw new Error("shardCount must be >= 1");
  if (shardIndex < 0 || shardIndex >= shardCount) throw new Error("shardIndex out of range");
  return items.filter((_, i) => i % shardCount === shardIndex);
}

export function shardRange(start, end, shardIndex, shardCount) {
  if (end < start) throw new Error("end must be >= start");
  if (shardCount < 1) throw new Error("shardCount must be >= 1");
  const total = end - start;
  const base = Math.floor(total / shardCount);
  const rem = total % shardCount;
  const lo = start + shardIndex * base + Math.min(shardIndex, rem);
  const hi = lo + base + (shardIndex < rem ? 1 : 0);
  return [lo, hi];
}

export function shardPageNumbers(startPage, endPage, shardIndex, shardCount) {
  const [lo, hi] = shardRange(startPage, endPage + 1, shardIndex, shardCount);
  return Array.from({ length: hi - lo }, (_, i) => lo + i);
}

export function shardOffsets(totalRecords, pageSize, shardIndex, shardCount) {
  if (pageSize < 1) throw new Error("pageSize must be >= 1");
  const offsets = [];
  for (let o = 0; o < Math.max(totalRecords, 0); o += pageSize) offsets.push(o);
  return shardSlice(offsets, shardIndex, shardCount);
}

export function shardGroups(shardIndex, shardCount, groups = CEB_GROUPS) {
  return shardSlice(groups, shardIndex, shardCount);
}

export function planShards(shardCount) {
  return Array.from({ length: shardCount }, (_, index) => ({ index, count: shardCount }));
}
