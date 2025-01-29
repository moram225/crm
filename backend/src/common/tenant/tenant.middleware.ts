// common/tenant/tenant.middleware.ts
import { Injectable, NestMiddleware, NotFoundException, ForbiddenException } from '@nestjs/common';

import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../../../prisma/prisma.service';

declare module 'express' {
  interface Request {
    tenantId?: string;
    user?: {
      tenantId?: string;
    };
  }
}

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private prisma: PrismaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Handle header array case
    const headerTenantId = req.headers['x-tenant-id'];
    const tenantId = Array.isArray(headerTenantId) 
      ? headerTenantId[0] 
      : headerTenantId || req.user?.tenantId;
  
    if (!tenantId) {
      throw new ForbiddenException('Tenant identification required');
    }
  
    // Verify tenant exists
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId }
    });
  
    if (!tenant) throw new NotFoundException('Tenant not found');
    
    req.tenantId = tenantId; // Now guaranteed to be string|undefined
    next();
  }
}