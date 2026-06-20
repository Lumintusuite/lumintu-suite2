import { prisma } from "@/lib/prisma";
import { License, LicenseStatus, LicenseActivation } from "@prisma/client";

export class LicenseRepository {
  async getAllLicenses(filters?: {
    userId?: string;
    productId?: string;
    status?: LicenseStatus;
    search?: string;
  }) {
    const where: any = {};
    
    if (filters?.userId) {
      where.userId = filters.userId;
    }
    
    if (filters?.productId) {
      where.productId = filters.productId;
    }
    
    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.search) {
      where.licenseKey = {
        contains: filters.search,
        mode: 'insensitive',
      };
    }

    return prisma.license.findMany({
      where,
      include: {
        product: true,
        activations: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getLicenseById(id: string) {
    return prisma.license.findUnique({
      where: { id },
      include: {
        product: true,
        activations: true,
      },
    });
  }

  async getLicenseByKey(licenseKey: string) {
    return prisma.license.findUnique({
      where: { licenseKey },
      include: {
        product: true,
        activations: true,
      },
    });
  }

  async createLicense(data: {
    userId: string;
    productId: string;
    orderId?: string;
    licenseKey: string;
    status?: LicenseStatus;
    expiresAt?: Date;
    maxActivations?: number;
  }) {
    return prisma.license.create({
      data,
      include: {
        product: true,
      },
    });
  }

  async updateLicense(
    id: string,
    data: {
      status?: LicenseStatus;
      expiresAt?: Date;
      activationCount?: number;
      maxActivations?: number;
    }
  ) {
    return prisma.license.update({
      where: { id },
      data,
      include: {
        product: true,
        activations: true,
      },
    });
  }

  async deleteLicense(id: string) {
    return prisma.license.delete({
      where: { id },
    });
  }

  async getLicensesCount(filters?: {
    userId?: string;
    status?: LicenseStatus;
  }) {
    const where: any = {};
    
    if (filters?.userId) {
      where.userId = filters.userId;
    }
    
    if (filters?.status) {
      where.status = filters.status;
    }

    return prisma.license.count({ where });
  }

  async getLicenseActivations(licenseId: string) {
    return prisma.licenseActivation.findMany({
      where: { licenseId },
      orderBy: { activatedAt: "desc" },
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

  async addActivation(licenseId: string, data: {
    deviceName?: string;
    domainName?: string;
    ipAddress?: string;
  }) {
    return prisma.licenseActivation.create({
      data: {
        licenseId,
        ...data,
      },
    });
  }

  async getActivationsByLicenseId(licenseId: string) {
    return prisma.licenseActivation.findMany({
      where: { licenseId },
      orderBy: { activatedAt: "desc" },
    });
  }

  async deleteActivation(id: string) {
    return prisma.licenseActivation.delete({
      where: { id },
    });
  }
}

export const licenseRepository = new LicenseRepository();
