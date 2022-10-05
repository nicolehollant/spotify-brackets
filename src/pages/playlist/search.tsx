import { NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import React, { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { trpc } from '../../utils/trpc'
import debounce from 'lodash.debounce'
import Link from 'next/link'
import { Virtuoso } from 'react-virtuoso'

type IPlaylistResult = {
  name: string
  image: string
  owner: string
  description: string
  id: string
  numTracks: number
}[]

const SearchResults: React.FC<{
  items: IPlaylistResult
  loadMore: () => void
  setPlaying: (i: number) => void
  playing: number
  totalItemCount: number
}> = (props) => {
  return (
    <>
      <div className="w-full h-full flex-1 grid">
        <Virtuoso
          style={{ height: '100%' }}
          data={props.items}
          endReached={props.loadMore}
          components={{
            Footer: () => {
              if (!props.totalItemCount) {
                return <div></div>
              } else if (props.items.length === props.totalItemCount) {
                return (
                  <div className="p-12 text-center">
                    <p className="text-white/80">End of results</p>
                  </div>
                )
              }
              return (
                <div className="p-12 text-center">
                  <p className="text-white/80">Loading...</p>
                </div>
              )
            },
          }}
          itemContent={(index) => {
            return (
              <div className="p-2" key={'results-' + props.items[index].id}>
                <div className="bg-white flex items-center justify-center h-full w-full relative rounded">
                  <img
                    src={props.items[index].image}
                    className="absolute  w-full h-full object-cover filter blur-[6px] rounded saturate-50 brightness-75"
                  />
                  <div className="absolute w-full h-full inset-0 overflow-hidden">
                    <img
                      src={props.items[index].image}
                      className="absolute  w-full h-full object-cover filter blur-xl saturate-50 brightness-75"
                    />
                  </div>
                  <div className="grid gap-2 sm:ml-6 z-50 relative p-2">
                    <div className="flex gap-2 sm:gap-4 items-center shrink-0">
                      <Link href={`/playlist/${props.items[index].id}/bracket`}>
                        <a className="bg-black/40 text-white rounded-full shadow-lg backdrop-filter backdrop-blur-sm border-2 border-black/10 flex items-center gap-1 sm:gap-2 ">
                          <p className="text-xs font-semibold pl-1.5">Bracket</p>
                          <svg
                            className="w-6 h-6 sm:w-8 sm:h-8"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            ></path>
                          </svg>
                        </a>
                      </Link>
                    </div>
                    <div className="justify-center rounded-lg grid sm:gap-1 bg-black/40 backdrop-filter backdrop-blur-sm z-20 max-w-max">
                      <p className="text-xs sm:text-sm lg:text-base font-bold p-1 sm:px-2 h-full flex items-center">
                        {props.items[index].name}
                      </p>
                      <p className="text-xs sm:text-sm lg:text-base p-1 sm:px-2 h-full flex items-center text-white/90">
                        {props.items[index].owner}
                      </p>
                    </div>
                  </div>
                  <div className="p-2 sm:p-4 z-10 ml-auto shrink-0">
                    <div className="shadow-xl">
                      <img
                        src={props.items[index].image}
                        className="shadow-lg border-2 border-black/20 h-14 sm:h-20 lg:h-28 w-14 sm:w-20 lg:w-28"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )
          }}
        ></Virtuoso>
      </div>
    </>
  )
}

const Home: NextPage = () => {
  const { status, data: session } = useSession()
  const router = useRouter()
  const [playing, setPlaying] = useState(-1)
  const [searchTerm, setSearchTerm] = useState('')
  const search = trpc.useQuery(['auth.spotifyGetPlaylist', searchTerm])
  const [results, setResults] = useState<any[]>([])
  const [nextUri, setNextUri] = useState<string | null>(null)
  const continueSearch = trpc.useQuery(['auth.spotifyGetPlaylistNext', nextUri])

  const changeHandler = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
  }
  const debouncedChangeHandler = useMemo(() => debounce(changeHandler, 400), [])

  useEffect(() => {
    search.refetch().then(({ data }) => {
      if (data) {
        setResults(data.items)
        setNextUri(data.next)
      }
    })
  }, [searchTerm])

  useEffect(() => {
    if (session?.error === 'RefreshAccessTokenError') {
      signIn() // Force sign in to hopefully resolve error
    }
  }, [session])

  const loadMore = useCallback(() => {
    return setTimeout(() => {
      continueSearch.refetch().then(({ data }) => {
        if (data?.items?.length) {
          setResults((results) => [...results, ...data.items])
        }
        setNextUri(data?.next ?? null)
      })
    }, 200)
  }, [setResults])

  if (status === 'loading') {
    return (
      <div className="bg-slate-900 h-full w-full flex flex-col gap-8 text-white items-center justify-center text-lg">
        <div>loading...</div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    router.push('/auth/signin')
  }

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="bg-slate-900 h-full w-full flex flex-col text-white pt-6 px-6 sm:pt-[8vmin] sm:px-[12vmin]">
        <div className="grid gap-8 border-b-2 border-slate-700 shadow-xl pb-8">
          <h3 className="text-3xl lg:text-4xl font-medium">Spotify Brackets</h3>
          <label htmlFor="search" className="grid gap-2">
            <p className="font-medium">Search For A Playlist To Rank</p>
            <input
              name="search"
              type="text"
              placeholder='i.e. "This Is MyFavoriteBand"'
              className="bg-slate-700 p-2 text-lg rounded-md focus:outline-none focus:ring ring-sky-400"
              onChange={debouncedChangeHandler}
            />
          </label>
          {results && searchTerm && results.length === 0 && <p>No search results...</p>}
        </div>
        {searchTerm && (
          <SearchResults
            loadMore={loadMore}
            totalItemCount={search.data?.itemCount ?? -1}
            items={results ?? []}
            playing={playing}
            setPlaying={setPlaying}
          ></SearchResults>
        )}
      </div>
    </>
  )
}

export default Home
