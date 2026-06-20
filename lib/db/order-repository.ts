import { prisma } from "@/lib/prisma";
import { Order, OrderStatus, OrderItem, Payment } from "@prisma/client";

export class OrderRepository {
  async getAllOrders(filters?: {
    userId?: string;
    status?: OrderStatus;
  }) {
    const where: any = {};
    
    if (filters?.userId) {
      where.userId = filters.userId;
    }
    
    if (filters?.status) {
      where.status = filters.status;
    }

    return prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: true,
          },
        },
        payment: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getOrderById(id: string) {
    return prisma.order.findUnique({
      where: { id },
      include: {
        user: true,
        items: {
          include: {
            product: true,
          },
        },
        payment: true,
      },
    });
  }

  async createOrder(data: {
    userId: string;
    total: number;
    status?: OrderStatus;
    items: Array<{
      productId: string;
      price: number;
      quantity: number;
    }>;
  }) {
    return prisma.order.create({
      data: {
        userId: data.userId,
        total: data.total,
        status: data.status || OrderStatus.pending,
        items: {
          create: data.items,
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async updateOrder(
    id: string,
    data: {
      status?: OrderStatus;
      total?: number;
    }
  ) {
    return prisma.order.update({
      where: { id },
      data,
      include: {
        items: {
          include: {
            product: true,
          },
        },
        payment: true,
      },
    });
  }

  async deleteOrder(id: string) {
    return prisma.order.delete({
      where: { id },
    });
  }

  async getOrdersCount(filters?: {
    userId?: string;
    status?: OrderStatus;
  }) {
    const where: any = {};
    
    if (filters?.userId) {
      where.userId = filters.userId;
    }
    
    if (filters?.status) {
      where.status = filters.status;
    }

    return prisma.order.count({ where });
  }

  async addOrderItem(orderId: string, data: {
    productId: string;
    price: number;
    quantity: number;
  }) {
    return prisma.orderItem.create({
      data: {
        orderId,
        ...data,
      },
      include: {
        product: true,
      },
    });
  }

  async updateOrderItem(id: string, data: {
    price?: number;
    quantity?: number;
  }) {
    return prisma.orderItem.update({
      where: { id },
      data,
      include: {
        product: true,
      },
    });
  }

  async deleteOrderItem(id: string) {
    return prisma.orderItem.delete({
      where: { id },
    });
  }
}

export const orderRepository = new OrderRepository();
