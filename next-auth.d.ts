// next-auth.d.ts
import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface User {
    // Add the extra fields you want on the user object
    id?: string
    role?: string
    username?: string
    name?: string
  }

  interface Session {
    user: {
      id: string
      role: string
      username: string
      name?: string
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
    username: string
    name?: string
  }
}