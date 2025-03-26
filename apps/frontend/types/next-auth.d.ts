import "next-auth"

declare module "next-auth/jwt" {
  interface JWT {
    permissions?: string[]
  }
}

declare module "next-auth" {
  interface Session {
    user: {
      name?: string | null
      email?: string | null
      image?: string | null
      permissions?: string[]
    }
  }
}

