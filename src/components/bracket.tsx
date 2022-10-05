import Head from 'next/head'
import { useBracket } from '../hooks/useBracket'
import { useEffect, useRef, useState } from 'react'
import type { IBracketEntry } from '../hooks/bracket'
import { AudioPlayer } from '../components/audio-player'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useScreenshot } from '../hooks/useScreenshot'
import { trpc } from '../utils/trpc'

const RoundResult: React.FC<{ pairs: IBracketEntry[][]; output: any[] }> = (props) => {
  return (
    <div className="flex flex-col gap-8 justify-around h-full">
      {props.pairs.map((pair: IBracketEntry[], i: number) => (
        <div className="flex flex-col gap-2" key={i}>
          <button
            className={
              ' flex items-center gap-2 py-1 px-2 rounded-md ' +
              (props.output.includes(pair[0]) ? 'bg-blue-600' : 'bg-gray-600')
            }
          >
            {pair[0]?.albumArtTiny && <img src={pair[0]?.albumArtTiny} alt="" className="w-10 h-10 rounded" />}
            {!pair[0]?.albumArtTiny && <div className="h-10 w-10 bg-slate-700 rounded"></div>}
            <div className="text-xs text-left grid">
              <p className="font-bold">{pair[0]?.name}</p>
              <p>{pair[0]?.artist}</p>
              {!pair[0]?.name && !pair[0]?.artist && <p className="text-neutral-400/90 font-bold">(bye)</p>}
            </div>
          </button>
          <button
            className={
              ' flex items-center gap-2 py-1 px-2 rounded-md ' +
              (props.output.includes(pair[1]) ? 'bg-blue-600' : 'bg-gray-600')
            }
          >
            {pair[1]?.albumArtTiny && <img src={pair[1]?.albumArtTiny} alt="" className="w-10 h-10 rounded" />}
            {!pair[1]?.albumArtTiny && <div className="h-10 w-10 bg-slate-700 rounded"></div>}
            <div className="text-xs text-left grid">
              <p className="font-bold">{pair[1]?.name}</p>
              <p>{pair[1]?.artist}</p>
              {!pair[1]?.name && !pair[1]?.artist && <p className="text-neutral-400/90 font-bold">(bye)</p>}
            </div>
          </button>
        </div>
      ))}
    </div>
  )
}

const FullBracket: React.FC<{ allRounds: any[][] }> = (props) => {
  const [name, setName] = useState(`Ranked Playlist - ${new Date().toLocaleDateString()}`)
  const spotifySavePlaylistAs = trpc.useMutation('auth.spotifySavePlaylistAs')
  const [playing, setPlaying] = useState(-1)
  const ref = useRef<HTMLElement>(null)
  const placementsRef = useRef<HTMLElement>(null)
  const [rounds, setRounds] = useState<any[][][]>([])
  const [placements, setPlacements] = useState<any[]>([])
  const { takeScreenShotAndSave } = useScreenshot({ quality: 1, type: 'PNG' })

  const exportPlaylist = async () => {
    const tracks = placements.map((a) => a?.uri)
    if (!tracks.length) {
      throw new Error('empty tracklist')
    }
    const id = await spotifySavePlaylistAs.mutateAsync({
      tracks,
      name,
    })
    window.open(`https://open.spotify.com/playlist/${id}`)
  }

  const updatePlacements = () => {
    const newPlacements: any[] = []
    for (const round of [...props.allRounds].reverse()) {
      newPlacements.push(
        ...round.filter((a) => !!a?.preview && !newPlacements.some((placement) => placement.preview === a.preview))
      )
    }
    setPlacements(newPlacements)
  }
  useEffect(() => {
    const _rounds = []
    for (let i = 0; i < props.allRounds.length; i++) {
      const currentRound = []
      if (props.allRounds[i].length === 1) {
        _rounds.push([props.allRounds[i][0]])
      } else {
        for (let j = 0; j < props.allRounds[i].length - 1; j += 2) {
          currentRound.push([props.allRounds[i][j], props.allRounds[i][j + 1]])
        }
      }
      _rounds.push(currentRound)
    }
    setRounds(_rounds)
    updatePlacements()
  }, [props.allRounds])
  return (
    <>
      <div className="p-8 bg-slate-900">
        <header className="flex items-end justify-between pb-8 gap-4">
          <label htmlFor="PlaylistName" className="grid gap-2 w-full max-w-md">
            <p className="font-medium">Playlist Name</p>
            <input
              name="PlaylistName"
              type="text"
              className="bg-slate-700 p-2 text-lg rounded-md focus:outline-none focus:ring ring-sky-400 w-full"
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <button
            data-html2canvas-ignore
            onClick={exportPlaylist}
            className="bg-blue-500/40 backdrop-filter text-lg font-bold backdrop-blur text-white p-2 rounded-md shadow-xl border-2 border-blue-400/50 shrink-0 h-max"
          >
            Export Playlist
          </button>
        </header>
      </div>
      <div className="p-8 overflow-auto bg-neutral-900" ref={placementsRef as any}>
        <header className="flex items-center justify-between pb-8">
          <h3 className="text-4xl font-medium">Placements</h3>
          <div className="flex items-center gap-4">
            <button
              data-html2canvas-ignore
              onClick={() => takeScreenShotAndSave(placementsRef.current!, new Date().valueOf().toString() + '.PNG')}
              className="bg-blue-500/40 backdrop-filter text-lg font-bold backdrop-blur text-white p-2 rounded-md shadow-xl border-2 border-blue-400/50"
            >
              Save Placements
            </button>
          </div>
        </header>
        <div>
          <div className="grid gap-2">
            {placements.map((track, i) => (
              <div
                key={'bracket-' + track.preview}
                className="bg-black/80 flex items-center justify-center h-full w-full relative rounded-md"
              >
                <img
                  data-html2canvas-ignore
                  src={track.albumArtTiny}
                  className="absolute  w-full h-full object-cover filter blur-[6px] rounded-md saturate-50 brightness-75"
                />
                <div className="absolute w-full h-full inset-0 overflow-hidden rounded-md" data-html2canvas-ignore>
                  <img
                    src={track.albumArtTiny}
                    className="absolute  w-full h-full object-cover filter blur-xl saturate-50 brightness-75"
                  />
                </div>
                <div className="flex items-center gap-2 z-50 relative p-1 sm:p-2">
                  <div className="flex gap-4 items-center" data-html2canvas-ignore>
                    <AudioPlayer
                      size="sm"
                      src={track.preview}
                      onPlay={() => setPlaying(i + 100)}
                      playing={playing === i + 100}
                    ></AudioPlayer>
                  </div>
                  <div className="justify-center rounded-lg flex gap-2 bg-black/40 backdrop-filter backdrop-blur-sm items-center z-20">
                    <div className="text-xs sm:text-sm flex flex-col items-start py-1 px-2">
                      <p className="font-medium">{track.name}</p>
                      <p className="text-white/90 text-[0.875em]">{track.artist}</p>
                    </div>
                  </div>
                </div>
                <div className="p-1 sm:p-2 z-10 ml-auto flex gap-2 sm:gap-4 items-center shrink-0">
                  <div className="shadow-xl">
                    <img
                      src={track.albumArt}
                      className="shadow-lg border-2 border-black/20 h-10 w-10 sm:h-14 sm:w-14"
                    />
                  </div>
                  <div className="rounded-full h-10 w-10 text-lg font-bold bg-black/40 relative">
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">{i + 1}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="p-8 overflow-auto bg-slate-900" ref={ref as any}>
        <header className="flex items-center justify-between pb-8">
          <h3 className="text-4xl font-medium">Bracket</h3>
          <button
            data-html2canvas-ignore
            onClick={() => takeScreenShotAndSave(ref.current!, new Date().valueOf().toString() + '.PNG')}
            className="bg-blue-500/40 backdrop-filter text-lg font-bold backdrop-blur text-white p-2 rounded-md shadow-xl border-2 border-blue-400/50"
          >
            Save Bracket
          </button>
        </header>
        <div className="flex gap-8 items-stretch w-max">
          {rounds.map((round, i) => (
            <div className="flex flex-col gap-8 justify-around" key={i}>
              {round.length === 1 && !Array.isArray(round[0]) ? (
                <div className="text-3xl bg-blue-200 rounded p-4 flex gap-2 relative overflow-hidden items-center">
                  {(round[0] as any)?.albumArtTiny && (
                    <img
                      data-html2canvas-ignore
                      src={(round[0] as any)?.albumArtTiny}
                      className="absolute  w-full h-full object-cover filter blur-xl"
                    />
                  )}
                  {(round[0] as any)?.albumArt && (
                    <img
                      src={(round[0] as any)?.albumArt}
                      alt=""
                      className="w-24 h-24 z-10 shadow-md border border-black/10 rounded"
                    />
                  )}
                  <div className="justify-center sm:left-auto rounded-lg flex gap-2 bg-black/40 backdrop-filter backdrop-blur-sm items-center z-20 p-2">
                    <p className="text-sm z-10">
                      <span className="font-bold">{(round[0] as any)?.name}</span> - {(round[0] as any)?.artist}
                    </p>
                  </div>
                </div>
              ) : (
                <RoundResult output={rounds[i + 1]?.flat()} pairs={round}></RoundResult>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

const Round: React.FC<{
  round: number
  matches: any[]
  labels: IBracketEntry[]
  onComplete: (output: any[]) => void
}> = (props) => {
  const [currentMatch, setCurrentMatch] = useState(0)
  const [output, setOutput] = useState<any[]>([])
  const [playing, setPlaying] = useState(-1)

  const pickRoundWinner = (i: 0 | 1) => {
    setPlaying(-1)
    const newCurrentMatch = currentMatch + 2
    const newOutput = [...output, props.matches[currentMatch + i]]
    setOutput(newOutput)
    setCurrentMatch(newCurrentMatch)
    if (newCurrentMatch > props.matches.length - 1) {
      props.onComplete(newOutput)
    }
  }

  const skipIfElligible = () => {
    if (
      !props.labels[props.matches[currentMatch] - 1]?.name &&
      props.labels[props.matches[currentMatch + 1] - 1]?.name
    ) {
      setTimeout(() => {
        pickRoundWinner(1)
      }, 200)
    } else if (
      !props.labels[props.matches[currentMatch + 1] - 1]?.name &&
      props.labels[props.matches[currentMatch] - 1]?.name
    ) {
      setTimeout(() => {
        pickRoundWinner(0)
      }, 200)
    }
  }

  useEffect(() => {
    skipIfElligible()
  }, [currentMatch])

  useEffect(() => {
    setOutput([])
    setCurrentMatch(0)
  }, [props.round, props.matches])

  return (
    <>
      <section className="h-full overflow-auto fixed inset-0 grid grid-rows-2">
        <div className="h-full">
          <div className="bg-white flex items-center justify-center h-full w-full relative">
            <img
              src={props.labels[props.matches[currentMatch] - 1]?.albumArtTiny}
              className="absolute  w-full h-full object-cover filter blur-xl"
            />
            <div className="p-8 h-full z-10 ml-auto relative">
              <img
                src={props.labels[props.matches[currentMatch] - 1]?.albumArt}
                className="h-full shadow-lg border border-black/10"
              />
            </div>
            <div className="absolute top-1/2 left-1/2 transform -translate-y-1/2  -translate-x-1/2 z-30">
              <AudioPlayer
                size="lg"
                src={props.labels[props.matches[currentMatch] - 1]?.preview}
                onPlay={() => setPlaying(0)}
                playing={playing === 0}
              ></AudioPlayer>
            </div>
            <div className="justify-center absolute bottom-12 left-4 right-4 sm:right-auto rounded-lg grid grid-cols-[1fr,auto] gap-2 bg-black/60 backdrop-filter backdrop-blur-sm items-center z-20">
              <div className="grid gap-1 lg:gap-2 p-2">
                <p className="font-bold">{props.labels[props.matches[currentMatch] - 1]?.name}</p>
                <p>{props.labels[props.matches[currentMatch] - 1]?.artist}</p>
              </div>
              <div className="border-l-2 border-black/50 flex items-center ml-auto bg-blue-600/30 py-2 rounded-r-lg text-white h-full">
                <button
                  onClick={() => pickRoundWinner(0)}
                  className=" font-bold px-2 lg:px-4 hover:underline uppercase text-3xl lg:text-4xl"
                  style={{ textShadow: '0 0 3px #ffffffa0' }}
                >
                  🏆
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="h-full">
          <div className="bg-blue-600/40 flex items-center justify-center h-full w-full relative">
            <img
              src={props.labels[props.matches[currentMatch + 1] - 1]?.albumArtTiny}
              className="absolute  w-full h-full object-cover filter blur-xl"
            />
            <div className="p-8 h-full z-10 mr-auto relative">
              <img
                src={props.labels[props.matches[currentMatch + 1] - 1]?.albumArt}
                className="h-full shadow-lg border border-black/10"
              />
            </div>
            <div className="absolute top-1/2 left-1/2 transform -translate-y-1/2  -translate-x-1/2 z-30">
              <AudioPlayer
                size="lg"
                src={props.labels[props.matches[currentMatch + 1] - 1]?.preview}
                onPlay={() => setPlaying(1)}
                playing={playing === 1}
              ></AudioPlayer>
            </div>
            <div className="justify-center absolute bottom-12 right-4 left-4 sm:left-auto rounded-lg grid grid-cols-[1fr,auto] gap-2 bg-black/60 backdrop-filter backdrop-blur-sm items-center z-20">
              <div className="grid gap-1 lg:gap-2 p-2">
                <p className="font-bold">{props.labels[props.matches[currentMatch + 1] - 1]?.name}</p>
                <p>{props.labels[props.matches[currentMatch + 1] - 1]?.artist}</p>
              </div>
              <div className="border-l-2 border-black/50 flex items-center ml-auto bg-blue-600/30 py-2 rounded-r-lg text-white h-full">
                <button
                  onClick={() => pickRoundWinner(1)}
                  className=" font-bold px-2 lg:px-4 hover:underline uppercase text-3xl lg:text-4xl"
                  style={{ textShadow: '0 0 3px #ffffffa0' }}
                >
                  🏆
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute top-1/2 w-full border-2 border-black"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 tracking wide text-2xl font-bold bg-slate-900/30 rounded backdrop-blur backdrop-filter border-4 border-black px-6 py-2">
          OR
        </div>
      </section>
      {((!props.labels[props.matches[currentMatch] - 1]?.name &&
        props.labels[props.matches[currentMatch + 1] - 1]?.name) ||
        (!props.labels[props.matches[currentMatch + 1] - 1]?.name &&
          props.labels[props.matches[currentMatch] - 1]?.name)) && (
        <>
          <div className="fixed bg-gradient-to-br from-black/95 via-slate-900/95 to-blue-900/95 backdrop-filter backdrop-blur-lg inset-0 z-40"></div>
          <div className="z-50 fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 tracking wide text-2xl font-bold bg-slate-700/30 rounded backdrop-blur backdrop-filter border-4 border-black px-6 py-2 grid place-items-center gap-2">
            <p className="animate-pulse text-center">Skipping Byes...</p>
            <p className="text-center text-xs text-white/80 w-56">
              If a bracket doesn&apos;t have enough entries, the most popular songs skip to a future round
            </p>
          </div>
        </>
      )}
    </>
  )
}

const Bracket: React.FC<{
  songs: {
    albumArt: string
    albumArtTiny: string
    name: string
    artist: string
    preview: string
  }[]
}> = (props) => {
  const { status, data: session } = useSession()
  const router = useRouter()
  const NUMBER_OF_PARTICIPANTS = props.songs.length
  const participants = Array.from({ length: NUMBER_OF_PARTICIPANTS }).map((_, i) => i + 1)
  const bracket = useBracket(participants)
  const [matches, setMatches] = useState(bracket.matches.flat())
  const [rounds, setRounds] = useState([matches.map((v) => (v ? props.songs[v - 1] : null))])
  const [currentRound, setCurrentRound] = useState(0)
  const [winner, setWinner] = useState<any>(null)

  const onCompleteRound = (roundOutput: any[]) => {
    setRounds((rounds) => [...rounds, roundOutput.map((v) => (v ? props.songs[v - 1] : null))])
    const nextRound = currentRound + 1
    if (currentRound < bracket.rounds - 1) {
      setMatches(roundOutput)
      setCurrentRound(nextRound)
    } else {
      setWinner(roundOutput[0])
    }
  }

  useEffect(() => {
    if (session?.error === 'RefreshAccessTokenError') {
      signIn() // Force sign in to hopefully resolve error
    }
  }, [session])

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

      <div className="bg-slate-900 h-full w-full flex flex-col gap-8 text-white">
        {/* active round */}
        {winner == null && (
          <Round labels={props.songs} matches={matches} round={currentRound} onComplete={onCompleteRound}></Round>
        )}
        {winner != null && (
          <>
            <div className="flex flex-col gap-2 bg-black">
              <FullBracket allRounds={rounds}></FullBracket>
            </div>
          </>
        )}
      </div>
    </>
  )
}

export default Bracket
