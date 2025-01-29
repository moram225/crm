// src/tenants/tenants.controller.ts
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { RolesGuard } from '../common/guards/roles.guard';  // Correct path
import { Roles } from '../common/decorators/roles.decorator'; // Correct path
import { Role } from '../enums/role.enum'; // Correct path

@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  async create(@Body() createTenantDto: CreateTenantDto) {
    return this.tenantsService.create(createTenantDto);
  }
}