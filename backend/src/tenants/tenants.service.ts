// src/tenants/tenants.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import * as bcrypt from 'bcrypt';
import { Role } from '../enums/role.enum';

@Injectable()
export class TenantsService {
  constructor(private prisma: PrismaService) {}

  async create(createTenantDto: CreateTenantDto) {
    return this.prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: createTenantDto.name,
          users: {
            create: {
              email: createTenantDto.adminEmail,
              password: await bcrypt.hash(createTenantDto.adminPassword, 10),
              role: Role.TENANT_ADMIN
            }
          }
        },
        include: { users: true }
      });
      return tenant;
    });
  }
}