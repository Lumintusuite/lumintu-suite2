import { prisma } from "@/lib/prisma";
import { Payment, PaymentStatus } from "@prisma/client";

export class PaymentRepository {
  async getAllPayments(filters?: {
    orderId?: string;
    status?: PaymentStatus;
  }) {
    const where: any = {};
    
    if (filters?.orderId) {
      where.orderId = filters.orderId;
    }
    
    if (filters?.status) {
      where.status = filters.status;
    }

    return prisma.payment.findMany({
      where,
      include: {
        order: {
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getPaymentById(id: string) {
    return prisma.payment.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });
  }

  async getPaymentByOrderId(orderId: string) {
    return prisma.payment.findUnique({
      where: { orderId },
      include: {
        order: {
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });
  }

  async getPaymentByMidtransOrderId(midtransOrderId: string) {
    return prisma.payment.findUnique({
      where: { midtransOrderId },
      include: {
        order: {
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });
  }

  async createPayment(data: {
    orderId: string;
    midtransOrderId?: string;
    paymentMethod?: string;
    grossAmount: number;
    status?: PaymentStatus;
  }) {
    // Get the order to find the profileId
    const order = await prisma.order.findUnique({
      where: { id: data.orderId },
      select: { id: true },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    return prisma.payment.create({
      data: {
        orderId: data.orderId,
        midtransOrderId: data.midtransOrderId,
        paymentMethod: data.paymentMethod,
        grossAmount: data.grossAmount,
        status: data.status || PaymentStatus.pending,
      },
      include: {
        order: {
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });
  }

  async updatePayment(
    id: string,
    data: {
      midtransOrderId?: string;
      paymentMethod?: string;
      grossAmount?: number;
      status?: PaymentStatus;
      paidAt?: Date;
    }
  ) {
    return prisma.payment.update({
      where: { id },
      data,
      include: {
        order: {
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });
  }

  async deletePayment(id: string) {
    return prisma.payment.delete({
      where: { id },
    });
  }

  async getPaymentsCount(filters?: {
    status?: PaymentStatus;
  }) {
    const where: any = {};
    
    if (filters?.status) {
      where.status = filters.status;
    }

    return prisma.payment.count({ where });
  }

  async getTotalRevenue() {
    const result = await prisma.payment.aggregate({
      where: {
        status: PaymentStatus.paid,
      },
      _sum: {
        grossAmount: true,
      },
    });

    return result._sum.grossAmount || 0;
  }
}

export const paymentRepository = new PaymentRepository();
