import { prisma } from "@/lib/prisma";
import { Affiliate, AffiliateStatus, ReferralStatus, ReferralClick, Referral, AffiliateNotification } from "@prisma/client";

export class AffiliateRepository {
  async getAllAffiliates(filters?: {
    userId?: string;
    status?: AffiliateStatus;
    search?: string;
  }) {
    const where: any = {};
    
    if (filters?.userId) {
      where.userId = filters.userId;
    }
    
    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.search) {
      where.affiliateCode = {
        contains: filters.search,
        mode: 'insensitive',
      };
    }

    return prisma.affiliate.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
  }

  async getAffiliateById(id: string) {
    return prisma.affiliate.findUnique({
      where: { id },
    });
  }

  async getAffiliateByUserId(userId: string) {
    return prisma.affiliate.findFirst({
      where: { userId },
    });
  }

  async getAffiliateByCode(affiliateCode: string) {
    return prisma.affiliate.findUnique({
      where: { affiliateCode },
    });
  }

  async createAffiliate(data: {
    userId: string;
    affiliateCode: string;
    status?: AffiliateStatus;
    commissionRate?: number;
  }) {
    return prisma.affiliate.create({
      data,
    });
  }

  async updateAffiliate(
    id: string,
    data: {
      status?: AffiliateStatus;
      commissionRate?: number;
    }
  ) {
    return prisma.affiliate.update({
      where: { id },
      data,
    });
  }

  async deleteAffiliate(id: string) {
    return prisma.affiliate.delete({
      where: { id },
    });
  }

  async getAffiliatesCount(filters?: {
    status?: AffiliateStatus;
  }) {
    const where: any = {};
    
    if (filters?.status) {
      where.status = filters.status;
    }

    return prisma.affiliate.count({ where });
  }

  async addReferralClick(data: {
    affiliateId: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return prisma.referralClick.create({
      data: {
        affiliateId: data.affiliateId,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    });
  }

  async getReferralClicksByAffiliateId(affiliateId: string) {
    return prisma.referralClick.findMany({
      where: { affiliateId },
      orderBy: { createdAt: "desc" },
    });
  }

  async getReferralClicksCount(affiliateId: string) {
    return prisma.referralClick.count({
      where: { affiliateId },
    });
  }

  async getAllReferrals(filters?: {
    affiliateId?: string;
    status?: ReferralStatus;
  }) {
    const where: any = {};
    
    if (filters?.affiliateId) {
      where.affiliateId = filters.affiliateId;
    }
    
    if (filters?.status) {
      where.status = filters.status;
    }

    return prisma.referral.findMany({
      where,
      include: {
        affiliate: true,
        order: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getReferralByOrderId(orderId: string) {
    return prisma.referral.findFirst({
      where: { orderId },
    });
  }

  async createReferral(data: {
    affiliateId: string;
    orderId: string;
    commissionAmount?: number;
    status?: ReferralStatus;
  }) {
    return prisma.referral.create({
      data: {
        affiliateId: data.affiliateId,
        orderId: data.orderId,
        commissionAmount: data.commissionAmount,
        status: data.status,
      },
      include: {
        affiliate: true,
        order: true,
      },
    });
  }

  async updateReferral(
    id: string,
    data: {
      commissionAmount?: number;
      status?: ReferralStatus;
    }
  ) {
    return prisma.referral.update({
      where: { id },
      data,
      include: {
        affiliate: true,
        order: true,
      },
    });
  }

  async getReferralsByAffiliateId(affiliateId: string) {
    return prisma.referral.findMany({
      where: { affiliateId },
      include: {
        order: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getReferralsCount(affiliateId: string) {
    return prisma.referral.count({
      where: { affiliateId },
    });
  }

  async createNotification(data: {
    affiliateId: string;
    title: string;
    message: string;
    isRead?: boolean;
  }) {
    return prisma.affiliateNotification.create({
      data: {
        affiliateId: data.affiliateId,
        title: data.title,
        message: data.message,
        isRead: data.isRead,
      },
    });
  }

  async updateNotification(id: string, data: {
    isRead?: boolean;
  }) {
    return prisma.affiliateNotification.update({
      where: { id },
      data,
    });
  }

  async getNotificationsByAffiliateId(affiliateId: string) {
    return prisma.affiliateNotification.findMany({
      where: { affiliateId },
      orderBy: { createdAt: "desc" },
    });
  }

  async getUnreadNotificationsCount(affiliateId: string) {
    return prisma.affiliateNotification.count({
      where: {
        affiliateId,
        isRead: false,
      },
    });
  }

  async getUserById(userId: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
      },
    });
  }

  async getAllNotifications(affiliateId: string) {
    return prisma.affiliateNotification.findMany({
      where: { affiliateId },
      orderBy: { createdAt: "desc" },
    });
  }
}

export const affiliateRepository = new AffiliateRepository();
