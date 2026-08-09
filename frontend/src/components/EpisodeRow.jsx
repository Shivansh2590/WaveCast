import { Share2, Trash2 } from 'lucide-react'

const EpisodeRow = ({ episode, active, onPlay, onDelete, deleting }) => {
  const shareEpisode = async (event) => {
    event.stopPropagation()
    try {
      await navigator.clipboard.writeText(window.location.href)
    } catch {
      // Copying is unavailable in some non-secure browser contexts.
    }
  }
  return (
    <div
      onClick={() => onPlay(episode)}
      className={`group flex cursor-pointer items-start gap-4 border-b border-white/5 px-4 py-4 transition-colors last:border-b-0 hover:bg-base-800 sm:px-5 ${
        active ? 'bg-base-800' : ''
      }`}
    >
      <div className={`h-12 w-12 shrink-0 rounded-lg bg-gradient-to-br ${episode.gradient}`} />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
          <span className="font-semibold text-brand">E{episode.episodeNumber}</span>
          <span>·</span>
          <span>{episode.date}</span>
        </div>
        <h3
          className={`mt-0.5 truncate text-sm font-semibold ${
            active ? 'text-brand' : 'text-white'
          }`}
        >
          {episode.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-xs text-zinc-500">{episode.description}</p>
      </div>

      <div className="flex shrink-0 items-center gap-3 pt-1 text-xs text-zinc-500">
        <span className="hidden sm:inline">{episode.duration}</span>
        <button
          onClick={shareEpisode}
          className="text-zinc-500 transition-colors hover:text-white"
          aria-label="Share episode"
        >
          <Share2 size={14} />
        </button>
        {onDelete && (
          <button
            onClick={(event) => {
              event.stopPropagation()
              onDelete(episode)
            }}
            disabled={deleting}
            className="text-zinc-500 transition-colors hover:text-red-400 disabled:opacity-50"
            aria-label={`Delete ${episode.title}`}
            title="Delete episode"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  )
}

export default EpisodeRow
