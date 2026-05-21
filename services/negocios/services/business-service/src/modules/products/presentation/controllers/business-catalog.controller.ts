import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ProductsService } from '../../application/services/products.service';
import { BusinessCatalogResponseDto } from '../dto/business-catalog-response.dto';

@ApiTags('Catalog')
@Controller('businesses/:businessId/catalog')
export class BusinessCatalogController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({
    summary:
      'Get visible base catalog for a business using product and product_type operational filters',
  })
  @ApiParam({ name: 'businessId', type: Number })
  @ApiOkResponse({ type: BusinessCatalogResponseDto })
  async getCatalog(
    @Param('businessId', ParseIntPipe) businessId: number,
  ): Promise<BusinessCatalogResponseDto> {
    return this.productsService.getCatalog(businessId);
  }
}
