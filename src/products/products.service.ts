import { HttpStatus, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PaginationDto } from 'src/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prismaService: PrismaService) {}

  create(createProductDto: CreateProductDto) {
    const product = this.prismaService.product.create({
      data: createProductDto,
    });
    return product;
  }

  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;
    const totalProducts = await this.prismaService.product.count({
      where: { available: true },
    });
    const totalPages = Math.ceil(totalProducts / limit);

    if (page > totalPages && totalProducts > 0) {
      throw new RpcException({
        message: `Page ${page} exceeds total pages ${totalPages}.`,
        status: HttpStatus.BAD_REQUEST,
      });
    }

    return {
      data: await this.prismaService.product.findMany({
        take: limit,
        skip: (page - 1) * limit,
        where: { available: true },
      }),
      meta: {
        page,
        limit,
        totalPages,
        totalProducts,
      },
    };
  }

  async findOne(id: number) {
    const product = await this.prismaService.product.findUnique({
      where: { id, available: true },
    });

    if (!product) {
      throw new RpcException({
        message: `Product with ID ${id} not found.`,
        status: HttpStatus.NOT_FOUND,
      });
    }

    return product;
  }

  async update(updateProductDto: UpdateProductDto) {
    const { id, ...data } = updateProductDto;

    await this.findOne(id);

    return this.prismaService.product.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return await this.prismaService.product.update({
      where: { id },
      data: { available: false },
    });
  }
}
