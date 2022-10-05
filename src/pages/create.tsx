import { NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import React, { ChangeEvent, useEffect, useMemo, useState } from 'react'
import { AudioPlayer } from '../components/audio-player'
import { useAutoAnimate } from '@formkit/auto-animate/react'

import type { IBracketEntry } from '../hooks/bracket'
import { useSession, signIn } from 'next-auth/react'
import { trpc } from '../utils/trpc'
import debounce from 'lodash.debounce'

const IconButton: React.FC<{
  icon: 'plus' | 'minus'
  onClick: React.MouseEventHandler
  className?: string
  size?: 'base' | 'sm'
}> = (props) => {
  return (
    <button
      onClick={props.onClick}
      className={
        (props.className?.includes('bg-') ? '' : 'bg-black/40') +
        ' text-white rounded-full shadow-lg backdrop-filter backdrop-blur-sm border-2 border-black/10 flex items-center gap-1 sm:gap-2 ' +
        props.className
      }
    >
      {props.icon === 'plus' && <p className="text-xs font-semibold pl-1.5">Add</p>}
      <svg
        className={props.size === 'sm' ? 'w-6 h-6 sm:w-8 sm:h-8' : 'w-12 h-12'}
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        {props.icon === 'minus' && (
          <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"></path>
        )}
        {props.icon === 'plus' && (
          <path
            fillRule="evenodd"
            d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
            clipRule="evenodd"
          ></path>
        )}
      </svg>
    </button>
  )
}

const Bracket: React.FC<{
  items: (IBracketEntry & { uri: string })[]
  setPlaying: (i: number) => void
  playing: number
  setBracket: any
}> = (props) => {
  const [parent] = useAutoAnimate()
  return (
    <>
      <div className="grid gap-2 lg:grid-cols-2" ref={parent as any}>
        {props.items.map((track, i) => (
          <div
            key={'bracket-' + track.uri}
            className="bg-white flex items-center justify-center h-full w-full relative rounded"
          >
            <img
              src={track.albumArtTiny}
              className="absolute  w-full h-full object-cover filter blur-[6px] rounded saturate-50 brightness-75"
            />
            <div className="absolute w-full h-full inset-0 overflow-hidden">
              <img
                src={track.albumArtTiny}
                className="absolute  w-full h-full object-cover filter blur-xl saturate-50 brightness-75"
              />
            </div>
            <div className="flex items-center gap-2 z-50 relative p-1 sm:p-2">
              <div className="flex gap-4 items-center">
                <AudioPlayer
                  size="sm"
                  src={track.preview}
                  onPlay={() => props.setPlaying(i + 100)}
                  playing={props.playing === i + 100}
                ></AudioPlayer>
              </div>
              <div className="justify-center rounded-lg flex gap-2 bg-black/40 backdrop-filter backdrop-blur-sm items-center z-20">
                <div className="text-xs sm:text-sm grid gap-1 items-center py-1 px-2">
                  <p className="font-medium line-clamp-1">{track.name}</p>
                  <p className="text-white/90 text-[0.875em] line-clamp-1">{track.artist}</p>
                </div>
              </div>
            </div>
            <div className="p-1 sm:p-2 z-10 ml-auto flex gap-2 sm:gap-4 items-center shrink-0">
              <div className="shadow-xl">
                <img src={track.albumArt} className="shadow-lg border-2 border-black/20 h-10 w-10 sm:h-14 sm:w-14" />
              </div>
              <IconButton
                className="bg-red-700/40 hover:bg-red-700/60 transition duration-200"
                icon="minus"
                onClick={() => {
                  props.setBracket((bracket: (IBracketEntry & { uri: string })[]) =>
                    bracket.filter((curr) => curr.uri !== track.uri)
                  )
                  props.setPlaying(-1)
                }}
                size="sm"
              ></IconButton>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

const SearchResults: React.FC<{
  items: (IBracketEntry & { uri: string })[]
  setPlaying: (i: number) => void
  setBracket: any
  playing: number
}> = (props) => {
  const [parent] = useAutoAnimate()
  return (
    <>
      <div className="grid gap-4" ref={parent as any}>
        {props.items.map((track, i) => (
          <div
            key={'results-' + track.uri}
            className="bg-white flex items-center justify-center h-full w-full relative rounded"
          >
            <img
              src={track.albumArtTiny}
              className="absolute  w-full h-full object-cover filter blur-[6px] rounded saturate-50 brightness-75"
            />
            <div className="absolute w-full h-full inset-0 overflow-hidden">
              <img
                src={track.albumArtTiny}
                className="absolute  w-full h-full object-cover filter blur-xl saturate-50 brightness-75"
              />
            </div>
            <div className="grid gap-2 sm:ml-6 z-50 relative p-2">
              <div className="flex gap-2 sm:gap-4 items-center shrink-0">
                <AudioPlayer
                  src={track.preview}
                  onPlay={() => props.setPlaying(i)}
                  playing={props.playing === i}
                ></AudioPlayer>
                <IconButton
                  className="bg-blue-700/40 hover:bg-blue-700/60 transition duration-200"
                  icon="plus"
                  onClick={() => {
                    props.setBracket((bracket: any) => [...bracket, track])
                    props.setPlaying(-1)
                  }}
                  size="sm"
                ></IconButton>
              </div>
              <div className="justify-center rounded-lg flex items-center bg-black/40 backdrop-filter backdrop-blur-sm z-20 max-w-max">
                <p className="text-xs sm:text-sm lg:text-base font-bold p-1 sm:p-2 bg-blue-900/10">{track.name}</p>
                <p className="text-xs sm:text-sm lg:text-base p-1 sm:p-2 bg-black/30 rounded-r-lg">{track.artist}</p>
              </div>
            </div>
            <div className="p-2 sm:p-4 z-10 ml-auto shrink-0">
              <div className="shadow-xl">
                <img
                  src={track.albumArt}
                  className="shadow-lg border-2 border-black/20 h-14 sm:h-20 lg:h-28 w-14 sm:w-20 lg:w-28"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

const Home: NextPage = () => {
  const { status, data: session } = useSession()
  const router = useRouter()
  const [playing, setPlaying] = useState(-1)
  const [bracket, setBracket] = useState<(IBracketEntry & { uri: string })[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const search = trpc.useQuery(['auth.spotifySearch', searchTerm])

  const changeHandler = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
  }
  const debouncedChangeHandler = useMemo(() => debounce(changeHandler, 400), [])

  useEffect(() => {
    search.refetch()
  }, [searchTerm])

  useEffect(() => {
    if (session?.error === 'RefreshAccessTokenError') {
      signIn() // Force sign in to hopefully resolve error
    }
  }, [session])

  if (status === 'loading') {
    return <div>loading...</div>
  }

  if (status === 'unauthenticated') {
    router.push('/auth/signin')
  }

  return (
    <>
      <Head>
        <title>Spotify Brackets</title>
        <meta name="description" content="Brackets for spotify playlists" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {/* maybe seed by popularity?? */}
      <div className="bg-slate-900 min-h-screen w-full flex flex-col gap-8 text-white p-6 sm:p-[12vmin]">
        <label htmlFor="search" className="grid gap-2">
          <p className="font-medium">Search</p>
          <input
            name="search"
            type="text"
            className="bg-slate-700 p-2 text-lg rounded-md focus:outline-none focus:ring ring-sky-400"
            onChange={debouncedChangeHandler}
          />
        </label>
        {search.data && searchTerm && <h3 className="text-3xl font-medium">Search Results</h3>}
        {search.data &&
          searchTerm &&
          search.data?.filter((track) => !bracket.some((bracketEntry) => bracketEntry.uri === track.uri)).length ===
            0 && <p>No search results...</p>}
        {searchTerm && (
          <SearchResults
            items={
              search.data?.filter((track) => !bracket.some((bracketEntry) => bracketEntry.uri === track.uri)) ?? []
            }
            playing={playing}
            setBracket={setBracket}
            setPlaying={setPlaying}
          ></SearchResults>
        )}
        <h3 className="text-3xl font-medium">Bracket Entries</h3>
        {bracket.length === 0 && <p>No bracket entries yet...</p>}
        <Bracket items={bracket} playing={playing} setPlaying={setPlaying} setBracket={setBracket}></Bracket>
      </div>
    </>
  )
}

export default Home
