import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import {LogInFormSchema} from "@/lib/definitions";
import prisma from "@/lib/prisma";
import bcrypt from 'bcrypt'

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
      Credentials({
        async authorize(credentials){
          const parsedCredentials = LogInFormSchema.safeParse(credentials)
          if (parsedCredentials.success) {
            const {username, password} = parsedCredentials.data
            const user = await prisma.user.findUnique({
              where: {username}
            })
            if (!user) return null
            if (bcrypt.compareSync(password, user.password)) {
              return {
                ...user,
                id: user.id.toString(),
              };
            }
          }
          return null
        }
  })
  ],
  session: {
    strategy: "jwt",
    // How long until an idle session expires (in seconds)
    // 30 days = 30 * 24 * 60 * 60
    maxAge: 30 * 24 * 60 * 60,

    // How frequently to "update" the cookie to extend the session
    // This makes it a "sliding" session (resets the 30 days every time they visit)
    updateAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
        token.name = user.name
        token.username = user.username
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.username = token.username as string
        session.user.name = token.name as string
      }
      return session;
    },
  }
});