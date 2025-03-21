declare module "telegraf-ratelimit" {
  import { Context, MiddlewareFn } from "telegraf";

  interface RateLimitOptions {
    window?: number; // Time window in milliseconds
    limit?: number; // Max number of requests per window
    onLimitExceeded?: (ctx: Context, next: () => Promise<void>) => void;
  }

  function rateLimit(options: RateLimitOptions): MiddlewareFn<Context>;
  export = rateLimit;
}
