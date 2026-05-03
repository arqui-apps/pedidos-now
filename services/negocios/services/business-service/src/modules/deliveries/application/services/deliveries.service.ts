import { Injectable, NotFoundException } from '@nestjs/common';
import { mapDeliveryToResponseDto } from '../../infrastructure/mappers/delivery-response.mapper';
import { DeliveriesRepository } from '../../infrastructure/repositories/deliveries.repository';
import { BusinessOrderDeliveryResponseDto } from '../../presentation/dto/business-order-delivery-response.dto';
import { LinkBusinessOrderDeliveryDto } from '../../presentation/dto/link-business-order-delivery.dto';
import { UpdateBusinessOrderDeliveryStatusDto } from '../../presentation/dto/update-business-order-delivery-status.dto';

@Injectable()
export class DeliveriesService {
  constructor(private readonly deliveriesRepository: DeliveriesRepository) {}

  async linkDelivery(
    dto: LinkBusinessOrderDeliveryDto,
  ): Promise<BusinessOrderDeliveryResponseDto> {
    const record = await this.deliveriesRepository.createLink(dto);
    return mapDeliveryToResponseDto(record);
  }

  async getByExternalOrderCode(
    externalOrderCode: string,
  ): Promise<BusinessOrderDeliveryResponseDto> {
    const record =
      await this.deliveriesRepository.findByExternalOrderCode(
        externalOrderCode,
      );

    if (!record) {
      throw new NotFoundException(
        `Delivery for order ${externalOrderCode} was not found.`,
      );
    }

    return mapDeliveryToResponseDto(record);
  }

  async getByExternalLogisticsOrderCode(
    externalLogisticsOrderCode: string,
  ): Promise<BusinessOrderDeliveryResponseDto> {
    const record =
      await this.deliveriesRepository.findByExternalLogisticsOrderCode(
        externalLogisticsOrderCode,
      );

    if (!record) {
      throw new NotFoundException(
        `Delivery for logistics order ${externalLogisticsOrderCode} was not found.`,
      );
    }

    return mapDeliveryToResponseDto(record);
  }

  async updateStatus(
    dto: UpdateBusinessOrderDeliveryStatusDto,
  ): Promise<BusinessOrderDeliveryResponseDto> {
    const record = await this.deliveriesRepository.updateStatus(dto);
    return mapDeliveryToResponseDto(record);
  }
}
