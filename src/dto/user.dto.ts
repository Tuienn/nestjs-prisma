import { Role } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsDefined,
  IsEmail,
  IsEnum,
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class CreateUserDto {
  @IsDefined({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email format' })
  email!: string;

  @IsDefined({ message: 'Name is required' })
  @IsString({ message: 'Name must be a string' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Name must be at most 50 characters long' })
  name!: string;

  @IsDefined({ message: 'Age is required' })
  @IsInt({ message: 'Age must be an integer' })
  @Min(0, { message: 'Age must be a positive number' })
  age!: number;
}

export class UpdateUserNameDto {
  @IsDefined({ message: 'User ID is required' })
  @IsMongoId({ message: 'Invalid ObjectId format' })
  id!: string;

  @IsDefined({ message: 'Name is required' })
  @IsString({ message: 'Name must be a string' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Name must be at most 50 characters long' })
  name!: string;
}

export class FilterUsersDto {
  @IsOptional()
  @Type(() => Number) // Chuyển đổi query string sang number
  @IsInt({ message: 'Min age must be an integer' })
  @Min(0, { message: 'Min age must be a non-negative integer' })
  minAge?: number;

  @IsOptional()
  @Type(() => Number) // Chuyển đổi query string sang number
  @IsInt({ message: 'Max age must be an integer' })
  @Min(0, { message: 'Max age must be a non-negative integer' })
  maxAge?: number;

  @IsOptional()
  @IsEnum(Role, { message: 'Role must be either USER, ADMIN or MODERATOR' })
  role?: Role;

  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Name must be at most 50 characters long' })
  nameContains?: string;
}

class UpsertUserDataDto {
  @IsDefined({ message: 'Name is required' })
  @IsString({ message: 'Name must be a string' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Name must be at most 50 characters long' })
  name!: string;

  @IsDefined({ message: 'Age is required' })
  @IsInt({ message: 'Age must be an integer' })
  @Min(0, { message: 'Age must be a positive number' })
  age!: number;
}

export class UpsertUserDto {
  @IsDefined({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email format' })
  email!: string;

  @IsDefined({ message: 'Data is required' })
  @ValidateNested()
  @Type(() => UpsertUserDataDto)
  data!: UpsertUserDataDto;
}
