import type { PrismaClient } from "@prisma/client"
import { logger } from "../lib/logger"
import { buildWhereClause, buildOrderByClause } from "../utils/query-helpers"
import type { FilterParams, PaginationParams, SortParams } from "@/packages/types"

export interface ServiceOptions {
  prisma: PrismaClient
  modelName: string
}

export class BaseService<T extends { id: string }> {
  protected prisma: PrismaClient
  protected modelName: string
  protected model: any

  constructor({ prisma, modelName }: ServiceOptions) {
    this.prisma = prisma
    this.modelName = modelName
    this.model = prisma[modelName as keyof PrismaClient]
  }

  async findById(id: string, options: { select?: any; include?: any } = {}): Promise<T | null> {
    try {
      return await this.model.findUnique({
        where: { id },
        ...options,
      })
    } catch (error) {
      const err = error as Error
      logger.error(`Error finding ${this.modelName} by ID: ${id}`, { error: err })
      throw new Error(`Failed to find ${this.modelName}: ${err.message}`)
    }
  }

  async findMany(
    options: {
      where?: any
      select?: any
      include?: any
      pagination?: PaginationParams
      sort?: SortParams
      filters?: FilterParams[]
    } = {},
  ): Promise<{ data: T[]; total: number }> {
    try {
      const { pagination, sort, filters, ...rest } = options
      const page = pagination?.page || 1
      const limit = pagination?.limit || 10
      const skip = (page - 1) * limit

      const whereClause = {
        ...options.where,
        ...buildWhereClause(filters),
      }

      const orderBy = buildOrderByClause(sort)

      const [data, total] = await Promise.all([
        this.model.findMany({
          where: whereClause,
          orderBy,
          skip,
          take: limit,
          ...rest,
        }),
        this.model.count({
          where: whereClause,
        }),
      ])

      return { data, total }
    } catch (error) {
      const err = error as Error
      logger.error(`Error finding ${this.modelName} records`, { error: err })
      throw new Error(`Failed to find ${this.modelName} records: ${err.message}`)
    }
  }

  async create(data: Omit<T, "id">, options: { select?: any; include?: any } = {}): Promise<T> {
    try {
      return await this.model.create({
        data,
        ...options,
      })
    } catch (error) {
      const err = error as Error
      logger.error(`Error creating ${this.modelName}`, { error: err })
      throw new Error(`Failed to create ${this.modelName}: ${err.message}`)
    }
  }

  async update(id: string, data: Partial<T>, options: { select?: any; include?: any } = {}): Promise<T> {
    try {
      return await this.model.update({
        where: { id },
        data,
        ...options,
      })
    } catch (error) {
      const err = error as Error
      logger.error(`Error updating ${this.modelName} with ID: ${id}`, { error: err })
      throw new Error(`Failed to update ${this.modelName}: ${err.message}`)
    }
  }

  async delete(id: string): Promise<T> {
    try {
      return await this.model.delete({
        where: { id },
      })
    } catch (error) {
      const err = error as Error
      logger.error(`Error deleting ${this.modelName} with ID: ${id}`, { error: err })
      throw new Error(`Failed to delete ${this.modelName}: ${err.message}`)
    }
  }

  async count(where: any = {}): Promise<number> {
    try {
      return await this.model.count({ where })
    } catch (error) {
      const err = error as Error
      logger.error(`Error counting ${this.modelName} records`, { error: err })
      throw new Error(`Failed to count ${this.modelName} records: ${err.message}`)
    }
  }
}