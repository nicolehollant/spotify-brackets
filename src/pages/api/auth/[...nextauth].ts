import NextAuth, { Awaitable, type NextAuthOptions } from 'next-auth'
import SpotifyProvider from 'next-auth/providers/spotify'

// Prisma adapter for NextAuth, optional and can be removed
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '../../../server/db/client'

const expires = 60 * 60
const addSeconds = (date: Date, seconds: number) => {
  date.setSeconds(date.getSeconds() + seconds)
  return date
}

async function refreshAccessToken(token: any) {
  try {
    const url =
      `https://accounts.spotify.com/api/token?` +
      new URLSearchParams({
        client_id: process.env.SPOTIFY_CLIENT_ID ?? '',
        client_secret: process.env.SPOTIFY_CLIENT_SECRET ?? '',
        grant_type: 'refresh_token',
        refresh_token: token.refreshToken,
      }).toString()

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      method: 'POST',
    })

    const refreshedTokens = await response.json()

    if (!response.ok) {
      throw refreshedTokens
    }

    const accessTokenExpires = addSeconds(
      new Date(),
      (refreshedTokens.expires_at || refreshedTokens.expires_in) - 10
    ).toISOString()

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken, // Fall back to old refresh token
    }
  } catch (error) {
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    }
  }
}

export const authOptions: NextAuthOptions = {
  // Configure one or more authentication providers
  adapter: PrismaAdapter(prisma),
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID ?? '',
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET ?? '',
      authorization:
        'https://accounts.spotify.com/authorize?scope=playlist-read-private,playlist-read-collaborative,playlist-modify-private,playlist-modify-public',
      // scope: 'playlist-read-private playlist-read-collaborative playlist-modify-private playlist-modify-public',
    } as any),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        return {
          accessToken: account.access_token,
          // accessTokenExpires: Date.now() + (account as any).expires_at * 1000,
          accessTokenExpires: addSeconds(new Date(), expires - 10),
          refreshToken: account.refresh_token,
          user,
        }
      }

      // Return previous token if the access token has not expired yet
      // if (Date.now() < (token as any).accessTokenExpires) {
      //   return token
      // }
      if (new Date().toISOString() < (token as any).accessTokenExpires) {
        return token
      }

      // Access token has expired, try to update it
      return refreshAccessToken(token)
    },
    async session({ session, token }) {
      ;(session as any).user = token.user
      session.accessToken = token.accessToken
      session.error = token.error

      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
}

export default NextAuth(authOptions)
