import { Link } from 'react-router-dom'

const CategoryCard = ({ name, shows, letter, color }) => {
  return (
    <Link
      to={`/browse/${encodeURIComponent(name)}`}
      className="group flex items-center gap-3 rounded-2xl border border-white/5 bg-base-850 p-4 transition-colors hover:bg-base-800 focus:outline-none focus:ring-2 focus:ring-brand"
      aria-label={`Browse ${name} podcasts`}
    >
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg font-bold text-white ${color}`}
      >
        {letter}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-white">{name}</p>
        <p className="text-xs text-zinc-500">{shows} shows</p>
      </div>
    </Link>
  )
}

export default CategoryCard
