import { Link } from 'react-router-dom'

const EditorCard = ({ id, title, category, description, gradient }) => {
  return (
    <Link
      to={`/podcast/${id}`}
      className={`group relative block h-64 cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-6 transition-transform duration-300 hover:-translate-y-1 sm:h-72`}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <div className="relative flex h-full flex-col justify-end">
        <span className="mb-2 w-fit rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
          {category}
        </span>
        <h3 className="mb-1 text-xl font-bold text-white sm:text-2xl">{title}</h3>
        <p className="line-clamp-2 max-w-md text-sm text-zinc-300">{description}</p>
      </div>
    </Link>
  )
}

export default EditorCard
