import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ProductsService } from '../../application/services/products.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { DeleteProductDto } from '../dto/delete-product.dto';
import { ListProductsQueryDto } from '../dto/list-products-query.dto';
import { ProductResponseDto } from '../dto/product-response.dto';
import { RestoreProductDto } from '../dto/restore-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';

@ApiTags('Products')
@Controller('businesses/:businessId/products')
export class BusinessProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'List products for a business' })
  @ApiParam({ name: 'businessId', type: Number })
  @ApiOkResponse({ type: ProductResponseDto, isArray: true })
  async list(
    @Param('businessId', ParseIntPipe) businessId: number,
    @Query() query: ListProductsQueryDto,
  ): Promise<ProductResponseDto[]> {
    return this.productsService.list(businessId, query);
  }

  @Get(':productId')
  @ApiOperation({ summary: 'Get product by id for a business' })
  @ApiParam({ name: 'businessId', type: Number })
  @ApiParam({ name: 'productId', type: Number })
  @ApiQuery({
    name: 'includeDeleted',
    required: false,
    type: Boolean,
    description: 'Include soft deleted records in the search.',
  })
  @ApiOkResponse({ type: ProductResponseDto })
  async getById(
    @Param('businessId', ParseIntPipe) businessId: number,
    @Param('productId', ParseIntPipe) productId: number,
    @Query('includeDeleted') includeDeleted?: string,
  ): Promise<ProductResponseDto> {
    return this.productsService.getById(
      businessId,
      productId,
      includeDeleted === 'true',
    );
  }

  @Post()
  @ApiOperation({ summary: 'Create product for a business' })
  @ApiParam({ name: 'businessId', type: Number })
  @ApiCreatedResponse({ type: ProductResponseDto })
  async create(
    @Param('businessId', ParseIntPipe) businessId: number,
    @Body() dto: CreateProductDto,
  ): Promise<ProductResponseDto> {
    return this.productsService.create(businessId, dto);
  }

  @Patch(':productId')
  @ApiOperation({ summary: 'Update product for a business' })
  @ApiParam({ name: 'businessId', type: Number })
  @ApiParam({ name: 'productId', type: Number })
  @ApiOkResponse({ type: ProductResponseDto })
  async update(
    @Param('businessId', ParseIntPipe) businessId: number,
    @Param('productId', ParseIntPipe) productId: number,
    @Body() dto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    return this.productsService.update(businessId, productId, dto);
  }

  @Delete(':productId')
  @ApiOperation({ summary: 'Soft delete product for a business' })
  @ApiParam({ name: 'businessId', type: Number })
  @ApiParam({ name: 'productId', type: Number })
  @ApiBody({ type: DeleteProductDto })
  @ApiOkResponse({ type: ProductResponseDto })
  async softDelete(
    @Param('businessId', ParseIntPipe) businessId: number,
    @Param('productId', ParseIntPipe) productId: number,
    @Body() dto: DeleteProductDto,
  ): Promise<ProductResponseDto> {
    return this.productsService.softDelete(businessId, productId, dto);
  }

  @Patch(':productId/restore')
  @ApiOperation({ summary: 'Restore soft deleted product for a business' })
  @ApiParam({ name: 'businessId', type: Number })
  @ApiParam({ name: 'productId', type: Number })
  @ApiOkResponse({ type: ProductResponseDto })
  async restore(
    @Param('businessId', ParseIntPipe) businessId: number,
    @Param('productId', ParseIntPipe) productId: number,
    @Body() dto: RestoreProductDto,
  ): Promise<ProductResponseDto> {
    return this.productsService.restore(businessId, productId, dto);
  }
}
