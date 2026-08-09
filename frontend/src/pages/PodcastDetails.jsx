import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Play, Plus, Check, Heart, Share2, Star, Headphones, Clock, ChevronDown } from 'lucide-react'
import Navbar from '../components/navbar'
import EpisodeRow from '../components/EpisodeRow'
import Footer from './Footer'
import { usePlayer } from '../context/PlayerContext'
import { useAuth } from '../context/AuthContext'
import api, { getErrorMessage } from '../lib/api'

const formatDuration = (seconds) => {
  if (!seconds) return '—'
  const minutes = Math.floor(seconds / 60)
  return minutes >= 60 ? `${Math.floor(minutes / 60)}h ${minutes % 60}m` : `${minutes}m`
}

const PodcastDetails = () => {
  const { id } = useParams()
  const [podcast, setPodcast] = useState(null)
  const [episodes, setEpisodes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const [subscribing, setSubscribing] = useState(false)
  const [liked, setLiked] = useState(false)
  const [deletingEpisodeId, setDeletingEpisodeId] = useState('')
  const [descExpanded, setDescExpanded] = useState(false)
  const { current, playEpisode } = usePlayer()
  const { user } = useAuth()

  useEffect(() => {
    const controller = new AbortController()
    const loadPodcast = async () => {
      setLoading(true)
      setError('')
      try {
        const { data } = await api.get(`/podcasts/${id}`, { signal: controller.signal })
        setPodcast(data.podcast)
        setEpisodes(data.episodes || [])
      } catch (err) {
        if (err.name !== 'CanceledError') setError(getErrorMessage(err))
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    loadPodcast()
    return () => controller.abort()
  }, [id])

  const queue = useMemo(() => episodes.map((episode) => ({ ...episode, host: podcast?.author, src: episode.audioUrl, gradient: 'from-brand/70 to-base-800' })), [episodes, podcast?.author])
  const play = (episode) => {
    const index = episodes.findIndex((item) => item._id === episode._id)
    if (queue[index]?.src) playEpisode(queue[index], queue, index)
  }
  const toggleSubscribe = async () => {
    setSubscribing(true)
    try {
      const { data } = await api.post(`/podcasts/${id}/subscribe`)
      setSubscribed(data.subscribed)
      setPodcast((currentPodcast) => ({ ...currentPodcast, subscriberCount: data.subscriberCount }))
    } catch (err) {
      setError(getErrorMessage(err))
    } finally { setSubscribing(false) }
  }
  const share = async () => {
    try { await navigator.clipboard.writeText(window.location.href) } catch { /* clipboard is optional */ }
  }
  const deleteEpisode = async (episode) => {
    if (!window.confirm(`Delete “${episode.title}”? This cannot be undone.`)) return
    setDeletingEpisodeId(episode._id)
    try {
      await api.delete(`/podcasts/${id}/episodes/${episode._id}`)
      setEpisodes((items) => items.filter((item) => item._id !== episode._id))
    } catch (err) { setError(getErrorMessage(err)) } finally { setDeletingEpisodeId('') }
  }

  if (loading) return <div className="min-h-screen bg-base-950"><Navbar /><p className="mx-auto max-w-7xl px-4 py-12 text-sm text-zinc-500">Loading podcast...</p></div>
  if (!podcast) return <div className="min-h-screen bg-base-950"><Navbar /><main className="mx-auto max-w-7xl px-4 py-12"><Link to="/browse" className="text-brand">Back to browse</Link><p className="mt-4 text-red-400">{error || 'Podcast not found.'}</p></main></div>
  const isOwner = user?.role === 'creator' && String(podcast.creator?._id || podcast.creator) === String(user.id)

  return (
    <div className="min-h-screen bg-base-950 pb-24"><Navbar />
      <section className="border-b border-white/5"><div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link to={`/browse/${encodeURIComponent(podcast.category)}`} className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"><ArrowLeft size={16} />Back to {podcast.category}</Link>
        {error && <p className="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>}
        <div className="flex flex-col gap-6 sm:flex-row">
          <div className="h-40 w-40 shrink-0 rounded-2xl bg-gradient-to-br from-brand to-base-800 bg-cover bg-center sm:h-44 sm:w-44" style={podcast.coverImageUrl ? { backgroundImage: `url(${podcast.coverImageUrl})` } : undefined} />
          <div className="min-w-0 flex-1"><span className="text-xs font-bold uppercase tracking-wide text-brand">{podcast.category}</span><h1 className="mt-1 text-3xl font-extrabold text-white sm:text-4xl">{podcast.title}</h1><p className="mt-1 text-sm text-zinc-400">by {podcast.author}</p>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-zinc-300"><span className="flex items-center gap-1.5"><Star size={15} className="fill-brand text-brand" />{podcast.rating || 'New'}</span><span className="flex items-center gap-1.5"><Headphones size={15} />{podcast.subscriberCount || 0} subscribers</span><span className="flex items-center gap-1.5"><Clock size={15} />{episodes.length} episodes</span></div>
            <p className={`mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400 ${descExpanded ? '' : 'line-clamp-2'}`}>{podcast.description}</p><button onClick={() => setDescExpanded((value) => !value)} className="mt-1 flex items-center gap-1 text-xs font-medium text-brand">{descExpanded ? 'Show less' : 'Show more'}<ChevronDown size={14} className={descExpanded ? 'rotate-180' : ''} /></button>
            <div className="mt-5 flex flex-wrap items-center gap-3"><button disabled={!queue[0]?.src} onClick={() => play(episodes[0])} className="flex items-center gap-2 rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50"><Play size={15} className="fill-white" />Play</button><button disabled={subscribing} onClick={toggleSubscribe} className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold ${subscribed ? 'bg-base-800 text-brand-light' : 'bg-white text-black'}`}>{subscribed ? <Check size={15} /> : <Plus size={15} />}{subscribed ? 'Subscribed' : 'Subscribe'}</button><button onClick={() => setLiked((value) => !value)} className={`flex h-10 w-10 items-center justify-center rounded-full bg-base-800 ${liked ? 'text-brand' : 'text-zinc-400'}`} aria-label={liked ? 'Unlike podcast' : 'Like podcast'}><Heart size={16} className={liked ? 'fill-brand' : ''} /></button><button onClick={share} className="flex h-10 w-10 items-center justify-center rounded-full bg-base-800 text-zinc-400" aria-label="Copy podcast link"><Share2 size={16} /></button></div>
            <div className="mt-5 flex flex-wrap gap-2">{(podcast.tags || []).map((tag) => <span key={tag} className="rounded-full bg-base-800 px-3 py-1 text-xs text-zinc-400">#{tag.replace(/^#/, '')}</span>)}</div>
          </div></div></div></section>
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"><div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-bold text-white sm:text-xl">All Episodes</h2><div className="flex items-center gap-3">{isOwner && <Link to={`/studio/podcasts/${id}/episodes/new`} className="rounded-full bg-brand px-4 py-2 text-xs font-semibold text-white hover:bg-brand-dark">Add episode</Link>}<span className="text-xs text-zinc-500">{episodes.length} episodes</span></div></div><div className="overflow-hidden rounded-2xl border border-white/5 bg-base-850">{episodes.length ? episodes.map((episode) => <EpisodeRow key={episode._id} episode={{ ...episode, date: new Date(episode.createdAt).toLocaleDateString(), duration: formatDuration(episode.durationSeconds), gradient: 'from-brand/70 to-base-800' }} active={current?._id === episode._id} onPlay={() => play(episode)} onDelete={isOwner ? deleteEpisode : undefined} deleting={deletingEpisodeId === episode._id} />) : <p className="p-6 text-sm text-zinc-500">No episodes published yet.</p>}</div></section><Footer />
    </div>
  )
}

export default PodcastDetails
