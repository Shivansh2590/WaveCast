import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Plus, Radio, Star, Headphones as HeadphonesIcon, Trash2 } from 'lucide-react'
import Navbar from '../components/navbar'
import Footer from './Footer'
import { useAuth } from '../context/AuthContext'
import api, { getErrorMessage } from '../lib/api'

const YourPodcasts = () => {
  const { user, loading } = useAuth()
  const [podcasts, setPodcasts] = useState([])
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')

  const loadPodcasts = () => {
    setFetching(true)
    api
      .get('/podcasts/mine')
      .then(({ data }) => setPodcasts(data.podcasts || []))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setFetching(false))
  }

  useEffect(() => {
    if (user?.role === 'creator') loadPodcasts()
  }, [user])

  const handleDelete = async (id) => {
    if (!confirm('Delete this podcast and all of its episodes? This cannot be undone.')) return
    try {
      await api.delete(`/podcasts/${id}`)
      setPodcasts((prev) => prev.filter((p) => p._id !== id))
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  if (!loading && (!user || user.role !== 'creator')) {
    return <Navigate to="/creator/signin" replace />
  }

  return (
    <div className="min-h-screen bg-base-950">
      <Navbar />

      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-bold text-white sm:text-2xl">Your Podcasts</h1>
          <Link
            to="/studio/new"
            className="flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            <Plus size={16} />
            New Podcast
          </Link>
        </div>

        {error && (
          <p className="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>
        )}

        {fetching ? (
          <div className="rounded-2xl border border-white/5 bg-base-850 p-10 text-center text-sm text-zinc-500">
            Loading your podcasts...
          </div>
        ) : podcasts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-base-850 px-6 py-16 text-center">
            <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-base-800 text-zinc-500">
              <Radio size={22} />
            </span>
            <h2 className="text-lg font-bold text-white">No podcasts yet</h2>
            <p className="mt-1 max-w-xs text-sm text-zinc-500">
              Create your first podcast to start publishing episodes.
            </p>
            <Link
              to="/studio/new"
              className="mt-6 rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
            >
              Create Podcast
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {podcasts.map((p) => (
              <div key={p._id} className="group relative">
                <Link to={`/podcast/${p._id}`}>
                  <div
                    className="mb-3 aspect-square w-full overflow-hidden rounded-2xl bg-base-800 bg-cover bg-center"
                    style={
                      p.coverImageUrl
                        ? { backgroundImage: `url(${p.coverImageUrl})` }
                        : undefined
                    }
                  />
                  <h3 className="truncate text-sm font-semibold text-white">{p.title}</h3>
                  <div className="mt-1 flex items-center gap-3 text-xs text-zinc-400">
                    <span className="flex items-center gap-1">
                      <Star size={12} className="fill-brand text-brand" />
                      {p.rating || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <HeadphonesIcon size={12} />
                      {p.subscriberCount || 0}
                    </span>
                  </div>
                  <span className="mt-3 inline-flex text-xs font-semibold text-brand hover:text-brand-light">
                    Manage episodes
                  </span>
                </Link>
                <button
                  onClick={() => handleDelete(p._id)}
                  className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100"
                  aria-label="Delete podcast"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  )
}

export default YourPodcasts
