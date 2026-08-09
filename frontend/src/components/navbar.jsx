import { useState } from 'react'
import { Headphones, Search, Menu, X, Radio, LogOut } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const baseLinks = [
  { label: 'Home', to: '/' },
  { label: 'Browse', to: '/browse' },
  { label: 'Library', to: '/library' },
]

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [search, setSearch] = useState('')
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const isCreator = user?.role === 'creator'

  const handleSignOut = async () => {
    await logout()
    setMenuOpen(false)
    navigate('/')
  }

  const initial = (user?.channelName || user?.name || '?').charAt(0).toUpperCase()
  const submitSearch = (event) => {
    event.preventDefault()
    const value = search.trim()
    navigate(value ? `/browse?search=${encodeURIComponent(value)}` : '/browse')
    setMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-base-950/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white">
            <Headphones size={18} strokeWidth={2.5} />
          </span>
          <span className="text-lg font-bold tracking-tight text-white">
            Wave<span className="text-brand">cast</span>
          </span>
        </Link>

        {/* Search - desktop */}
        <form onSubmit={submitSearch} className="hidden max-w-md flex-1 md:block">
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-base-800/80 px-4 py-2 text-sm text-zinc-500">
            <Search size={16} />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search podcasts, hosts, topics..."
              className="w-full bg-transparent text-zinc-200 placeholder:text-zinc-500 focus:outline-none"
            />
          </div>
        </form>

        {/* Nav links - desktop */}
        <nav className="hidden items-center gap-1 lg:flex">
          {baseLinks.map((link) => {
            const active = location.pathname === link.to
            return (
              <Link
                key={link.label}
                to={link.to}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  active ? 'bg-base-800 text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            )
          })}
          {isCreator && (
            <Link
              to="/studio"
              className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                location.pathname.startsWith('/studio')
                  ? 'bg-base-800 text-brand-light'
                  : 'text-brand-light hover:text-brand'
              }`}
            >
              <Radio size={14} />
              Studio
            </Link>
          )}
        </nav>

        {/* Auth area - desktop */}
        <div className="hidden shrink-0 items-center gap-3 sm:flex">
          {user ? (
            <>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
                {initial}
              </span>
              <span className="max-w-[8rem] truncate text-sm font-medium text-zinc-300">
                {user.channelName || user.name}
              </span>
              <button
                onClick={handleSignOut}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-base-800 text-zinc-400 transition-colors hover:bg-base-700 hover:text-white"
                aria-label="Sign out"
                title="Sign out"
              >
                <LogOut size={15} />
              </button>
            </>
          ) : (
            <Link
              to="/signin"
              className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
            >
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="text-zinc-300 lg:hidden"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-white/5 bg-base-950 px-4 pb-4 pt-2 lg:hidden">
          <form onSubmit={submitSearch} className="mb-3 flex items-center gap-2 rounded-full border border-white/10 bg-base-800/80 px-4 py-2 text-sm text-zinc-500">
            <Search size={16} />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search podcasts, hosts, topics..."
              className="w-full bg-transparent text-zinc-200 placeholder:text-zinc-500 focus:outline-none"
            />
          </form>
          <nav className="flex flex-col gap-1">
            {baseLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-base-800 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
            {isCreator && (
              <Link
                to="/studio"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-brand-light hover:bg-base-800"
              >
                <Radio size={14} />
                Studio
              </Link>
            )}

            {user ? (
              <button
                onClick={handleSignOut}
                className="mt-2 flex items-center justify-center gap-2 rounded-full bg-base-800 py-3 text-center text-sm font-semibold text-zinc-300"
              >
                <LogOut size={14} />
                Sign Out ({user.channelName || user.name})
              </button>
            ) : (
              <Link
                to="/signin"
                onClick={() => setMenuOpen(false)}
                className="mt-2 rounded-full bg-brand px-5 py-2 text-center text-sm font-semibold text-white"
              >
                Sign In
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}

export default Navbar
