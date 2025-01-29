// src/tenants/dto/create-tenant.dto.ts
import { IsString, MinLength, IsEmail, IsStrongPassword } from 'class-validator';

export class CreateTenantDto {
  @IsString()
    @MinLength(3)
    name!: string;

  @IsEmail()
    adminEmail!: string;

  @IsStrongPassword()
    adminPassword!: string;
}