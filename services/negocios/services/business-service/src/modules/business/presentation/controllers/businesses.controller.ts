import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { BusinessService } from '../../application/services/business.service';
import { BusinessResponseDto } from '../dto/business-response.dto';
import { CreateBusinessDto } from '../dto/create-business.dto';
import { ListBusinessesQueryDto } from '../dto/list-businesses-query.dto';
import { RestoreBusinessDto } from '../dto/restore-business.dto';
import { RetireBusinessDto } from '../dto/retire-business.dto';
import { UpdateBusinessAvailabilityDto } from '../dto/update-business-availability.dto';
import { UpdateBusinessDto } from '../dto/update-business.dto';

@ApiTags('Businesses')
@Controller('businesses')
export class BusinessesController {
  constructor(private readonly businessService: BusinessService) {}

  @Get()
  @ApiOperation({ summary: 'List businesses' })
  @ApiOkResponse({ type: BusinessResponseDto, isArray: true })
  async list(
    @Query() query: ListBusinessesQueryDto,
  ): Promise<BusinessResponseDto[]> {
    return this.businessService.list(query);
  }

  @Get(':businessId')
  @ApiOperation({ summary: 'Get business by id' })
  @ApiQuery({
    name: 'includeDeleted',
    required: false,
    type: Boolean,
    description: 'Include soft deleted records in the search.',
  })
  @ApiOkResponse({ type: BusinessResponseDto })
  async getById(
    @Param('businessId', ParseIntPipe) businessId: number,
    @Query('includeDeleted') includeDeleted?: string,
  ): Promise<BusinessResponseDto> {
    return this.businessService.getById(businessId, includeDeleted === 'true');
  }

  @Post()
  @ApiOperation({ summary: 'Create business' })
  @ApiCreatedResponse({ type: BusinessResponseDto })
  async create(@Body() dto: CreateBusinessDto): Promise<BusinessResponseDto> {
    return this.businessService.create(dto);
  }

  @Patch(':businessId')
  @ApiOperation({ summary: 'Update business' })
  @ApiOkResponse({ type: BusinessResponseDto })
  async update(
    @Param('businessId', ParseIntPipe) businessId: number,
    @Body() dto: UpdateBusinessDto,
  ): Promise<BusinessResponseDto> {
    return this.businessService.update(businessId, dto);
  }

  @Patch(':businessId/retire')
  @ApiOperation({ summary: 'Retire business' })
  @ApiOkResponse({ type: BusinessResponseDto })
  async retire(
    @Param('businessId', ParseIntPipe) businessId: number,
    @Body() dto: RetireBusinessDto,
  ): Promise<BusinessResponseDto> {
    return this.businessService.retire(businessId, dto);
  }

  @Patch(':businessId/restore')
  @ApiOperation({ summary: 'Restore business' })
  @ApiOkResponse({ type: BusinessResponseDto })
  async restore(
    @Param('businessId', ParseIntPipe) businessId: number,
    @Body() dto: RestoreBusinessDto,
  ): Promise<BusinessResponseDto> {
    return this.businessService.restore(businessId, dto);
  }

  @Patch(':businessId/availability')
  @ApiOperation({ summary: 'Update business availability' })
  @ApiOkResponse({ type: BusinessResponseDto })
  async updateAvailability(
    @Param('businessId', ParseIntPipe) businessId: number,
    @Body() dto: UpdateBusinessAvailabilityDto,
  ): Promise<BusinessResponseDto> {
    return this.businessService.updateAvailability(businessId, dto);
  }
}
