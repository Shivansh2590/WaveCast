import { useEffect, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { useParams, useSearchParams } from 'react-router-dom'
import Navbar from '../components/navbar'
import CategoryCard from '../components/CategoryCard'
import PodcastCard from '../components/PodcastCard'
import Footer from './Footer'
import { categories } from '../data/podcasts'
import api, { getErrorMessage } from '../lib/api'

const Browse = () => {
  const { category: categoryParam } = useParams()
  const [searchParams] = useSearchParams()
  const routeCategory = categoryParam ? decodeURIComponent(categoryParam) : 'all'
  const [activeCategory, setActiveCategory] = useState(routeCategory)
  const [query, setQuery] = useState('')
  const [shows, setShows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => setActiveCategory(routeCategory), [routeCategory])
  useEffect(() => setQuery(searchParams.get('search') || ''), [searchParams])

  useEffect(() => {
    const controller = new AbortController()
    const loadPodcasts = async () => {
      setLoading(true)
      setError('')
      try {
        const params = {}
        if (activeCategory !== 'all') params.category = activeCategory
        if (query.trim()) params.search = query.trim()
        const { data } = await api.get('/podcasts', { params, signal: controller.signal })
        setShows(data.podcasts || [])
      } catch (err) {
        if (err.name !== 'CanceledError') setError(getErrorMessage(err))
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    const timeout = setTimeout(loadPodcasts, query ? 250 : 0)
    return () => {
      clearTimeout(timeout)
      controller.abort()
    }
  }, [activeCategory, query])

  const categoryCards = useMemo(
    () => categories.map((category) => ({ ...category, shows: activeCategory === category.name ? shows.length : category.shows })),
    [activeCategory, shows.length]
  )

  return (
    <div className="min-h-screen bg-base-950">
      <Navbar />
      <section className="border-b border-white/5">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            {activeCategory === 'all' ? 'Browse Podcasts' : `${activeCategory} Podcasts`}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-zinc-400">Discover shows published by the Wavecast community.</p>
          <div className="mt-6 flex max-w-md items-center gap-2 rounded-full border border-white/10 bg-base-800/80 px-4 py-2.5 text-sm text-zinc-500">
            <Search size={16} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} type="search" placeholder="Search podcasts or hosts..." className="w-full bg-transparent text-zinc-200 placeholder:text-zinc-500 focus:outline-none" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <h2 className="mb-4 text-lg font-bold text-white">Categories</h2>
        <div className="mb-8 flex flex-wrap gap-2">
          <button onClick={() => setActiveCategory('all')} className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${activeCategory === 'all' ? 'bg-brand text-white' : 'bg-base-800 text-zinc-400 hover:text-white'}`}>All</button>
          {categories.map((cat) => <button key={cat.id} onClick={() => setActiveCategory(cat.name)} className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${activeCategory === cat.name ? 'bg-brand text-white' : 'bg-base-800 text-zinc-400 hover:text-white'}`}>{cat.name}</button>)}
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {categoryCards.map((cat) => <CategoryCard key={cat.id} {...cat} />)}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h2 className="mb-6 text-lg font-bold text-white">{loading ? 'Loading podcasts...' : `${shows.length} ${shows.length === 1 ? 'show' : 'shows'} found`}</h2>
        {error ? <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p> : loading ? <p className="text-sm text-zinc-500">Loading the latest podcasts...</p> : shows.length > 0 ? <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">{shows.map((podcast) => <PodcastCard key={podcast._id} {...podcast} />)}</div> : <p className="text-sm text-zinc-500">No shows match your search. Try another category or search term.</p>}
      </section>
      <Footer />
    </div>
  )
}

export default Browse
