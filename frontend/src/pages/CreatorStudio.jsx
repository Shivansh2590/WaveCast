import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Radio, Mic, Upload, Headphones, Users, LogOut } from 'lucide-react'
import Navbar from '../components/navbar'
import Footer from './Footer'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'

const StatCard = ({ label, value, icon: Icon, iconColor }) => (
  <div className="text-center sm:text-left">
    <p className="mb-1.5 text-xs text-zinc-500">{label}</p>
    <p className="flex items-center justify-center gap-2 text-2xl font-bold text-white sm:justify-start">
      <Icon size={18} className={iconColor} />
      {value}
    </p>
  </div>
)

const CreatorStudio = () => {
  const { user, loading, logout } = useAuth()
  const [stats, setStats] = useState({ podcasts: 0, episodes: 0, subscribers: 0 })

  useEffect(() => {
    if (!user || user.role !== 'creator') return
    api
      .get('/podcasts/mine')
      .then(({ data }) => {
        const podcasts = data.podcasts || []
        const episodes = podcasts.reduce((sum, p) => sum + (p.episodeCount || 0), 0)
        const subscribers = podcasts.reduce((sum, p) => sum + (p.subscriberCount || 0), 0)
        setStats({ podcasts: podcasts.length, episodes, subscribers })
      })
      .catch(() => {})
  }, [user])

  if (!loading && (!user || user.role !== 'creator')) {
    return <Navigate to="/creator/signin" replace />
  }

  return (
    <div className="min-h-screen bg-base-950">
      <Navbar />

      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-white/5 bg-base-850 p-6 sm:p-8">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-teal-500 text-white">
                <Radio size={24} />
              </span>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-brand-light">
                  Creator Studio
                </p>
                <h1 className="text-xl font-bold text-white sm:text-2xl">
                  {user?.channelName || user?.name || 'Creator'}
                </h1>
                <p className="text-sm text-zinc-500">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 rounded-full bg-base-800 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-base-700 hover:text-white"
            >
              <LogOut size={14} />
              Sign Out
            </button>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-4 border-t border-white/5 pt-6">
            <StatCard label="Podcasts" value={stats.podcasts} icon={Radio} iconColor="text-brand" />
            <StatCard label="Episodes" value={stats.episodes} icon={Headphones} iconColor="text-brand" />
            <StatCard label="Subscribers" value={stats.subscribers} icon={Users} iconColor="text-brand" />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Link
            to="/studio/new?mode=record"
            className="group rounded-2xl border border-white/5 bg-base-850 p-6 transition-colors hover:bg-base-800"
          >
            <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand text-white">
              <Mic size={20} />
            </span>
            <h3 className="mb-1 text-base font-semibold text-white">Record Episode</h3>
            <p className="text-sm text-zinc-500">
              Use your microphone to record a new episode right from the browser.
            </p>
          </Link>

          <Link
            to="/studio/new?mode=upload"
            className="group rounded-2xl border border-white/5 bg-base-850 p-6 transition-colors hover:bg-base-800"
          >
            <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-600 text-white">
              <Upload size={20} />
            </span>
            <h3 className="mb-1 text-base font-semibold text-white">Upload Episode</h3>
            <p className="text-sm text-zinc-500">
              Upload a pre-recorded audio file (MP3, WAV, M4A up to 100MB).
            </p>
          </Link>
        </div>

        <div className="mt-6 flex justify-end">
          <Link
            to="/studio/podcasts"
            className="text-sm font-medium text-brand hover:text-brand-light"
          >
            View your podcasts →
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default CreatorStudio
