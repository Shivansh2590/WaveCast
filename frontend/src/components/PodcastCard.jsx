import { Star, Headphones } from 'lucide-react'
import { Link } from 'react-router-dom'

const PodcastCard = ({ id, _id, title, host, author, category, rating, listeners, subscriberCount, gradient, coverImageUrl }) => {
  const podcastId = _id || id
  const creator = host || author || 'Wavecast creator'
  const audience = listeners || subscriberCount || 0
  return (
    <Link to={`/podcast/${podcastId}`} className="group block w-full shrink-0 cursor-pointer sm:w-auto">
      <div
        className={`relative mb-3 aspect-square w-full overflow-hidden rounded-2xl bg-gradient-to-br ${gradient}`}
        style={coverImageUrl ? { backgroundImage: `url(${coverImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
      >
        <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
          {category}
        </span>
        <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
      </div>
      <h3 className="truncate text-sm font-semibold text-white">{title}</h3>
      <p className="truncate text-xs text-zinc-500">{creator}</p>
      <div className="mt-1 flex items-center gap-3 text-xs text-zinc-400">
        <span className="flex items-center gap-1">
          <Star size={12} className="fill-brand text-brand" />
          {rating}
        </span>
        <span className="flex items-center gap-1">
          <Headphones size={12} />
          {audience}
        </span>
      </div>
    </Link>
  )
}

export default PodcastCard
