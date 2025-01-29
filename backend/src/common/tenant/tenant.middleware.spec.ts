import { TenantMiddleware } from './tenant.middleware';
import { PrismaService } from '../../../prisma/prisma.service';
describe('TenantMiddleware', () => {
  it('should be defined', () => {
    expect(new TenantMiddleware({} as PrismaService)).toBeDefined();
  });
});
