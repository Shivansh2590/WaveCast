import { useEffect } from 'react'
import { Play, Pause, SkipBack, SkipForward, Rewind, FastForward, Heart, ListMusic, Volume2 } from 'lucide-react'
import { usePlayer } from '../context/PlayerContext'

const formatTime = (secs) => {
  if (!secs || Number.isNaN(secs)) return '0:00'
  const m = Math.floor(secs / 60)
  const s = Math.floor(secs % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

const AudioPlayer = () => {
  const {
    audioRef,
    current,
    isPlaying,
    progress,
    duration,
    volume,
    setProgress,
    setDuration,
    setIsPlaying,
    setVolume,
    togglePlay,
    seek,
    skip,
  } = usePlayer()

  useEffect(() => {
    if (!current || !audioRef.current) return
    audioRef.current.src = current.src
    audioRef.current.play().catch(() => {})
  }, [current, audioRef])

  if (!current) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-base-900/95 backdrop-blur-md">
      <audio
        ref={audioRef}
        onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onEnded={() => setIsPlaying(false)}
      />
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:gap-6 sm:px-6 lg:px-8">
        {/* Track info */}
        <div className="flex min-w-0 items-center gap-3 sm:w-56">
          <div className={`h-11 w-11 shrink-0 rounded-lg bg-gradient-to-br ${current.gradient || 'from-slate-700 to-slate-900'}`} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{current.title}</p>
            <p className="truncate text-xs text-zinc-500">{current.host}</p>
          </div>
        </div>

        {/* Transport + seek */}
        <div className="flex flex-1 flex-col items-center gap-1.5">
          <div className="flex items-center gap-4">
            <button
              onClick={() => skip(-1)}
              className="text-zinc-400 transition-colors hover:text-white"
              aria-label="Previous episode"
            >
              <SkipBack size={16} />
            </button>
            <button
              onClick={() => seek(Math.max(0, progress - 15))}
              className="text-zinc-400 transition-colors hover:text-white"
              aria-label="Rewind 15 seconds"
            >
              <Rewind size={16} />
            </button>
            <button
              onClick={togglePlay}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black transition-transform hover:scale-105"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause size={16} className="fill-black" /> : <Play size={16} className="fill-black pl-0.5" />}
            </button>
            <button
              onClick={() => seek(Math.min(duration, progress + 15))}
              className="text-zinc-400 transition-colors hover:text-white"
              aria-label="Forward 15 seconds"
            >
              <FastForward size={16} />
            </button>
            <button
              onClick={() => skip(1)}
              className="text-zinc-400 transition-colors hover:text-white"
              aria-label="Next episode"
            >
              <SkipForward size={16} />
            </button>
          </div>

          <div className="flex w-full max-w-xl items-center gap-2 text-[11px] text-zinc-500">
            <span className="w-9 shrink-0 text-right">{formatTime(progress)}</span>
            <input
              type="range"
              min={0}
              max={duration || 0}
              value={progress}
              onChange={(e) => seek(Number(e.target.value))}
              className="h-1 w-full cursor-pointer appearance-none rounded-full bg-base-700 accent-brand"
            />
            <span className="w-9 shrink-0">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Secondary controls */}
        <div className="hidden shrink-0 items-center gap-4 text-zinc-400 sm:flex sm:w-40 sm:justify-end">
          <button className="transition-colors hover:text-white" aria-label="Like">
            <Heart size={16} />
          </button>
          <button className="transition-colors hover:text-white" aria-label="Queue">
            <ListMusic size={16} />
          </button>
          <div className="flex items-center gap-1.5">
            <Volume2 size={16} />
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => {
                const v = Number(e.target.value)
                setVolume(v)
                if (audioRef.current) audioRef.current.volume = v
              }}
              className="h-1 w-16 cursor-pointer appearance-none rounded-full bg-base-700 accent-brand"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default AudioPlayer
