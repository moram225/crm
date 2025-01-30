// src/common/guards/rate-limit.guard.ts

import { ThrottlerGuard, ThrottlerException } from '@nestjs/throttler';
import { Injectable, ExecutionContext } from '@nestjs/common';

@Injectable()
export class RateLimitGuard extends ThrottlerGuard {
  [x: string]: any;
  protected async getTracker(req: Record<string, any>): Promise<string> {
    return req.ips?.length ? req.ips[0] : req.ip;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();

    const key = await this.getTracker(req);
    
    // Get throttling options using parent class method
    const { ttl, limit } = this.getOptions(context);

    const { totalHits } = await this.storageService.increment(key, ttl, limit, Date.now(), '0');

    res.header(`${this.headerPrefix}-Limit`, limit);
    res.header(`${this.headerPrefix}-Remaining`, Math.max(0, limit - totalHits));
    res.header(`${this.headerPrefix}-Reset`, ttl);

    if (totalHits > limit) {
      throw new ThrottlerException();
    }

    return super.canActivate(context); // Call the base class method to handle further validation
  }
}
