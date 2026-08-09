import { Headphones, MessageCircle, Camera, PlaySquare, Code2 } from 'lucide-react'
import { Link } from 'react-router-dom'

const columns = [
  {
    title: 'Explore',
    links: [
      { label: 'Home', to: '/' },
      { label: 'Browse', to: '/browse' },
      { label: 'Library', to: '/library' },
      { label: 'Categories', to: '/browse' },
      { label: 'Top Charts', to: '/browse' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', to: '#' },
      { label: 'Careers', to: '#' },
      { label: 'Press', to: '#' },
      { label: 'Blog', to: '#' },
      { label: 'Contact', to: '#' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Help Center', to: '#' },
      { label: 'For Podcasters', to: '#' },
      { label: 'Advertise', to: '#' },
      { label: 'Developers', to: '#' },
      { label: 'Partners', to: '#' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', to: '#' },
      { label: 'Terms of Service', to: '#' },
      { label: 'Cookie Policy', to: '#' },
      { label: 'Accessibility', to: '#' },
    ],
  },
]

const socials = [MessageCircle, Camera, PlaySquare, Code2]

const Footer = () => {
  return (
    <footer className="border-t border-white/5 bg-base-950">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:grid-cols-5">
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <Link to="/" className="mb-4 flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white">
                <Headphones size={18} strokeWidth={2.5} />
              </span>
              <span className="text-lg font-bold tracking-tight text-white">
                Wave<span className="text-brand">cast</span>
              </span>
            </Link>
            <p className="mb-5 max-w-xs text-sm text-zinc-500">
              Stream thousands of podcasts. Discover new voices. Never miss an episode.
            </p>
            <div className="flex items-center gap-3">
              {socials.map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-base-800 text-zinc-400 transition-colors hover:bg-base-700 hover:text-white"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="mb-4 text-sm font-semibold text-white">{col.title}</h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-zinc-500 transition-colors hover:text-zinc-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/5 pt-6 text-xs text-zinc-500 sm:flex-row">
          <p>© 2026 Wavecast. All rights reserved.</p>
          <p>Made with passion for audio storytelling.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
