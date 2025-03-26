import type { Prisma } from "@prisma/client"
import type { FilterParam, PaginationParams, SortParam } from "@/packages/types"

/**
 * Builds a Prisma where clause from filter parameters
 * @param filters Array of filter parameters
 * @returns Prisma where clause object
 */
export function buildWhereClause(filters?: FilterParam[]): Prisma.JsonObject {
  if (!filters || filters.length === 0) {
    return {}
  }

  const whereConditions: Prisma.JsonObject = {}

  filters.forEach((filter) => {
    const { field, operator, value } = filter

    switch (operator) {
      case "eq":
        whereConditions[field] = { equals: value }
        break
      case "neq":
        whereConditions[field] = { not: value }
        break
      case "gt":
        whereConditions[field] = { gt: value }
        break
      case "gte":
        whereConditions[field] = { gte: value }
        break
      case "lt":
        whereConditions[field] = { lt: value }
        break
      case "lte":
        whereConditions[field] = { lte: value }
        break
      case "contains":
        whereConditions[field] = { contains: value, mode: "insensitive" }
        break
      case "in":
        whereConditions[field] = { in: Array.isArray(value) ? value : [value] }
        break
      default:
        // Skip unknown operators
        break
    }
  })

  return whereConditions
}

/**
 * Builds a Prisma orderBy clause from sort parameters
 * @param sort Sort parameter
 * @returns Prisma orderBy clause
 */
export function buildOrderByClause(sort?: SortParam): Prisma.JsonObject {
  if (!sort) {
    return { createdAt: "desc" }
  }

  return { [sort.field]: sort.direction }
}

/**
 * Applies pagination parameters to a Prisma query
 * @param pagination Pagination parameters
 * @returns Object with skip and take properties for Prisma
 */
export function getPaginationParams(pagination?: PaginationParams): { skip: number; take: number } {
  const page = pagination?.page || 1
  const limit = pagination?.limit || 10

  return {
    skip: (page - 1) * limit,
    take: limit,
  }
}

/**
 * Creates a full-text search condition for Prisma
 * @param searchTerm The search term
 * @param fields Array of fields to search in
 * @returns Prisma OR condition for full-text search
 */
export function createSearchCondition(searchTerm: string, fields: string[]): Prisma.JsonObject {
  if (!searchTerm || !fields.length) {
    return {}
  }

  const searchConditions = fields.map((field) => ({
    [field]: {
      contains: searchTerm,
      mode: "insensitive",
    },
  }))

  return { OR: searchConditions }
}

/**
 * Combines multiple where conditions with AND logic
 * @param conditions Array of where conditions
 * @returns Combined where condition
 */
export function combineWhereConditions(conditions: Prisma.JsonObject[]): Prisma.JsonObject {
  const validConditions = conditions.filter((condition) => Object.keys(condition).length > 0)

  if (validConditions.length === 0) {
    return {}
  }

  if (validConditions.length === 1) {
    return validConditions[0]
  }

  return { AND: validConditions }
}