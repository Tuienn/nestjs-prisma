import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import {
  CreateUserDto,
  FilterUsersDto,
  UpdateUserNameDto,
  UpsertUserDto,
} from './dto/user.dto';
import { Post, Prisma, Role, User } from '@prisma/client';
import { PaginationQueryDto } from './dto/common.dto';
import {
  AddTagToPostDto,
  CreatePostForUserDto,
  FindPostsByAnyTagDto,
  FindPostsByTagDto,
  GetPublishedPostsByAuthorRoleDto,
  RemoveTagFromPostDto,
} from './dto/post.dto';
import { removeUndefinedObj } from './utils/common.util';
import { CreateOrderDto } from './dto/order.dto';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  private handlePrismaError(e: unknown): never {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === 'P2025')
        throw new NotFoundException(
          `${e.meta?.modelName || 'Unknown'} - Record not found`,
        );
      if (e.code === 'P2002')
        throw new ConflictException(
          `${e.meta?.modelName || 'Unknown'} - Unique constraint violated`,
        );
    }
    throw e;
  }

  async healthPrisma() {
    try {
      // Ping MongoDB trực tiếp
      await this.prisma.$runCommandRaw({ ping: 1 });
      return { status: 'connected', db: 'MongoDB' };
    } catch (error: unknown) {
      return { status: 'disconnected', error: (error as Error).message };
    }
  }

  //SECTION - Bài 1.1
  async createUser(dto: CreateUserDto): Promise<User> {
    try {
      return await this.prisma.user.create({
        data: dto,
      });
    } catch (e) {
      this.handlePrismaError(e);
    }
  }

  //SECTION - Bài 1.2
  async getUserById(id: string): Promise<User> {
    try {
      return await this.prisma.user.findUniqueOrThrow({
        where: { id },
      });
    } catch (e) {
      this.handlePrismaError(e);
    }
  }

  async getUserByEmail(email: string): Promise<User> {
    try {
      return await this.prisma.user.findUniqueOrThrow({
        where: { email },
      });
    } catch (e) {
      this.handlePrismaError(e);
    }
  }

  //SECTION - Bài 1.3
  async getAllUsers(param?: PaginationQueryDto): Promise<{
    data: User[];
    totalPages: number;
    currentPage: number;
    pageSize: number;
    total: number;
  }> {
    const { page = 0, pageSize = 10 } = param ?? {};
    const safePageSize = Math.min(pageSize, 100);

    const [data, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        skip: page * safePageSize,
        take: safePageSize,
      }),
      this.prisma.user.count(),
    ]);

    return {
      data,
      totalPages: Math.ceil(total / safePageSize),
      currentPage: page,
      pageSize: safePageSize,
      total,
    };
  }

  //SECTION - Bài 1.4
  async updateUserName(dto: UpdateUserNameDto): Promise<User> {
    try {
      return await this.prisma.user.update({
        where: { id: dto.id },
        data: { name: dto.name },
      });
    } catch (e) {
      this.handlePrismaError(e);
    }
  }

  //SECTION - Bài 1.5
  async deleteUserById(id: string): Promise<User> {
    try {
      return await this.prisma.user.delete({
        where: { id },
      });
    } catch (e) {
      this.handlePrismaError(e);
    }
  }

  //SECTION - Bài 1.6
  async countUsersByRole(role: Role): Promise<number> {
    return await this.prisma.user.count({
      where: { role },
    });
  }

  //SECTION - Bài 2.1
  async filterUsers(dto?: FilterUsersDto): Promise<User[]> {
    const { minAge, maxAge, role, nameContains } = dto ?? {};
    return await this.prisma.user.findMany({
      where: removeUndefinedObj({
        age: {
          gte: minAge,
          lte: maxAge,
        },
        role: {
          equals: role,
        },
        name: {
          contains: nameContains,
          mode: 'insensitive',
        },
      }),
    });
  }

  //SECTION - Bài 2.2
  async getPostsPaginated(dto?: PaginationQueryDto): Promise<{
    data: Post[];
    totalPages: number;
    currentPage: number;
    pageSize: number;
    total: number;
  }> {
    const { page = 0, pageSize = 10 } = dto ?? {};
    const safePageSize = Math.min(pageSize, 100);

    const [data, total] = await this.prisma.$transaction([
      this.prisma.post.findMany({
        orderBy: { createdAt: 'desc' },
        skip: page * safePageSize,
        take: safePageSize,
      }),

      this.prisma.post.count(),
    ]);

    return {
      data,
      totalPages: Math.ceil(total / safePageSize),
      currentPage: page,
      pageSize: safePageSize,
      total,
    };
  }

  //SECTION - Bài 2.3
  async createPostForUser(dto: CreatePostForUserDto): Promise<Post> {
    try {
      const { userId, postData } = dto;

      return await this.prisma.$transaction(async (tx) => {
        await tx.user.findUniqueOrThrow({ where: { id: userId } });

        return tx.post.create({
          data: { ...postData, authorId: userId },
        });
      });
    } catch (e) {
      this.handlePrismaError(e);
    }
  }

  //SECTION - Bài 2.4
  async getUserWithPosts(userId: string) {
    try {
      return await this.prisma.user.findUniqueOrThrow({
        where: { id: userId },
        include: {
          posts: {
            orderBy: { createdAt: 'desc' },
            include: {
              _count: {
                select: { comments: true },
              },
            },
          },
        },
      });
    } catch (e) {
      this.handlePrismaError(e);
    }
  }

  //SECTION - Bài 2.5
  async getPublishedPostsByAuthorRole(
    dto: GetPublishedPostsByAuthorRoleDto,
  ): Promise<{
    data: Post[];
    totalPages: number;
    currentPage: number;
    pageSize: number;
    total: number;
  }> {
    const { role, page = 0, pageSize = 10 } = dto;
    const safePageSize = Math.min(pageSize, 100);

    const where: Prisma.PostWhereInput = {
      published: true,
      author: { role }, // không cần { equals: role }
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.post.findMany({
        where,
        take: safePageSize,
        skip: page * safePageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.post.count({
        where,
      }),
    ]);

    return {
      data,
      totalPages: Math.ceil(total / safePageSize),
      currentPage: page,
      pageSize: safePageSize,
      total,
    };
  }

  //SECTION - Bài 2.6
  async unpublishOldPosts(days: number): Promise<{ count: number }> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return await this.prisma.post.updateMany({
      where: {
        published: true,
        createdAt: {
          lt: cutoffDate,
        },
      },
      data: {
        published: false,
      },
    });
  }

  //SECTION - Bài 2.7
  async addTagToPost(dto: AddTagToPostDto): Promise<Post> {
    try {
      const { postId, tag } = dto;

      return await this.prisma.$transaction(async (tx) => {
        const post = await tx.post.findUniqueOrThrow({ where: { id: postId } });

        const existingTags = post.tags || [];
        if (existingTags.includes(tag)) {
          throw new ConflictException('Tag already exists for this post');
        }

        return tx.post.update({
          where: { id: postId },
          data: { tags: { push: tag } },
        });
      });
    } catch (e) {
      this.handlePrismaError(e);
    }
  }

  async removeTagFromPost(dto: RemoveTagFromPostDto): Promise<Post> {
    try {
      const { postId, tag } = dto;

      return await this.prisma.$transaction(async (tx) => {
        const post = await tx.post.findUniqueOrThrow({ where: { id: postId } });

        const existingTags = post.tags || [];
        if (!existingTags.includes(tag)) {
          throw new NotFoundException('Tag not found for this post');
        }

        const updatedTags = existingTags.filter((t) => t !== tag);

        return tx.post.update({
          where: { id: postId },
          data: { tags: updatedTags },
        });
      });
    } catch (e) {
      this.handlePrismaError(e);
    }
  }

  //SECTION - Bài 2.8
  async findPostsByTag(dto: FindPostsByTagDto): Promise<{
    data: Post[];
    totalPages: number;
    currentPage: number;
    pageSize: number;
    total: number;
  }> {
    const { tag, page = 0, pageSize = 10 } = dto;
    const safePageSize = Math.min(pageSize, 100);
    const where: Prisma.PostWhereInput = {
      tags: {
        has: tag,
      },
    };

    const [posts, total] = await this.prisma.$transaction([
      this.prisma.post.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: page * safePageSize,
        take: safePageSize,
      }),

      this.prisma.post.count({
        where,
      }),
    ]);

    return {
      data: posts,
      totalPages: Math.ceil(total / safePageSize),
      currentPage: page,
      pageSize: safePageSize,
      total,
    };
  }

  async findPostsByAnyTag(dto: FindPostsByAnyTagDto) {
    const { tags, page = 0, pageSize = 10 } = dto;
    const safePageSize = Math.min(pageSize, 100);
    const where: Prisma.PostWhereInput = {
      tags: {
        hasSome: tags,
      },
    };

    const [posts, total] = await this.prisma.$transaction([
      this.prisma.post.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: page * safePageSize,
        take: safePageSize,
      }),

      this.prisma.post.count({
        where,
      }),
    ]);

    return {
      data: posts,
      totalPages: Math.ceil(total / safePageSize),
      currentPage: page,
      pageSize: safePageSize,
      total,
    };
  }

  //SECTION - Bài 3.1
  async upsertUser(dto: UpsertUserDto): Promise<User> {
    try {
      const { email, data } = dto;

      return await this.prisma.user.upsert({
        where: { email },
        create: { email, ...data },
        update: data,
      });
    } catch (e) {
      this.handlePrismaError(e);
    }
  }

  //SECTION - Bài 3.2
  async getUserStats(userId: string) {
    try {
      await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    } catch (e) {
      this.handlePrismaError(e);
    }

    const groups = await this.prisma.post.groupBy({
      by: ['published'],
      where: { authorId: userId },
      _count: true,
      _sum: { views: true },
    });

    // groups trả về dạng:
    // [
    //   { published: true,  _count: 5, _sum: { views: 1200 } },
    //   { published: false, _count: 3, _sum: { views: 300 } },
    // ]

    const publishedGroup = groups.find((g) => g.published);
    const unpublishedGroup = groups.find((g) => !g.published);

    const totalPosts =
      (publishedGroup?._count || 0) + (unpublishedGroup?._count || 0);
    const totalViews =
      (publishedGroup?._sum.views || 0) + (unpublishedGroup?._sum.views || 0);

    return {
      totalPosts,
      publishedPosts: publishedGroup?._count || 0,
      totalViews,
      avgViewsPerPost: totalPosts > 0 ? totalViews / totalPosts : 0,
    };
  }

  //SECTION - Bài 3.3
  async getPostCountByAuthor() {
    const result = await this.prisma.post.groupBy({
      by: ['authorId'],

      // _count: true, // Prisma chỉ tính _count là một con số tổng, không tồn tại _count.authorId → orderBy tham chiếu field không tồn tại → Prisma bỏ qua silently, không báo lỗi.
      _count: { authorId: true }, // Khi dùng _count: { authorId: true }, Prisma tính _count.authorId → orderBy có cái để sort → hoạt động đúng.

      orderBy: {
        _count: {
          authorId: 'desc',
        },
      },
    });

    return result.map((item) => ({
      authorId: item.authorId,
      postCount: item._count.authorId,
    }));
  }

  //SECTION - Bài 3.4
  async getTopViewedPosts(limit: number) {
    // Đã validate limit ở controller
    return await this.prisma.post.findMany({
      orderBy: { views: 'desc' },
      take: limit,
      include: { author: true },
    });
  }

  //SECTION - Bài 3.5
  async createOrder(dto: CreateOrderDto) {
    const { userId, items } = dto;

    try {
      return await this.prisma.$transaction(async (tx) => {
        await tx.user.findUniqueOrThrow({ where: { id: userId } });

        const productIdsFromItems = items.map((item) => item.productId);
        const productsFromDb = await tx.product.findMany({
          where: { id: { in: productIdsFromItems } },
        });

        if (productsFromDb.length !== productIdsFromItems.length) {
          throw new NotFoundException('One or more products not found');
        }

        const productMap = new Map(productsFromDb.map((p) => [p.id, p]));
        let totalAmount = 0;
        const orderItemsData: Prisma.OrderItemCreateManyOrderInput[] = [];

        for (const item of items) {
          const product = productMap.get(item.productId)!;

          if (item.quantity > product.stock) {
            throw new ConflictException(
              `Product ${product.name} is out of stock`,
            );
          }
          // Cập nhật stock của sản phẩm
          await tx.product.update({
            where: { id: product.id },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });

          totalAmount += product.price * item.quantity;
          orderItemsData.push({
            productId: item.productId,
            quantity: item.quantity,
            price: product.price,
          });
        }

        return await tx.order.create({
          data: {
            userId,
            total: totalAmount,
            items: {
              createMany: {
                data: orderItemsData,
              },
            },
          },
        });
      });
    } catch (e) {
      this.handlePrismaError(e);
    }
  }
}
