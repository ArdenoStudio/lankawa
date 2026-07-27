export { SlBankFdRatesDocsClient, default } from "./client.js";
export type { ClientOptions, RequestOptions, QueryValue } from "./client.js";
export { ENDPOINTS, type EndpointSpec } from "./catalog.js";
export type { PageResult, FdDepositQuote } from "./models.js";
export { LAB_ENDPOINTS, iterPages, iterLabEndpoint } from "./pagination.js";
export {
  shardSlice,
  shardRange,
  shardPageNumbers,
  shardOffsets,
  shardGroups,
  planShards,
} from "./shard.js";
