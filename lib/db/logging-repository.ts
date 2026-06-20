import { prisma } from "@/lib/prisma";
import { EmailLog, EmailStatus, WebhookLog, ErrorLog } from "@prisma/client";

export class EmailLogRepository {
  async getAllEmailLogs(filters?: {
    userId?: string;
    emailType?: string;
    status?: EmailStatus;
  }) {
    const where: any = {};
    
    if (filters?.userId) {
      where.userId = filters.userId;
    }
    
    if (filters?.emailType) {
      where.emailType = filters.emailType;
    }
    
    if (filters?.status) {
      where.status = filters.status;
    }

    return prisma.emailLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
  }

  async getEmailLogById(id: string) {
    return prisma.emailLog.findUnique({
      where: { id },
    });
  }

  async createEmailLog(data: {
    userId?: string;
    emailType: string;
    status?: EmailStatus;
    sentAt?: Date;
    errorMessage?: string;
  }) {
    return prisma.emailLog.create({
      data: data as any,
    });
  }

  async updateEmailLog(
    id: string,
    data: {
      status?: EmailStatus;
      sentAt?: Date;
      errorMessage?: string;
    }
  ) {
    return prisma.emailLog.update({
      where: { id },
      data,
    });
  }

  async getEmailLogsCount(filters?: {
    userId?: string;
    emailType?: string;
    status?: EmailStatus;
  }) {
    const where: any = {};
    
    if (filters?.userId) {
      where.userId = filters.userId;
    }
    
    if (filters?.emailType) {
      where.emailType = filters.emailType;
    }
    
    if (filters?.status) {
      where.status = filters.status;
    }

    return prisma.emailLog.count({ where });
  }

  async getEmailLogsByUserId(userId: string) {
    return prisma.emailLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async checkDuplicateEmail(userId: string, emailType: string, hours: number) {
    const cutoffDate = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    const count = await prisma.emailLog.count({
      where: {
        userId,
        emailType,
        status: EmailStatus.sent,
        createdAt: {
          gte: cutoffDate,
        },
      },
    });

    return count > 0;
  }
}

export class WebhookLogRepository {
  async getAllWebhookLogs(filters?: {
    webhookType?: string;
  }) {
    const where: any = {};
    
    if (filters?.webhookType) {
      where.webhookType = filters.webhookType;
    }

    return prisma.webhookLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
  }

  async getWebhookLogById(id: string) {
    return prisma.webhookLog.findUnique({
      where: { id },
    });
  }

  async createWebhookLog(data: {
    webhookType: string;
    payload?: any;
    responseStatus?: number;
    responseBody?: string;
    errorMessage?: string;
  }) {
    return prisma.webhookLog.create({
      data: data as any,
    });
  }

  async getWebhookLogsCount(filters?: {
    webhookType?: string;
  }) {
    const where: any = {};
    
    if (filters?.webhookType) {
      where.webhookType = filters.webhookType;
    }

    return prisma.webhookLog.count({ where });
  }
}

export class ErrorLogRepository {
  async getAllErrorLogs(filters?: {
    errorType?: string;
    userId?: string;
  }) {
    const where: any = {};
    
    if (filters?.errorType) {
      where.errorType = filters.errorType;
    }
    
    if (filters?.userId) {
      where.userId = filters.userId;
    }

    return prisma.errorLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
  }

  async getErrorLogById(id: string) {
    return prisma.errorLog.findUnique({
      where: { id },
    });
  }

  async createErrorLog(data: {
    errorType: string;
    errorMessage?: string;
    stackTrace?: string;
    userId?: string;
    path?: string;
    metadata?: any;
  }) {
    return prisma.errorLog.create({
      data: data as any,
    });
  }

  async getErrorLogsCount(filters?: {
    errorType?: string;
    userId?: string;
  }) {
    const where: any = {};
    
    if (filters?.errorType) {
      where.errorType = filters.errorType;
    }
    
    if (filters?.userId) {
      where.userId = filters.userId;
    }

    return prisma.errorLog.count({ where });
  }
}

export const emailLogRepository = new EmailLogRepository();
export const webhookLogRepository = new WebhookLogRepository();
export const errorLogRepository = new ErrorLogRepository();

export class LoggingRepository {
  emailLog = emailLogRepository;
  webhookLog = webhookLogRepository;
  errorLog = errorLogRepository;

  async getAllEmailLogs(filters?: {
    userId?: string;
    emailType?: string;
    status?: EmailStatus;
  }) {
    return this.emailLog.getAllEmailLogs(filters);
  }

  async getEmailLogById(id: string) {
    return this.emailLog.getEmailLogById(id);
  }

  async createEmailLog(data: {
    userId?: string;
    emailType: string;
    status?: EmailStatus;
    sentAt?: Date;
    errorMessage?: string;
  }) {
    return this.emailLog.createEmailLog(data);
  }

  async updateEmailLog(
    id: string,
    data: {
      status?: EmailStatus;
      sentAt?: Date;
      errorMessage?: string;
    }
  ) {
    return this.emailLog.updateEmailLog(id, data);
  }

  async getEmailLogsCount(filters?: {
    userId?: string;
    emailType?: string;
    status?: EmailStatus;
  }) {
    return this.emailLog.getEmailLogsCount(filters);
  }

  async getEmailLogsByUserId(userId: string) {
    return this.emailLog.getEmailLogsByUserId(userId);
  }

  async checkDuplicateEmail(userId: string, emailType: string, hours: number) {
    return this.emailLog.checkDuplicateEmail(userId, emailType, hours);
  }

  async getAllWebhookLogs(filters?: {
    webhookType?: string;
  }) {
    return this.webhookLog.getAllWebhookLogs(filters);
  }

  async getWebhookLogById(id: string) {
    return this.webhookLog.getWebhookLogById(id);
  }

  async createWebhookLog(data: {
    webhookType: string;
    payload?: any;
    responseStatus?: number;
    responseBody?: string;
    errorMessage?: string;
  }) {
    return this.webhookLog.createWebhookLog(data);
  }

  async getWebhookLogsCount(filters?: {
    webhookType?: string;
  }) {
    return this.webhookLog.getWebhookLogsCount(filters);
  }

  async getAllErrorLogs(filters?: {
    errorType?: string;
    userId?: string;
  }) {
    return this.errorLog.getAllErrorLogs(filters);
  }

  async getErrorLogById(id: string) {
    return this.errorLog.getErrorLogById(id);
  }

  async createErrorLog(data: {
    errorType: string;
    errorMessage?: string;
    stackTrace?: string;
    userId?: string;
    path?: string;
    metadata?: any;
  }) {
    return this.errorLog.createErrorLog(data);
  }

  async getErrorLogsCount(filters?: {
    errorType?: string;
    userId?: string;
  }) {
    return this.errorLog.getErrorLogsCount(filters);
  }
}

export const loggingRepository = new LoggingRepository();
