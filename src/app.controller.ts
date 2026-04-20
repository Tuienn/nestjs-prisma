import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { AppService } from './app.service';
import {
  CreateUserDto,
  FilterUsersDto,
  UpdateUserNameDto,
  UpsertUserDto,
} from './dto/user.dto';
import {
  EmailQueryParamDto,
  ObjectIdDto,
  PaginationQueryDto,
} from './dto/common.dto';
import { ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import {
  AddTagToPostDto,
  CreatePostForUserDto,
  FindPostsByAnyTagDto,
  FindPostsByTagDto,
  GetPublishedPostsByAuthorRoleDto,
} from './dto/post.dto';
import { CreateOrderDto } from './dto/order.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health/prisma')
  healthPrisma() {
    return this.appService.healthPrisma();
  }

  @Post('user')
  @ApiBody({
    type: CreateUserDto,
    examples: {
      'Create User': {
        value: {
          email: 'john.doe@example.com',
          name: 'John Doe',
          age: 30,
        },
      },
    },
  })
  createUser(@Body() dto: CreateUserDto) {
    return this.appService.createUser(dto);
  }

  @Get('user/email')
  @ApiQuery({
    name: 'email',
    description: 'User email',
    type: String,
  })
  getUserByEmail(@Query() query: EmailQueryParamDto) {
    return this.appService.getUserByEmail(query.email);
  }

  @Get('user/:id')
  @ApiParam({
    name: 'id',
    description: 'User ID (MongoDB ObjectId)',
    type: String,
  })
  getUserById(@Param() param: ObjectIdDto) {
    return this.appService.getUserById(param.id);
  }

  @Get('users')
  @ApiQuery({
    name: 'page',
    description: 'Page number',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'pageSize',
    description: 'Page size',
    required: false,
    type: Number,
  })
  getAllUsers(@Query() query: PaginationQueryDto) {
    return this.appService.getAllUsers(query);
  }

  @Patch('user')
  updateUserName(@Body() dto: UpdateUserNameDto) {
    return this.appService.updateUserName(dto);
  }

  @Delete('user/:id')
  @ApiParam({
    name: 'id',
    description: 'User ID (MongoDB ObjectId)',
    type: String,
  })
  deleteUserById(@Param() param: ObjectIdDto) {
    return this.appService.deleteUserById(param.id);
  }

  @Get('users/filter')
  @ApiQuery({
    name: 'minAge',
    description: 'Minimum age',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'maxAge',
    description: 'Maximum age',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'role',
    description: 'Role',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'nameContains',
    description: 'Name contains',
    required: false,
    type: String,
  })
  filterUsers(@Query() query?: FilterUsersDto) {
    const { minAge, maxAge } = query ?? {};

    if (minAge && maxAge && minAge > maxAge) {
      throw new BadRequestException('Min age must be less than max age');
    }

    return this.appService.filterUsers(query);
  }

  @Get('posts')
  @ApiQuery({
    name: 'page',
    description: 'Page number',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'pageSize',
    description: 'Page size',
    required: false,
    type: Number,
  })
  getPostsPaginated(@Query() query: PaginationQueryDto) {
    return this.appService.getPostsPaginated(query);
  }

  @Post('post')
  @ApiBody({
    type: CreatePostForUserDto,
    examples: {
      'Create Post for User': {
        value: {
          userId: '64a7b2c8e1d2f3a4b5c6d7ea',
          postData: {
            title: 'My First Post',
            content: 'This is the content of my first post.',
            published: true,
            tags: ['introduction', 'first'],
          },
        },
      },
    },
  })
  createPostForUser(@Body() dto: CreatePostForUserDto) {
    return this.appService.createPostForUser(dto);
  }

  @Get('user/:id/posts')
  @ApiParam({
    name: 'id',
    description: 'User ID (MongoDB ObjectId)',
    type: String,
  })
  getUserWithPosts(@Param() param: ObjectIdDto) {
    return this.appService.getUserWithPosts(param.id);
  }

  @Get('posts/published-by-role')
  @ApiQuery({
    name: 'role',
    description: 'Author role (USER, ADMIN, MODERATOR)',
    required: true,
    type: String,
  })
  @ApiQuery({
    name: 'page',
    description: 'Page number',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'pageSize',
    description: 'Page size',
    required: false,
    type: Number,
  })
  getPublishedPostsByAuthorRole(
    @Query() query: GetPublishedPostsByAuthorRoleDto,
  ) {
    return this.appService.getPublishedPostsByAuthorRole(query);
  }

  @Patch('posts/unpublish-old')
  @ApiQuery({
    name: 'days',
    description: 'Number of days to determine old posts',
    required: true,
    type: Number,
  })
  unpublishOldPosts(@Query('days') days: number) {
    if (isNaN(days) || days < 0) {
      throw new BadRequestException('Days must be a non-negative number');
    }

    return this.appService.unpublishOldPosts(days);
  }

  @Post('post/tag')
  @ApiBody({
    type: AddTagToPostDto,
    examples: {
      'Add Tag to Post': {
        value: {
          postId: '64a7b2c8e1d2f3a4b5c6d7e2',
          tag: 'nestjs',
        },
      },
    },
  })
  addTagToPost(@Body() dto: AddTagToPostDto) {
    return this.appService.addTagToPost(dto);
  }

  @Delete('post/tag')
  @ApiBody({
    type: AddTagToPostDto,
    examples: {
      'Remove Tag from Post': {
        value: {
          postId: '64a7b2c8e1d2f3a4b5c6d7e8',
          tag: 'nestjs',
        },
      },
    },
  })
  removeTagFromPost(@Body() dto: AddTagToPostDto) {
    return this.appService.removeTagFromPost(dto);
  }

  @Get('posts/by-tag')
  @ApiQuery({
    name: 'tag',
    description: 'Tag to filter posts',
    required: true,
    type: String,
  })
  @ApiQuery({
    name: 'page',
    description: 'Page number',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'pageSize',
    description: 'Page size',
    required: false,
    type: Number,
  })
  findPostsByTag(@Query() query: FindPostsByTagDto) {
    return this.appService.findPostsByTag(query);
  }

  @Get('posts/by-any-tag')
  @ApiQuery({
    name: 'tag',
    description: 'Tag to filter posts',
    required: true,
    type: Array,
  })
  @ApiQuery({
    name: 'page',
    description: 'Page number',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'pageSize',
    description: 'Page size',
    required: false,
    type: Number,
  })
  findPostsByAnyTag(@Query() query: FindPostsByAnyTagDto) {
    return this.appService.findPostsByAnyTag(query);
  }

  @Post('user/upsert')
  @ApiBody({
    type: UpsertUserDto,
    examples: {
      'Upsert User': {
        value: {
          email: 'user@example.com',
          data: {
            name: 'John Doe',
            age: 30,
          },
        },
      },
    },
  })
  upsertUser(@Body() dto: UpsertUserDto) {
    return this.appService.upsertUser(dto);
  }

  @Get('user/:id/stats')
  @ApiParam({
    name: 'id',
    description: 'User ID (MongoDB ObjectId)',
    type: String,
  })
  getUserStats(@Param() param: ObjectIdDto) {
    return this.appService.getUserStats(param.id);
  }

  @Get('posts/count-by-author')
  getPostCountByAuthor() {
    return this.appService.getPostCountByAuthor();
  }

  @Get('posts/top-viewed')
  @ApiQuery({
    name: 'limit',
    description: 'Number of top viewed posts to return',
    required: true,
    type: Number,
  })
  getTopViewedPosts(@Query('limit') limit: number) {
    if (isNaN(limit) || limit <= 0) {
      throw new BadRequestException('Limit must be a positive number');
    }

    return this.appService.getTopViewedPosts(limit);
  }

  @Post('order')
  @ApiBody({
    type: CreateOrderDto,
    examples: {
      'Create Order': {
        value: {
          userId: '69e34a8685d26ed1b3718973',
          items: [
            {
              productId: '69e34a8685d26ed1b3718980',
              quantity: 2,
            },
            {
              productId: '69e34a8685d26ed1b3718977',
              quantity: 1,
            },
          ],
        },
      },
    },
  })
  createOrder(@Body() dto: CreateOrderDto) {
    return this.appService.createOrder(dto);
  }
}
