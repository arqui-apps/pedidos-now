import {
  Prisma,
  business_order_status_history_new_status,
  business_order_status_history_status_origin,
  cancellation_penalty_rule_applicable_order_status,
  product_product_status,
} from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { ListBusinessOrdersQueryDto } from '../../presentation/dto/list-business-orders-query.dto';

type PrismaOrdersClient = Pick<
  Prisma.TransactionClient,
  | 'business'
  | 'product'
  | 'business_order'
  | 'business_order_status_history'
  | 'cancellation_penalty_rule'
>;

type BusinessOrderCreateData = Prisma.business_orderUncheckedCreateInput;
type BusinessOrderUpdateData = Prisma.business_orderUncheckedUpdateInput;
type BusinessOrderDetailCreateManyInput =
  Prisma.business_order_detailCreateManyBusiness_orderInput[];

type OrderInclude = {
  inventory_reservation: true;
  business_order_detail: { orderBy: { business_order_detail_id: 'asc' } };
  business_order_status_history: {
    orderBy: { business_order_status_history_id: 'asc' };
  };
};

@Injectable()
export class PrismaOrdersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async withTransaction<T>(
    callback: (client: PrismaOrdersClient) => Promise<T>,
  ): Promise<T> {
    return this.prisma.$transaction((tx) => callback(tx as PrismaOrdersClient));
  }

  async findBusinessById(
    businessId: number,
    client: PrismaOrdersClient = this.prisma,
  ) {
    return client.business.findFirst({
      where: {
        business_id: businessId,
        deleted_at: null,
      },
    });
  }

  async findProductsByIds(
    businessId: number,
    productIds: number[],
    client: PrismaOrdersClient = this.prisma,
  ) {
    return client.product.findMany({
      where: {
        business_id: businessId,
        product_id: { in: productIds },
        deleted_at: null,
        product_status: {
          in: [
            product_product_status.active,
            product_product_status.out_of_stock,
          ],
        },
      },
      include: {
        product_type: true,
      },
    });
  }

  async create(
    data: BusinessOrderCreateData,
    detailRows: BusinessOrderDetailCreateManyInput,
    statusHistoryObservation: string,
    client: PrismaOrdersClient = this.prisma,
  ) {
    return client.business_order.create({
      data: {
        ...data,
        business_order_detail: {
          create: detailRows,
        },
        business_order_status_history: {
          create: {
            previous_status: null,
            new_status: business_order_status_history_new_status.reserved,
            status_origin: business_order_status_history_status_origin.system,
            observation: statusHistoryObservation,
          },
        },
      },
      include: this.buildOrderInclude(),
    });
  }

  async findAll(
    businessId: number,
    query: ListBusinessOrdersQueryDto,
    client: PrismaOrdersClient = this.prisma,
  ) {
    return client.business_order.findMany({
      where: this.buildListWhere(businessId, query),
      include: this.buildOrderInclude(),
      orderBy: [{ created_at: 'desc' }, { business_order_id: 'desc' }],
    });
  }

  async findById(
    businessId: number,
    businessOrderId: number,
    client: PrismaOrdersClient = this.prisma,
  ) {
    return client.business_order.findFirst({
      where: {
        business_order_id: businessOrderId,
        business_id: businessId,
      },
      include: this.buildOrderInclude(),
    });
  }

  async findByExternalOrderCode(
    externalOrderCode: string,
    client: PrismaOrdersClient = this.prisma,
  ) {
    return client.business_order.findUnique({
      where: {
        external_order_code: externalOrderCode,
      },
      include: this.buildOrderInclude(),
    });
  }

  async findPenaltyRule(
    businessId: number,
    orderStatus: cancellation_penalty_rule_applicable_order_status,
    client: PrismaOrdersClient = this.prisma,
  ) {
    return client.cancellation_penalty_rule.findFirst({
      where: {
        business_id: businessId,
        applicable_order_status: orderStatus,
        is_active: 1,
      },
    });
  }

  async updateOrder(
    businessOrderId: number,
    data: BusinessOrderUpdateData,
    historyData: Prisma.business_order_status_historyUncheckedCreateWithoutBusiness_orderInput,
    client: PrismaOrdersClient = this.prisma,
  ) {
    return client.business_order.update({
      where: { business_order_id: businessOrderId },
      data: {
        ...data,
        business_order_status_history: {
          create: historyData,
        },
      },
      include: this.buildOrderInclude(),
    });
  }

  private buildListWhere(
    businessId: number,
    query: ListBusinessOrdersQueryDto,
  ): Prisma.business_orderWhereInput {
    return {
      business_id: businessId,
      ...(query.orderStatus ? { order_status: query.orderStatus } : {}),
      ...(query.externalCustomerId
        ? { external_customer_id: query.externalCustomerId }
        : {}),
      ...(query.search
        ? {
            OR: [
              {
                external_order_code: {
                  contains: query.search,
                },
              },
              {
                external_payment_code: {
                  contains: query.search,
                },
              },
            ],
          }
        : {}),
    };
  }

  private buildOrderInclude(): OrderInclude {
    return {
      inventory_reservation: true,
      business_order_detail: {
        orderBy: {
          business_order_detail_id: 'asc',
        },
      },
      business_order_status_history: {
        orderBy: {
          business_order_status_history_id: 'asc',
        },
      },
    };
  }
}

export type BusinessOrderRecord = NonNullable<
  Awaited<ReturnType<PrismaOrdersRepository['findByExternalOrderCode']>>
>;
