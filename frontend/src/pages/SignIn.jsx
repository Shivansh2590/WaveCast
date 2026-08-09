import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Headphones, Mail, Lock, Sparkles } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage } from '../lib/api'

const SignIn = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login(form)
      navigate('/')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-base-950 px-4 py-10">
      <Link
        to="/"
        className="mb-8 flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-white"
      >
        <ArrowLeft size={16} />
        Back to home
      </Link>

      <div className="mx-auto w-full max-w-md flex-1">
        <div className="rounded-2xl border border-white/5 bg-base-850 p-8">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand text-white">
              <Headphones size={20} strokeWidth={2.5} />
            </span>
            <div>
              <h1 className="text-lg font-bold text-white">Welcome back</h1>
              <p className="text-sm text-zinc-500">Listener access to Wavecast</p>
            </div>
          </div>

          {error && (
            <p className="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">Email</label>
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-base-800 px-4 py-3 text-sm">
                <Mail size={16} className="text-zinc-500" />
                <input
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="w-full bg-transparent text-zinc-200 placeholder:text-zinc-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">Password</label>
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-base-800 px-4 py-3 text-sm">
                <Lock size={16} className="text-zinc-500" />
                <input
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full bg-transparent text-zinc-200 placeholder:text-zinc-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-brand py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
            >
              {submitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-zinc-500">
            New to Wavecast?{' '}
            <Link to="/create-account" className="font-medium text-brand hover:text-brand-light">
              Create an account
            </Link>
          </p>

          <div className="my-6 border-t border-white/5" />

          <p className="mb-3 text-center text-xs text-zinc-500">Are you a podcast creator?</p>
          <Link
            to="/creator/signin"
            className="flex items-center justify-center gap-2 rounded-full bg-base-800 py-3 text-sm font-semibold text-brand-light transition-colors hover:bg-base-700"
          >
            <Sparkles size={15} />
            Creator Login / Register
          </Link>
        </div>
      </div>
    </div>
  )
}

export default SignIn
