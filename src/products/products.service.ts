import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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
    const totalProducts = await this.prismaService.product.count();
    const totalPages = Math.ceil(totalProducts / limit);

    if (page > totalPages && totalProducts > 0) {
      throw new BadRequestException(
        `Page ${page} does not exist. There are only ${totalPages} pages available.`,
      );
    }

    return {
      data: await this.prismaService.product.findMany({
        take: limit,
        skip: (page - 1) * limit,
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
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found.`);
    }

    return product;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
