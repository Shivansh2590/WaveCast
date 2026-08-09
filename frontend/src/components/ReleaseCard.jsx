import { Star, Headphones } from 'lucide-react'
import { Link } from 'react-router-dom'

const ReleaseCard = ({ id, title, host, category, rating, listeners, gradient }) => {
  return (
    <Link to={`/podcast/${id}`} className="group block cursor-pointer">
      <div
        className={`relative mb-3 aspect-square w-full overflow-hidden rounded-2xl bg-gradient-to-br ${gradient}`}
      >
        <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
          {category}
        </span>
        <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
      </div>
      <h3 className="truncate text-sm font-semibold text-white">{title}</h3>
      <p className="truncate text-xs text-zinc-500">{host}</p>
      <div className="mt-1 flex items-center gap-3 text-xs text-zinc-400">
        <span className="flex items-center gap-1">
          <Star size={12} className="fill-brand text-brand" />
          {rating}
        </span>
        <span className="flex items-center gap-1">
          <Headphones size={12} />
          {listeners}
        </span>
      </div>
    </Link>
  )
}

export default ReleaseCard
