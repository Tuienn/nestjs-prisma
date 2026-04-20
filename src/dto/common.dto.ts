import { Type } from 'class-transformer';
import {
  IsDefined,
  IsEmail,
  IsInt,
  IsMongoId,
  IsOptional,
  Min,
} from 'class-validator';

export class EmailQueryParamDto {
  @IsDefined({ message: 'Email query parameter is required' })
  @IsEmail({}, { message: 'Invalid email format' })
  email!: string;
}

export class ObjectIdDto {
  @IsMongoId({ message: 'Invalid ObjectId format' })
  id!: string;
}

export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number) // Chuyển đổi query string sang number
  @IsInt({ message: 'Page must be an integer' })
  @Min(0, { message: 'Page must be a non-negative integer' })
  page?: number;

  @IsOptional()
  @Type(() => Number) // Chuyển đổi query string sang number
  @IsInt({ message: 'Page size must be an integer' })
  @Min(0, { message: 'Page size must be a non-negative integer' })
  pageSize?: number;
}
