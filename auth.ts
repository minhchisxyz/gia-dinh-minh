import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import {LogInFormSchema} from "@/lib/definitions";
import prisma from "@/lib/prisma";
import bcrypt from 'bcrypt'
import Logger from "@/lib/logger";

const LOGGER = new Logger('AUTH')

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [Credentials({
    async authorize(credentials){
      const parsedCredentials = LogInFormSchema.safeParse(credentials)
      if (parsedCredentials.success) {
        const {username, password} = parsedCredentials.data
        const user = await prisma.user.findUnique({
          where: {username}
        })
        if (!user) return null
        if (bcrypt.compareSync(password, user.password)) {
          LOGGER.info(`User ${username} has logged in`)
          return {
            ...user,
            id: user.id.toString(),
          };
        }
      }
      return null
    }
  })],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.username = user.username
        token.name = user.name
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.username = token.username as string
        session.user.name = token.name as string | undefined
      }
      return session
    }
  }
})