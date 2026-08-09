import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Check, Upload } from 'lucide-react'
import Navbar from '../components/navbar'
import Footer from './Footer'
import { useAuth } from '../context/AuthContext'
import api, { getErrorMessage } from '../lib/api'

const AddEpisode = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, loading } = useAuth()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [audio, setAudio] = useState(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  if (!loading && (!user || user.role !== 'creator')) return <Navigate to="/creator/signin" replace />

  const selectAudio = (file) => {
    if (!file) return
    if (file.size > 100 * 1024 * 1024) return setError('Audio files must be 100MB or smaller.')
    setError('')
    setAudio(file)
  }
  const submit = async (event) => {
    event.preventDefault()
    if (!audio) return setError('Choose an audio file before publishing.')
    setSaving(true); setError('')
    try {
      const form = new FormData()
      form.append('title', title)
      form.append('description', description)
      form.append('audio', audio)
      await api.post(`/podcasts/${id}/episodes`, form)
      navigate(`/podcast/${id}`)
    } catch (err) { setError(getErrorMessage(err)) } finally { setSaving(false) }
  }
  return <div className="min-h-screen bg-base-950"><Navbar /><main className="mx-auto max-w-2xl px-4 py-10"><Link to={`/podcast/${id}`} className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"><ArrowLeft size={16} />Back to podcast</Link><h1 className="mt-6 text-2xl font-bold text-white">Add a new episode</h1><p className="mt-1 text-sm text-zinc-500">Upload an episode to your existing podcast.</p>{error && <p className="mt-5 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>}<form onSubmit={submit} className="mt-6 space-y-5 rounded-2xl border border-white/5 bg-base-850 p-6"><div><label className="mb-1.5 block text-sm font-medium text-zinc-300">Episode title</label><input required value={title} onChange={(event) => setTitle(event.target.value)} className="w-full rounded-xl border border-white/10 bg-base-800 px-4 py-3 text-sm text-white focus:outline-none" /></div><div><label className="mb-1.5 block text-sm font-medium text-zinc-300">Description</label><textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={4} className="w-full resize-none rounded-xl border border-white/10 bg-base-800 px-4 py-3 text-sm text-white focus:outline-none" /></div><label className="flex cursor-pointer items-center gap-4 rounded-xl border border-dashed border-white/15 bg-base-800 p-5 hover:border-brand"><Upload className="text-brand" /><span><strong className="block text-sm text-white">{audio ? audio.name : 'Choose an audio file'}</strong><small className="text-zinc-500">MP3, WAV, M4A, OGG, or WEBM · 100MB max</small></span><input type="file" accept="audio/*,.webm,.ogg" className="hidden" onChange={(event) => selectAudio(event.target.files?.[0])} /></label><button disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-full bg-brand py-3 text-sm font-semibold text-white disabled:opacity-50"><Check size={16} />{saving ? 'Publishing...' : 'Publish episode'}</button></form></main><Footer /></div>
}

export default AddEpisode
