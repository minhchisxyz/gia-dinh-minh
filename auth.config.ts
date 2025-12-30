
import {NextAuthConfig} from "next-auth";

export const authConfig = {
  pages: {
    signIn: '/login'
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnHome = nextUrl.pathname === '/'
      if (isOnHome) {
        if (isLoggedIn) return true
        return false
      } else if (isLoggedIn) {
        if (nextUrl.pathname === '/login') return Response.redirect(new URL('/', nextUrl))
        return true
      }
    },
  },
  providers: [],
} satisfies NextAuthConfig
