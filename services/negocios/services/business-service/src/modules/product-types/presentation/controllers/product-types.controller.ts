import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ProductTypesService } from '../../application/services/product-types.service';
import { CreateProductTypeDto } from '../dto/create-product-type.dto';
import { SoftDeleteProductTypeDto } from '../dto/soft-delete-product-type.dto';
import { UpdateProductTypeDto } from '../dto/update-product-type.dto';

@ApiTags('product-types')
@Controller('businesses/:businessId/product-types')
export class ProductTypesController {
  constructor(private readonly productTypesService: ProductTypesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar tipos de producto por negocio' })
  @ApiParam({ name: 'businessId', type: Number, example: 1 })
  @ApiOkResponse({ description: 'Listado obtenido correctamente' })
  findAll(@Param('businessId', ParseIntPipe) businessId: number) {
    return this.productTypesService.findAll(businessId);
  }

  @Get(':productTypeId')
  @ApiOperation({ summary: 'Obtener tipo de producto por id' })
  @ApiParam({ name: 'businessId', type: Number, example: 1 })
  @ApiParam({ name: 'productTypeId', type: Number, example: 1 })
  @ApiOkResponse({ description: 'Tipo de producto obtenido correctamente' })
  findOne(
    @Param('businessId', ParseIntPipe) businessId: number,
    @Param('productTypeId', ParseIntPipe) productTypeId: number,
  ) {
    return this.productTypesService.findOne(businessId, productTypeId);
  }

  @Post()
  @ApiOperation({ summary: 'Crear tipo de producto' })
  @ApiParam({ name: 'businessId', type: Number, example: 1 })
  @ApiCreatedResponse({ description: 'Tipo de producto creado correctamente' })
  create(
    @Param('businessId', ParseIntPipe) businessId: number,
    @Body() dto: CreateProductTypeDto,
  ) {
    return this.productTypesService.create(businessId, dto);
  }

  @Patch(':productTypeId')
  @ApiOperation({ summary: 'Actualizar tipo de producto' })
  @ApiParam({ name: 'businessId', type: Number, example: 1 })
  @ApiParam({ name: 'productTypeId', type: Number, example: 1 })
  @ApiOkResponse({ description: 'Tipo de producto actualizado correctamente' })
  update(
    @Param('businessId', ParseIntPipe) businessId: number,
    @Param('productTypeId', ParseIntPipe) productTypeId: number,
    @Body() dto: UpdateProductTypeDto,
  ) {
    return this.productTypesService.update(businessId, productTypeId, dto);
  }

  @Delete(':productTypeId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retiro lógico de tipo de producto' })
  @ApiParam({ name: 'businessId', type: Number, example: 1 })
  @ApiParam({ name: 'productTypeId', type: Number, example: 1 })
  @ApiBody({
    type: SoftDeleteProductTypeDto,
    required: false,
    description: 'Motivo opcional del retiro lógico',
  })
  @ApiOkResponse({ description: 'Tipo de producto retirado lógicamente' })
  remove(
    @Param('businessId', ParseIntPipe) businessId: number,
    @Param('productTypeId', ParseIntPipe) productTypeId: number,
    @Body() dto: SoftDeleteProductTypeDto = {},
  ) {
    return this.productTypesService.softDelete(businessId, productTypeId, dto);
  }

  @Patch(':productTypeId/restore')
  @ApiOperation({ summary: 'Restaurar tipo de producto' })
  @ApiParam({ name: 'businessId', type: Number, example: 1 })
  @ApiParam({ name: 'productTypeId', type: Number, example: 1 })
  @ApiOkResponse({ description: 'Tipo de producto restaurado correctamente' })
  restore(
    @Param('businessId', ParseIntPipe) businessId: number,
    @Param('productTypeId', ParseIntPipe) productTypeId: number,
  ) {
    return this.productTypesService.restore(businessId, productTypeId);
  }
}
