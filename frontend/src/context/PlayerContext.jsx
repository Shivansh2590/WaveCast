import { createContext, useContext, useRef, useState, useCallback } from 'react'

const PlayerContext = createContext(null)

export const PlayerProvider = ({ children }) => {
  const audioRef = useRef(null)
  const [current, setCurrent] = useState(null) // { title, host, cover, src, queue: [], queueIndex }
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0) // seconds
  const [duration, setDuration] = useState(0) // seconds
  const [volume, setVolume] = useState(1)

  const playEpisode = useCallback((episode, queue = [], queueIndex = 0) => {
    setCurrent({ ...episode, queue, queueIndex })
    setIsPlaying(true)
    // audio element src change + play is handled by AudioPlayer's effect on `current`
  }, [])

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying((p) => !p)
  }, [isPlaying])

  const seek = useCallback((seconds) => {
    if (!audioRef.current) return
    audioRef.current.currentTime = seconds
    setProgress(seconds)
  }, [])

  const skip = useCallback(
    (direction) => {
      if (!current?.queue?.length) return
      const nextIndex = current.queueIndex + direction
      if (nextIndex < 0 || nextIndex >= current.queue.length) return
      playEpisode(current.queue[nextIndex], current.queue, nextIndex)
    },
    [current, playEpisode]
  )

  return (
    <PlayerContext.Provider
      value={{
        audioRef,
        current,
        isPlaying,
        progress,
        duration,
        volume,
        setProgress,
        setDuration,
        setVolume,
        setIsPlaying,
        playEpisode,
        togglePlay,
        seek,
        skip,
      }}
    >
      {children}
    </PlayerContext.Provider>
  )
}

export const usePlayer = () => {
  const ctx = useContext(PlayerContext)
  if (!ctx) throw new Error('usePlayer must be used within a PlayerProvider')
  return ctx
}
