import { NextPage } from 'next'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import Bracket from '../../../components/bracket'
import { trpc } from '../../../utils/trpc'

const Home: NextPage = () => {
  const { status, data: session } = useSession()
  useEffect(() => {
    if (session?.error === 'RefreshAccessTokenError') {
      signIn() // Force sign in to hopefully resolve error
    }
  }, [session])
  const router = useRouter()
  const { id } = router.query
  const songs = trpc.useQuery(['auth.spotifyGetSongsByPlaylistID', (Array.isArray(id) ? id[0] : id ?? '') as string])

  if (status === 'loading') {
    return (
      <div className="bg-slate-900 h-full w-full flex flex-col gap-8 text-white items-center justify-center text-lg">
        <div>loading...</div>
      </div>
    )
  }

  if (status === 'unauthenticated' || songs.isError) {
    router.push('/auth/signin')
  }

  if (!songs.data) {
    return (
      <div className="bg-slate-900 h-full w-full flex flex-col gap-8 text-white items-center justify-center text-lg">
        <div>loading...</div>
      </div>
    )
  }

  return (
    <>
      <Bracket songs={songs.data}></Bracket>
    </>
  )
}
export default Home
