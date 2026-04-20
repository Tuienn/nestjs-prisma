import { Role } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDefined,
  IsEnum,
  IsMongoId,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { PaginationQueryDto } from './common.dto';

export class CreatePostDataDto {
  @IsDefined({ message: 'Title is required' })
  @IsString({ message: 'Title must be a string' })
  title!: string;

  @IsDefined({ message: 'Content is required' })
  @IsString({ message: 'Content must be a string' })
  content!: string;

  @IsOptional()
  @IsBoolean({ message: 'Published must be a boolean' })
  published?: boolean;

  @IsOptional()
  @IsArray({ message: 'Tags must be an array' })
  @IsString({ each: true, message: 'Each tag must be a string' })
  tags?: string[];
}

export class CreatePostForUserDto {
  @IsDefined({ message: 'User ID is required' })
  @IsMongoId({ message: 'Invalid ObjectId format' })
  userId!: string;

  @IsDefined({ message: 'Post data is required' })
  @ValidateNested()
  @Type(() => CreatePostDataDto)
  postData!: CreatePostDataDto;
}

export class GetPublishedPostsByAuthorRoleDto extends PaginationQueryDto {
  @IsDefined({ message: 'Role is required' })
  @IsEnum(Role, { message: 'Role must be either USER, ADMIN or MODERATOR' })
  role!: Role;
}

export class AddTagToPostDto {
  @IsDefined({ message: 'Post ID is required' })
  @IsMongoId({ message: 'Invalid ObjectId format' })
  postId!: string;

  @IsDefined({ message: 'Tag is required' })
  @IsString({ message: 'Tag must be a string' })
  tag!: string;
}

export class RemoveTagFromPostDto extends AddTagToPostDto {}

export class FindPostsByTagDto extends PaginationQueryDto {
  @IsDefined({ message: 'Tag is required' })
  @IsString({ message: 'Tag must be a string' })
  tag!: string;
}

export class FindPostsByAnyTagDto extends PaginationQueryDto {
  @IsDefined({ message: 'Tags are required' })
  @IsArray({ message: 'Tags must be an array' })
  @IsString({ each: true, message: 'Each tag must be a string' })
  tags!: string[];
}
