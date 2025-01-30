import { Injectable, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { ThrottlerGuard, ThrottlerException, ThrottlerOptions } from '@nestjs/throttler';

// Define a type for throttler configuration
type ThrottlerConfig = {
  ttl: number;
  limit: number;
  // Add other properties if necessary, e.g., name, blockDuration, etc.
};

@Injectable()
export class RateLimitGuard extends ThrottlerGuard {
  protected async getTracker(req: Request): Promise<string> {
    const ip = req.ips?.length ? req.ips[0] : req.ip;
    if (!ip) {
      throw new Error('Unable to determine client IP address');
    }
    return ip;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse();

    // Access the first throttler configuration safely
    const throttlerConfig: ThrottlerOptions | undefined = Array.isArray(this.options)
      ? this.options[0]
      : undefined;

    if (!throttlerConfig) {
      throw new Error('No throttler configuration found');
    }

    // Resolve ttl and limit to concrete numbers
    const ttl = await (typeof throttlerConfig.ttl === 'function'
      ? throttlerConfig.ttl(context)
      : throttlerConfig.ttl);

    const limit = await (typeof throttlerConfig.limit === 'function'
      ? throttlerConfig.limit(context)
      : throttlerConfig.limit);

    if (typeof ttl !== 'number' || typeof limit !== 'number') {
      throw new Error('Invalid throttler configuration: ttl and limit must be numbers');
    }

    // Increment the hit count for the given key
    const { totalHits } = await this.storageService.increment(
      await this.getTracker(req),
      ttl,
      limit,
      Date.now(),
      '0',
    );

    // Set response headers
    res.setHeader(`${this.headerPrefix}-Limit`, limit);
    res.setHeader(`${this.headerPrefix}-Remaining`, Math.max(0, limit - totalHits));
    res.setHeader(`${this.headerPrefix}-Reset`, Math.ceil(ttl / 1000)); // Convert TTL to seconds

    // Check if the request exceeds the limit
    if (totalHits > limit) {
      throw new ThrottlerException();
    }

    return super.canActivate(context); // Call the base class method to handle further validation
  }
}