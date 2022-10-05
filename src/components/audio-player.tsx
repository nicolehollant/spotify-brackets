import { useEffect, useRef, useState } from 'react'

export const AudioPlayer: React.FC<{
  src: string
  onPlay: () => void
  playing: boolean
  size?: 'base' | 'sm' | 'lg'
}> = (props) => {
  const audioRef = useRef(null)
  const [playing, setPlaying] = useState(false)

  const play = () => {
    ;(audioRef.current as any)?.play()
    props.onPlay()
  }
  const pause = () => {
    ;(audioRef.current as any)?.pause()
  }

  useEffect(() => {
    if (props.playing) {
      setPlaying(true)
      play()
    } else {
      setPlaying(false)
      pause()
    }
    return () => {
      ;(audioRef?.current as any)?.pause()
      if (audioRef.current) {
        ;(audioRef.current as any).currentTime = 0
      }
    }
  }, [props.playing, props.src])

  if (!props.src) {
    return <div></div>
  }

  return (
    <div className="flex">
      <audio
        ref={audioRef}
        src={props.src}
        onPlay={() => setPlaying(true)}
        onEnded={() => setPlaying(false)}
        onPause={() => setPlaying(false)}
      ></audio>
      {!playing && (
        <button
          onClick={play}
          className={
            (playing ? 'bg-blue-700/50 ' : 'bg-black/40 ') +
            'text-white rounded-full shadow-lg backdrop-filter backdrop-blur-sm border-2 border-black/10'
          }
        >
          <svg
            className={
              props.size === 'lg'
                ? 'w-12 h-12 lg:w-16 lg:h-16'
                : props.size === 'sm'
                ? 'w-8 h-8'
                : 'w-8 h-8 sm:w-12 sm:h-12'
            }
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
              clipRule="evenodd"
            ></path>
          </svg>
        </button>
      )}
      {playing && (
        <button
          onClick={pause}
          className={
            (playing ? 'bg-blue-700/50 ' : 'bg-black/40 ') +
            'text-white rounded-full shadow-lg backdrop-filter backdrop-blur-sm border-2 border-black/10'
          }
        >
          <svg
            className={
              props.size === 'lg'
                ? 'w-12 h-12 lg:w-16 lg:h-16'
                : props.size === 'sm'
                ? 'w-8 h-8'
                : 'w-8 h-8 sm:w-12 sm:h-12'
            }
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
              clipRule="evenodd"
            ></path>
          </svg>
        </button>
      )}
    </div>
  )
}
