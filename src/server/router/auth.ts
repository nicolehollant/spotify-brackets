import { TRPCError } from '@trpc/server'
import { createRouter } from './context'
import { getSession } from 'next-auth/react'
import { z } from 'zod'

const SPOTIFY_BASE = 'https://api.spotify.com/v1'
const spotifyFetch = async (path: string, accessToken: string) => {
  const data = await fetch(SPOTIFY_BASE + path, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
  const json = await data.json()
  return json
}
const spotifyPost = async (path: string, accessToken: string, payload: any, method = 'POST') => {
  const data = await fetch(SPOTIFY_BASE + path, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    method,
    body: JSON.stringify(payload),
  })
  const json = await data.json()
  return json
}

export const authRouter = createRouter()
  .query('getSession', {
    resolve({ ctx }) {
      return ctx.session
    },
  })
  .middleware(async ({ ctx, next }) => {
    // Any queries or mutations after this middleware will
    // raise an error unless there is a current session
    if (!ctx.session) {
      throw new TRPCError({ code: 'UNAUTHORIZED' })
    }
    return next()
  })
  .query('user', {
    async resolve({ ctx }) {
      const session = await getSession({ req: ctx.req })
      const user = await ctx.prisma.user.findFirst({
        where: {
          OR: [{ id: (session?.user as any)?.id }, { email: session?.user?.email }],
        },
        include: {
          accounts: true,
        },
      })
      if (!session || !user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'No active session',
        })
      }
      return user!
    },
  })
  .query('spotifySearch', {
    input: z.string(),
    output: z.array(
      z.object({
        albumArt: z.string(),
        albumArtTiny: z.string(),
        name: z.string(),
        artist: z.string(),
        preview: z.string(),
        uri: z.string(),
      })
    ),
    async resolve({ ctx, input }) {
      const session = await getSession({ req: ctx.req })
      const user = await ctx.prisma.user.findFirst({
        where: {
          OR: [{ id: (session?.user as any)?.id }, { email: session?.user?.email }],
        },
        include: {
          accounts: true,
        },
      })
      const accessToken = session?.accessToken
      if (!session || !user || !accessToken) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'No active session',
        })
      }
      const data = await spotifyFetch(`/search?q=${input}&type=track&limit=10`, accessToken + '')
      return (
        data?.tracks?.items.map((a: any) => {
          return {
            albumArt: a.album.images[0].url,
            albumArtTiny: a.album.images[a.album.images.length - 1].url,
            name: a.name,
            artist: a.artists.map((artist: any) => artist.name).join(', '),
            preview: a.preview_url,
            uri: a.uri,
          }
        }) ?? []
      )
    },
  })
  .query('spotifyGetSongsByPlaylistID', {
    input: z.string(),
    output: z.array(
      z.object({
        albumArt: z.string(),
        albumArtTiny: z.string(),
        name: z.string(),
        artist: z.string(),
        preview: z.string(),
        uri: z.string(),
        popularity: z.number().nullish(),
      })
    ),
    async resolve({ ctx, input }) {
      const session = await getSession({ req: ctx.req })
      const user = await ctx.prisma.user.findFirst({
        where: {
          OR: [{ id: (session?.user as any)?.id }, { email: session?.user?.email }],
        },
        include: {
          accounts: true,
        },
      })
      const accessToken = session?.accessToken
      if (!session || !user || !accessToken) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'No active session',
        })
      }
      const items = []
      let data = await spotifyFetch(`/playlists/${input}/tracks`, accessToken + '')
      items.push(...data?.items)
      while (data.next != null) {
        const nextUri = data.next.split('https://api.spotify.com/v1')[1]
        data = await spotifyFetch(nextUri, accessToken + '')
        items.push(...data?.items)
      }
      const res =
        items
          .map((a: any) => {
            return {
              albumArt: a.track.album.images[0].url ?? '',
              albumArtTiny: a.track.album.images[a.track.album.images.length - 1].url ?? '',
              name: a.track.name ?? '',
              artist: a.track.artists.map((artist: any) => artist.name).join(', ') ?? '',
              preview: a.track.preview_url ?? '',
              uri: a.track.uri ?? '',
              popularity: a.track.popularity ?? 30,
            }
          })
          .sort((a, b) => b.popularity - a.popularity) ?? []
      return res
    },
  })
  .query('spotifyGetPlaylist', {
    input: z.string().nullish(),
    output: z.object({
      next: z.string().nullable(),
      itemCount: z.number(),
      items: z.array(
        z.object({
          image: z.string(),
          name: z.string(),
          owner: z.string(),
          description: z.string(),
          id: z.string(),
          numTracks: z.number(),
        })
      ),
    }),
    async resolve({ ctx, input }) {
      const session = await getSession({ req: ctx.req })
      const user = await ctx.prisma.user.findFirst({
        where: {
          OR: [{ id: (session?.user as any)?.id }, { email: session?.user?.email }],
        },
        include: {
          accounts: true,
        },
      })
      const accessToken = session?.accessToken
      if (!session || !user || !accessToken) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'No active session',
        })
      }
      if (!input) {
        return {
          itemCount: 0,
          next: null,
          items: [],
        }
      }
      const data = await spotifyFetch(`/search?q=${input}&type=playlist&limit=20`, accessToken + '')
      return {
        itemCount: data?.playlists.total,
        next: data?.playlists.next,
        items:
          data?.playlists?.items.map((a: any) => {
            return {
              image: a.images[0].url,
              name: a.name,
              description: a.description ?? '(No description)',
              owner: a.owner.display_name,
              id: a.id,
              numTracks: a.tracks.total,
            }
          }) ?? [],
      }
    },
  })
  .query('spotifyGetPlaylistNext', {
    input: z.string().nullish(),
    output: z.object({
      next: z.string().nullish(),
      itemCount: z.number(),
      items: z.array(
        z.object({
          image: z.string(),
          name: z.string(),
          owner: z.string(),
          description: z.string(),
          id: z.string(),
          numTracks: z.number(),
        })
      ),
    }),
    async resolve({ ctx, input }) {
      const session = await getSession({ req: ctx.req })
      const user = await ctx.prisma.user.findFirst({
        where: {
          OR: [{ id: (session?.user as any)?.id }, { email: session?.user?.email }],
        },
        include: {
          accounts: true,
        },
      })
      const accessToken = session?.accessToken
      if (!session || !user || !accessToken) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'No active session',
        })
      }
      if (!input) {
        return {
          itemCount: 0,
          items: [],
          next: null,
        }
      }
      const nextUri = input.split('https://api.spotify.com/v1')[1]
      const data = await spotifyFetch(nextUri, accessToken + '')
      return {
        itemCount: data?.playlists.total,
        next: data?.playlists.next,
        items:
          data?.playlists?.items.map((a: any) => {
            return {
              image: a.images[0].url,
              name: a.name,
              description: a.description ?? '(No description)',
              owner: a.owner.display_name,
              id: a.id,
              numTracks: a.tracks.total,
            }
          }) ?? [],
      }
    },
  })
  .mutation('spotifySavePlaylistAs', {
    output: z.string(),
    input: z.object({
      name: z.string(),
      tracks: z.array(z.string()),
    }),
    async resolve({ ctx, input }) {
      const session = await getSession({ req: ctx.req })
      const user = await ctx.prisma.user.findFirst({
        where: {
          OR: [{ id: (session?.user as any)?.id }, { email: session?.user?.email }],
        },
        include: {
          accounts: true,
        },
      })
      const accessToken = session?.accessToken
      if (!session || !user || !accessToken) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'No active session',
        })
      }
      const userData = await spotifyFetch(`/me`, accessToken + '')
      const data = await spotifyPost(`/users/${userData.id}/playlists`, accessToken + '', {
        name: input.name,
        description: 'Exported Playlist from fleur.codes',
        public: true,
        collaborative: false,
      })
      const id = data.id
      await spotifyPost(`/playlists/${id}/tracks`, accessToken + '', {
        position: 0,
        uris: input.tracks,
      })
      return id
    },
  })
  .query('getSecretMessage', {
    async resolve({ ctx }) {
      return 'You are logged in and can see this secret message!'
    },
  })
