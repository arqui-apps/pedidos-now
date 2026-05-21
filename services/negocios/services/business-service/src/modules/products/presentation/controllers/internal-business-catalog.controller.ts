import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ProductsService } from '../../application/services/products.service';
import { BusinessCatalogResponseDto } from '../dto/business-catalog-response.dto';

@ApiTags('Internal Products')
@Controller('internal/businesses/:businessId/base-catalog')
export class InternalBusinessCatalogController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({
    summary:
      'Get internal base catalog for a business with the same operational filters as the external catalog',
  })
  @ApiParam({ name: 'businessId', type: Number })
  @ApiOkResponse({ type: BusinessCatalogResponseDto })
  async getBaseCatalog(
    @Param('businessId', ParseIntPipe) businessId: number,
  ): Promise<BusinessCatalogResponseDto> {
    return this.productsService.getBaseCatalog(businessId);
  }
}
