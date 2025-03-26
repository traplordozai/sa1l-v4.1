import { describe, expect, it } from 'vitest'
import { userSchema } from '@/packages/api/src/schemas/userSchema'

describe('userSchema', () => {
  it('accepts valid input', () => {
    const result = userSchema.safeParse({ name: "Alice", email: "alice@example.com" })
    expect(result.success).toBe(true)
  })

  it('rejects invalid email', () => {
    const result = userSchema.safeParse({ name: "Bob", email: "not-an-email" })
    expect(result.success).toBe(false)
  })

  it('rejects short name', () => {
    const result = userSchema.safeParse({ name: "", email: "bob@example.com" })
    expect(result.success).toBe(false)
  })
})