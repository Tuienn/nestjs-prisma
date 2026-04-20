import { Type } from 'class-transformer';
import {
  IsDefined,
  IsInt,
  IsMongoId,
  Min,
  ValidateNested,
} from 'class-validator';

class CreateOrderItemDto {
  @IsDefined({ message: 'Product ID is required' })
  @IsMongoId({ message: 'Invalid ObjectId format' })
  productId!: string;

  @IsDefined({ message: 'Quantity is required' })
  @IsInt({ message: 'Quantity must be an integer' })
  @Min(1, { message: 'Quantity must be at least 1' })
  quantity!: number;
}

export class CreateOrderDto {
  @IsDefined({ message: 'User ID is required' })
  @IsMongoId({ message: 'Invalid ObjectId format' })
  userId!: string;

  @IsDefined({ message: 'Data is required' })
  @ValidateNested()
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];
}
