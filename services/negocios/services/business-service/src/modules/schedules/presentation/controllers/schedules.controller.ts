import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CreateScheduleDto } from '../../application/dto/create-schedule.dto';
import { ScheduleResponseDto } from '../../application/dto/schedule-response.dto';
import { UpdateScheduleDto } from '../../application/dto/update-schedule.dto';
import { SchedulesService } from '../../application/services/schedules.service';

@ApiTags('Schedules')
@Controller('businesses/:businessId/schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Get()
  @ApiOperation({ summary: 'List schedules by business' })
  @ApiParam({ name: 'businessId', type: Number, example: 1 })
  @ApiOkResponse({ type: ScheduleResponseDto, isArray: true })
  @ApiNotFoundResponse({ description: 'Business not found.' })
  async listByBusinessId(
    @Param('businessId', ParseIntPipe) businessId: number,
  ): Promise<ScheduleResponseDto[]> {
    return this.schedulesService.listByBusinessId(businessId);
  }

  @Get(':scheduleId')
  @ApiOperation({ summary: 'Get a schedule by id for a business' })
  @ApiParam({ name: 'businessId', type: Number, example: 1 })
  @ApiParam({ name: 'scheduleId', type: Number, example: 1 })
  @ApiOkResponse({ type: ScheduleResponseDto })
  @ApiNotFoundResponse({ description: 'Business or schedule not found.' })
  async getById(
    @Param('businessId', ParseIntPipe) businessId: number,
    @Param('scheduleId', ParseIntPipe) scheduleId: number,
  ): Promise<ScheduleResponseDto> {
    return this.schedulesService.getById(businessId, scheduleId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a schedule for a business' })
  @ApiParam({ name: 'businessId', type: Number, example: 1 })
  @ApiCreatedResponse({ type: ScheduleResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid schedule payload.' })
  @ApiConflictResponse({
    description: 'A schedule for the selected day already exists.',
  })
  @ApiNotFoundResponse({ description: 'Business not found.' })
  async create(
    @Param('businessId', ParseIntPipe) businessId: number,
    @Body() createScheduleDto: CreateScheduleDto,
  ): Promise<ScheduleResponseDto> {
    return this.schedulesService.create(businessId, createScheduleDto);
  }

  @Patch(':scheduleId')
  @ApiOperation({ summary: 'Update a schedule for a business' })
  @ApiParam({ name: 'businessId', type: Number, example: 1 })
  @ApiParam({ name: 'scheduleId', type: Number, example: 1 })
  @ApiOkResponse({ type: ScheduleResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid schedule payload.' })
  @ApiConflictResponse({
    description: 'A schedule for the selected day already exists.',
  })
  @ApiNotFoundResponse({ description: 'Business or schedule not found.' })
  async update(
    @Param('businessId', ParseIntPipe) businessId: number,
    @Param('scheduleId', ParseIntPipe) scheduleId: number,
    @Body() updateScheduleDto: UpdateScheduleDto,
  ): Promise<ScheduleResponseDto> {
    return this.schedulesService.update(
      businessId,
      scheduleId,
      updateScheduleDto,
    );
  }
}
