// eslint-disable-next-line @typescript-eslint/no-explicit-any
type D1Database = any;

interface CloudflareEnv {
  DB: D1Database;
  ASSETS: Fetcher;
}
