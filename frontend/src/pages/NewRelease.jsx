import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'
import Navbar from '../components/navbar'
import PodcastCard from '../components/PodcastCard'
import Footer from './Footer'
import api, { getErrorMessage } from '../lib/api'

const NewRelease = () => {
  const [podcasts, setPodcasts] = useState([])
  const [error, setError] = useState('')
  useEffect(() => {
    const controller = new AbortController()
    api.get('/podcasts', { signal: controller.signal }).then(({ data }) => setPodcasts(data.podcasts || [])).catch((err) => { if (err.name !== 'CanceledError') setError(getErrorMessage(err)) })
    return () => controller.abort()
  }, [])
  return <div className="min-h-screen bg-base-950"><Navbar /><section className="border-b border-white/5"><div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8"><span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-base-800 px-3 py-1.5 text-xs font-medium text-brand-light"><Sparkles size={13} />Fresh off the feed</span><h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">New Releases</h1><p className="mt-2 max-w-xl text-sm text-zinc-400">The most recently published shows on Wavecast.</p></div></section><section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">{error ? <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p> : podcasts.length ? <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">{podcasts.map((podcast) => <PodcastCard key={podcast._id} {...podcast} />)}</div> : <p className="text-sm text-zinc-500">No new releases yet.</p>}</section><Footer /></div>
}
export default NewRelease
