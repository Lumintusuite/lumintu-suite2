import { prisma } from "@/lib/prisma";
import { Product, Category, ProductStatus } from "@prisma/client";

export class ProductRepository {
  async getAllProducts(filters?: {
    status?: ProductStatus;
    categoryId?: string;
    search?: string;
  }) {
    const where: any = {};
    
    if (filters?.status) {
      where.status = filters.status;
    }
    
    if (filters?.categoryId) {
      where.categoryId = filters.categoryId;
    }
    
    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    return prisma.product.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getProductById(id: string) {
    return prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });
  }

  async getProductBySlug(slug: string) {
    return prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
      },
    });
  }

  async createProduct(data: {
    name: string;
    slug: string;
    description?: string;
    price: number;
    categoryId?: string;
    status?: ProductStatus;
    thumbnailPath?: string;
    filePath?: string;
  }) {
    return prisma.product.create({
      data,
      include: {
        category: true,
      },
    });
  }

  async updateProduct(
    id: string,
    data: {
      name?: string;
      slug?: string;
      description?: string;
      price?: number;
      categoryId?: string;
      status?: ProductStatus;
      thumbnailPath?: string;
      filePath?: string;
    }
  ) {
    return prisma.product.update({
      where: { id },
      data,
      include: {
        category: true,
      },
    });
  }

  async deleteProduct(id: string) {
    return prisma.product.delete({
      where: { id },
    });
  }

  async getProductsCount(filters?: {
    status?: ProductStatus;
    categoryId?: string;
  }) {
    const where: any = {};
    
    if (filters?.status) {
      where.status = filters.status;
    }
    
    if (filters?.categoryId) {
      where.categoryId = filters.categoryId;
    }

    return prisma.product.count({ where });
  }
}

export class CategoryRepository {
  async getAllCategories() {
    return prisma.category.findMany({
      orderBy: { name: "asc" },
    });
  }

  async getCategoryById(id: string) {
    return prisma.category.findUnique({
      where: { id },
      include: {
        products: true,
      },
    });
  }

  async getCategoryBySlug(slug: string) {
    return prisma.category.findUnique({
      where: { slug },
      include: {
        products: true,
      },
    });
  }

  async createCategory(data: {
    name: string;
    slug: string;
    description?: string;
  }) {
    return prisma.category.create({
      data,
    });
  }

  async updateCategory(
    id: string,
    data: {
      name?: string;
      slug?: string;
      description?: string;
    }
  ) {
    return prisma.category.update({
      where: { id },
      data,
    });
  }

  async deleteCategory(id: string) {
    return prisma.category.delete({
      where: { id },
    });
  }

  async getCategoriesCount() {
    return prisma.category.count();
  }
}

export const productRepository = new ProductRepository();
export const categoryRepository = new CategoryRepository();
