//src/common/guards/rate-limit.guard.ts

import { ThrottlerGuard, ThrottlerException } from '@nestjs/throttler';
import { Injectable, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

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
    const key = await this.getTracker(req);
  
    // Access throttling options from the parent class
    const { ttl, limit } = this.options;
  
    // Increment the hit count for the given key
    const { totalHits } = await this.storageService.increment(key, ttl, limit, Date.now(), '0');
  
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