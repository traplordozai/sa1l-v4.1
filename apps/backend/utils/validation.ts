import { z } from "zod"

// Common validation schemas
export const idSchema = z.string().uuid()

export const emailSchema = z.string().email()

export const passwordSchema = z
  .string()
  .min(8)
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character")

export const dateSchema = z.string().datetime()

// User validation schemas
export const userCreateSchema = z.object({
  email: emailSchema,
  name: z.string().min(2).optional(),
  role: z.enum(["user", "admin", "faculty"]).default("user"),
  password: passwordSchema,
})

export const userUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  email: emailSchema.optional(),
  pushToken: z.string().optional(),
  notificationPreferences: z.record(z.boolean()).optional(),
})

// Document validation schemas
export const documentCreateSchema = z.object({
  title: z.string().min(1).max(255),
  content: z.string().min(1),
  expiresAt: dateSchema.optional(),
})

export const documentUpdateSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  content: z.string().min(1).optional(),
  status: z.enum(["active", "archived", "deleted"]).optional(),
  expiresAt: dateSchema.optional(),
})

// Submission validation schemas
export const submissionCreateSchema = z.object({
  content: z.string().min(1),
  status: z.enum(["draft", "submitted", "reviewed"]).default("draft"),
})

export const submissionUpdateSchema = z.object({
  content: z.string().min(1).optional(),
  status: z.enum(["draft", "submitted", "reviewed"]).optional(),
})

// Notification validation schemas
export const notificationCreateSchema = z.object({
  userId: idSchema,
  message: z.string().min(1),
  channel: z.enum(["email", "push", "in_app"]),
})

// Query validation schemas
export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
})

export const sortSchema = z.object({
  field: z.string(),
  direction: z.enum(["asc", "desc"]).default("asc"),
})

export const filterSchema = z.object({
  field: z.string(),
  operator: z.enum(["eq", "neq", "gt", "gte", "lt", "lte", "contains"]),
  value: z.union([z.string(), z.number(), z.boolean()]),
})

export const querySchema = z.object({
  pagination: paginationSchema.optional(),
  sort: sortSchema.optional(),
  filters: z.array(filterSchema).optional(),
})

// Validation middleware
export const validateInput = <T>(schema: z.ZodSchema<T>) => {
  return (input: unknown): T => {
    try {
      return schema.parse(input);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const issues = error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        }));
        throw new Error(`Validation failed: ${JSON.stringify(issues)}`);
      }
      throw error;
    }
  };
};

// Helper functions
export const validateId = validateInput(idSchema);
export const validateEmail = validateInput(emailSchema);
export const validatePassword = validateInput(passwordSchema);
export const validateDate = validateInput(dateSchema);

// Type exports
export type UserCreate = z.infer<typeof userCreateSchema>;
export type UserUpdate = z.infer<typeof userUpdateSchema>;
export type DocumentCreate = z.infer<typeof documentCreateSchema>;
export type DocumentUpdate = z.infer<typeof documentUpdateSchema>;
export type SubmissionCreate = z.infer<typeof submissionCreateSchema>;
export type SubmissionUpdate = z.infer<typeof submissionUpdateSchema>;
export type NotificationCreate = z.infer<typeof notificationCreateSchema>;
export type QueryParams = z.infer<typeof querySchema>;

