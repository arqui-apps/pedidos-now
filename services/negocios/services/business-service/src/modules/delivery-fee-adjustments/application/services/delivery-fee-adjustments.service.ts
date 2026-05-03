import { Injectable, NotFoundException } from '@nestjs/common';
import { mapDeliveryFeeAdjustmentToResponseDto } from '../../infrastructure/mappers/delivery-fee-adjustment-response.mapper';
import { DeliveryFeeAdjustmentsRepository } from '../../infrastructure/repositories/delivery-fee-adjustments.repository';
import { DeliveryFeeAdjustmentResponseDto } from '../../presentation/dto/delivery-fee-adjustment-response.dto';
import { CreateDeliveryFeeAdjustmentDto } from '../../presentation/dto/create-delivery-fee-adjustment.dto';
import { ResolveDeliveryFeeAdjustmentDto } from '../../presentation/dto/resolve-delivery-fee-adjustment.dto';

@Injectable()
export class DeliveryFeeAdjustmentsService {
  constructor(
    private readonly deliveryFeeAdjustmentsRepository: DeliveryFeeAdjustmentsRepository,
  ) {}

  async createRequest(
    dto: CreateDeliveryFeeAdjustmentDto,
  ): Promise<DeliveryFeeAdjustmentResponseDto> {
    const record =
      await this.deliveryFeeAdjustmentsRepository.createRequest(dto);
    return mapDeliveryFeeAdjustmentToResponseDto(record);
  }

  async listByExternalOrderCode(
    externalOrderCode: string,
  ): Promise<DeliveryFeeAdjustmentResponseDto[]> {
    const records =
      await this.deliveryFeeAdjustmentsRepository.findManyByExternalOrderCode(
        externalOrderCode,
      );

    if (records.length === 0) {
      throw new NotFoundException(
        `No delivery fee adjustments were found for order ${externalOrderCode}.`,
      );
    }

    return records.map((record) =>
      mapDeliveryFeeAdjustmentToResponseDto(record),
    );
  }

  async listByExternalLogisticsOrderCode(
    externalLogisticsOrderCode: string,
  ): Promise<DeliveryFeeAdjustmentResponseDto[]> {
    const records =
      await this.deliveryFeeAdjustmentsRepository.findManyByExternalLogisticsOrderCode(
        externalLogisticsOrderCode,
      );

    if (records.length === 0) {
      throw new NotFoundException(
        `No delivery fee adjustments were found for logistics order ${externalLogisticsOrderCode}.`,
      );
    }

    return records.map((record) =>
      mapDeliveryFeeAdjustmentToResponseDto(record),
    );
  }

  async resolve(
    dto: ResolveDeliveryFeeAdjustmentDto,
  ): Promise<DeliveryFeeAdjustmentResponseDto> {
    const record = await this.deliveryFeeAdjustmentsRepository.resolve(dto);
    return mapDeliveryFeeAdjustmentToResponseDto(record);
  }
}
