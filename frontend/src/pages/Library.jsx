import { Library as LibraryIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import Navbar from '../components/navbar'
import Footer from './Footer'

const Library = () => {
  return (
    <div className="flex min-h-screen flex-col bg-base-950">
      <Navbar />
      <section className="mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center px-4 py-24 text-center sm:px-6 lg:px-8">
        <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-base-800 text-brand">
          <LibraryIcon size={24} />
        </span>
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Your library is empty</h1>
        <p className="mt-2 max-w-sm text-sm text-zinc-500">
          Subscribe to shows you love and they will show up here for easy access.
        </p>
        <Link
          to="/browse"
          className="mt-7 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          Browse Podcasts
        </Link>
      </section>
      <Footer />
    </div>
  )
}

export default Library
