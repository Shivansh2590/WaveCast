import { useEffect, useState } from 'react'
import { Sparkles, TrendingUp, Play, ArrowRight, Star, Headphones as HeadphonesIcon, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'
import Navbar from '../components/navbar'
import CategoryCard from '../components/CategoryCard'
import PodcastCard from '../components/PodcastCard'
import Footer from './Footer'
import { categories } from '../data/podcasts'
import api, { getErrorMessage } from '../lib/api'
import studioBackground from '../assets/podcast-studio.png'

const Frontpage = () => {
  const [podcasts, setPodcasts] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    api.get('/podcasts', { signal: controller.signal })
      .then(({ data }) => setPodcasts(data.podcasts || []))
      .catch((err) => { if (err.name !== 'CanceledError') setError(getErrorMessage(err)) })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [])

  const featured = podcasts[0]
  return (
    <div className="min-h-screen bg-base-950"><Navbar />
      <section className="relative isolate overflow-hidden border-b border-white/5 bg-cover bg-center" style={{ backgroundImage: `linear-gradient(90deg, rgba(9,9,11,.96) 0%, rgba(9,9,11,.84) 45%, rgba(9,9,11,.48) 100%), url(${studioBackground})` }}>
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8"><span className="mb-6 inline-flex items-center gap-1.5 rounded-full bg-black/45 px-3 py-1.5 text-xs font-medium text-brand-light backdrop-blur"><Sparkles size={13} />{featured ? 'Latest on Wavecast' : 'Create. Publish. Listen.'}</span>
          <h1 className="max-w-2xl text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-6xl">{featured?.title || 'Your next favorite podcast starts here.'}</h1>
          <p className="mt-4 text-sm text-zinc-300">{featured ? `by ${featured.author}` : 'Discover fresh stories from independent creators.'}</p>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-zinc-300">{featured?.description || 'Explore every category, follow the voices you love, or publish your own show from the studio.'}</p>
          {featured && <div className="mt-6 flex flex-wrap items-center gap-5 text-sm text-zinc-200"><span className="flex items-center gap-1.5"><Star size={16} className="fill-brand text-brand" />{featured.rating || 'New'}</span><span className="flex items-center gap-1.5"><HeadphonesIcon size={16} />{featured.subscriberCount || 0} subscribers</span><span className="flex items-center gap-1.5"><Clock size={16} />New release</span></div>}
          <div className="mt-8 flex flex-wrap gap-3">{featured && <Link to={`/podcast/${featured._id}`} className="flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand-dark"><Play size={16} className="fill-white" />View & play</Link>}<Link to="/browse" className="flex items-center gap-2 rounded-full bg-base-800/90 px-6 py-3 text-sm font-semibold text-white hover:bg-base-700">Browse podcasts<ArrowRight size={16} /></Link></div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8"><div className="mb-6 flex items-center justify-between"><h2 className="text-xl font-bold text-white sm:text-2xl">Browse by Category</h2><Link to="/browse" className="flex items-center gap-1 text-sm font-medium text-brand hover:text-brand-light">See all<ArrowRight size={14} /></Link></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">{categories.map((cat) => <CategoryCard key={cat.id} {...cat} />)}</div></section>
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"><div className="mb-6 flex items-center gap-2"><TrendingUp size={20} className="text-brand" /><h2 className="text-xl font-bold text-white sm:text-2xl">Latest podcasts</h2></div>{error ? <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p> : loading ? <p className="text-sm text-zinc-500">Loading latest podcasts...</p> : podcasts.length ? <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">{podcasts.slice(0, 12).map((podcast) => <PodcastCard key={podcast._id} {...podcast} />)}</div> : <div className="rounded-2xl border border-white/5 bg-base-850 p-8 text-sm text-zinc-400">No podcasts have been published yet. <Link className="text-brand" to="/creator/register">Become a creator</Link> to publish the first one.</div>}</section>
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"><div className="rounded-2xl bg-gradient-to-br from-base-800 via-base-850 to-brand/10 px-6 py-16 text-center"><div className="mx-auto flex max-w-lg flex-col items-center"><span className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-brand/15 text-brand"><HeadphonesIcon size={22} /></span><h2 className="text-2xl font-bold text-white sm:text-3xl">Ready to share your voice?</h2><p className="mt-3 text-sm text-zinc-400">Create a channel, upload an episode, and connect with listeners.</p><Link to="/creator/register" className="mt-7 flex items-center gap-2 rounded-full bg-brand px-7 py-3 text-sm font-semibold text-white hover:bg-brand-dark">Start creating<ArrowRight size={16} /></Link></div></div></section><Footer />
    </div>
  )
}
export default Frontpage
