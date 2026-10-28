import { useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { Mic, Upload, Square, X, Check, Image as ImageIcon } from 'lucide-react'
import Navbar from '../components/navbar'
import Footer from './Footer'
import { useAuth } from '../context/AuthContext'
import api, { getErrorMessage, uploadMedia } from '../lib/api'
import { categories } from '../data/podcasts'

const categoryNames = categories.map((c) => c.name)

const formatTimer = (secs) => {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

const CreatePodcast = () => {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialMode = searchParams.get('mode') === 'upload' ? 'upload' : 'record'

  const [mode, setMode] = useState(initialMode)
  const [form, setForm] = useState({
    title: '',
    author: user?.channelName || user?.name || '',
    description: '',
    category: 'Technology',
  })
  const [tags, setTags] = useState([])
  const [tagInput, setTagInput] = useState('')
  const [coverFile, setCoverFile] = useState(null)
  const [coverPreview, setCoverPreview] = useState('')

  // Recording state
  const [isRecording, setIsRecording] = useState(false)
  const [recordedBlob, setRecordedBlob] = useState(null)
  const [recordSeconds, setRecordSeconds] = useState(0)
  const mediaRecorderRef = useRef(null)
  const timerRef = useRef(null)
  const chunksRef = useRef([])

  // Upload state
  const [audioFile, setAudioFile] = useState(null)
  const [dragOver, setDragOver] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    return () => clearInterval(timerRef.current)
  }, [])

  if (!loading && (!user || user.role !== 'creator')) {
    return <Navigate to="/creator/signin" replace />
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const addTag = () => {
    const t = tagInput.trim().replace(/^#/, '')
    if (t && !tags.includes(t)) setTags([...tags, t])
    setTagInput('')
  }

  const removeTag = (t) => setTags(tags.filter((x) => x !== t))

  const handleCoverPick = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCoverFile(file)
    setCoverPreview(URL.createObjectURL(file))
  }

  const startRecording = async () => {
    setError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      chunksRef.current = []
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data)
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setRecordedBlob(blob)
        stream.getTracks().forEach((t) => t.stop())
      }
      recorder.start()
      mediaRecorderRef.current = recorder
      setIsRecording(true)
      setRecordSeconds(0)
      timerRef.current = setInterval(() => setRecordSeconds((s) => s + 1), 1000)
    } catch {
      setError('Microphone access was denied or is unavailable in this browser.')
    }
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
    setIsRecording(false)
    clearInterval(timerRef.current)
  }

  const handleAudioDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) selectAudioFile(file)
  }

  const selectAudioFile = (file) => {
    if (!file) return
    if (file.size > 100 * 1024 * 1024) {
      setError('Audio files must be 100MB or smaller.')
      return
    }
    const extension = file.name.split('.').pop()?.toLowerCase()
    if (!file.type.startsWith('audio/') && !['mp3', 'wav', 'm4a', 'aac', 'ogg', 'webm', 'mp4'].includes(extension)) {
      setError('Choose a valid audio file such as MP3, WAV, M4A, OGG, or WEBM.')
      return
    }
    setError('')
    setAudioFile(file)
  }

  const handlePublish = async (e) => {
    e.preventDefault()
    setError('')

    const episodeAudio = mode === 'record' ? recordedBlob : audioFile
    if (!episodeAudio) {
      setError(
        mode === 'record'
          ? 'Record an episode before publishing.'
          : 'Select an audio file before publishing.'
      )
      return
    }
    if (!form.title || !form.author || !form.description) {
      setError('Podcast title, host/author and description are required.')
      return
    }

    setSubmitting(true)
    try {
      // Upload media directly to private S3 objects using short-lived presigned URLs.
      let coverImageKey = ''
      if (coverFile) {
        const contentType = coverFile.type || 'image/jpeg'
        const { data: upload } = await api.post('/podcasts/upload-url', {
          type: 'cover', fileName: coverFile.name, contentType, fileSize: coverFile.size,
        })
        await uploadMedia(upload.uploadUrl, coverFile, contentType)
        coverImageKey = upload.key
      }

      const { data: podcastData } = await api.post('/podcasts', {
        ...form, tags, coverImageKey,
      })
      const podcastId = podcastData.podcast._id

      // API Gateway never receives the large audio body; the browser sends it to S3.
      const fileName = mode === 'record' ? 'episode.webm' : episodeAudio.name
      const contentType = episodeAudio.type || 'application/octet-stream'
      const { data: upload } = await api.post('/podcasts/upload-url', {
        type: 'audio', fileName, contentType, fileSize: episodeAudio.size, podcastId,
      })
      await uploadMedia(upload.uploadUrl, episodeAudio, contentType)
      await api.post(`/podcasts/${podcastId}/episodes`, {
        title: form.title, description: form.description, audioKey: upload.key,
      })

      navigate('/studio/podcasts')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-base-950">
      <Navbar />

      <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-white">Create a Podcast</h1>
        <p className="mt-1 text-sm text-zinc-500">Record a new episode or upload an existing audio file</p>

        {/* Mode tabs */}
        <div className="mt-6 inline-flex rounded-full bg-base-800 p-1">
          <button
            onClick={() => setMode('record')}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              mode === 'record' ? 'bg-brand text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Mic size={15} />
            Record
          </button>
          <button
            onClick={() => setMode('upload')}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              mode === 'upload' ? 'bg-brand text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Upload size={15} />
            Upload
          </button>
        </div>

        {error && (
          <p className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>
        )}

        {/* Record / Upload panel */}
        <div className="mt-4 rounded-2xl border border-white/5 bg-base-850 p-6">
          {mode === 'record' ? (
            <>
              <h2 className="mb-1 flex items-center gap-2 text-sm font-semibold text-white">
                <Mic size={15} className="text-brand" />
                Record Audio
              </h2>
              <p className="mb-6 text-xs text-zinc-500">
                Use your microphone to record a new episode directly in the browser.
              </p>
              <div className="flex flex-col items-center py-6">
                <button
                  type="button"
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`flex h-16 w-16 items-center justify-center rounded-full transition-colors ${
                    isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-brand hover:bg-brand-dark'
                  }`}
                >
                  {isRecording ? (
                    <Square size={22} className="fill-white text-white" />
                  ) : (
                    <Mic size={24} className="text-white" />
                  )}
                </button>
                <p className="mt-3 text-sm text-zinc-400">
                  {isRecording
                    ? `Recording... ${formatTimer(recordSeconds)}`
                    : recordedBlob
                    ? `Recorded ${formatTimer(recordSeconds)} — tap to re-record`
                    : 'Tap to start recording'}
                </p>
                {recordedBlob && !isRecording && (
                  <audio className="mt-4 w-full max-w-xs" controls src={URL.createObjectURL(recordedBlob)} />
                )}
              </div>
            </>
          ) : (
            <>
              <h2 className="mb-1 flex items-center gap-2 text-sm font-semibold text-white">
                <Upload size={15} className="text-brand" />
                Upload Audio File
              </h2>
              <p className="mb-6 text-xs text-zinc-500">
                Upload a pre-recorded audio file (MP3, WAV, M4A up to 100MB).
              </p>
              <label
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragOver(true)
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleAudioDrop}
                className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed py-12 text-center transition-colors ${
                  dragOver ? 'border-brand bg-brand/5' : 'border-white/10 hover:border-white/20'
                }`}
              >
                <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-base-800 text-zinc-400">
                  <Upload size={18} />
                </span>
                <p className="text-sm font-semibold text-white">
                  {audioFile ? audioFile.name : 'Click to select an audio file'}
                </p>
                <p className="mt-1 text-xs text-zinc-500">MP3, WAV, M4A · Max 100MB</p>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => selectAudioFile(e.target.files?.[0])}
                  className="hidden"
                />
              </label>
            </>
          )}
        </div>

        {/* Podcast details form */}
        <form onSubmit={handlePublish} className="mt-6 space-y-5 rounded-2xl border border-white/5 bg-base-850 p-6">
          <h2 className="text-base font-bold text-white">Podcast Details</h2>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-300">
              Podcast Title <span className="text-brand">*</span>
            </label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              type="text"
              required
              placeholder="e.g. The Tech Frontier"
              className="w-full rounded-xl border border-white/10 bg-base-800 px-4 py-3 text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-300">
              Host / Author <span className="text-brand">*</span>
            </label>
            <input
              name="author"
              value={form.author}
              onChange={handleChange}
              type="text"
              required
              placeholder="Your name"
              className="w-full rounded-xl border border-white/10 bg-base-800 px-4 py-3 text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-300">
              Description <span className="text-brand">*</span>
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              rows={4}
              placeholder="Tell listeners what your podcast is about..."
              className="w-full resize-none rounded-xl border border-white/10 bg-base-800 px-4 py-3 text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">Category</label>
            <div className="flex flex-wrap gap-2">
              {categoryNames.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setForm({ ...form, category: cat })}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                    form.category === cat
                      ? 'bg-brand text-white'
                      : 'bg-base-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">Tags</label>
            <div className="flex gap-2">
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addTag()
                  }
                }}
                placeholder="Add a tag and press Enter"
                className="w-full rounded-xl border border-white/10 bg-base-800 px-4 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={addTag}
                className="shrink-0 rounded-xl bg-base-700 px-4 text-sm font-semibold text-white hover:bg-base-600"
              >
                Add
              </button>
            </div>
            {tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="flex items-center gap-1.5 rounded-full bg-base-800 px-3 py-1 text-xs text-zinc-300"
                  >
                    #{t}
                    <button type="button" onClick={() => removeTag(t)} aria-label={`Remove ${t}`}>
                      <X size={12} className="text-zinc-500 hover:text-white" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">Cover Image</label>
            <label className="flex cursor-pointer items-center gap-4 rounded-xl border border-white/10 bg-base-800 p-4 hover:border-white/20">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-base-700">
                {coverPreview ? (
                  <img src={coverPreview} alt="Cover preview" className="h-full w-full object-cover" />
                ) : (
                  <ImageIcon size={20} className="text-zinc-500" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white">
                  {coverFile ? coverFile.name : 'Choose a cover image'}
                </p>
                <p className="text-xs text-zinc-500">Leave blank to use a default cover</p>
              </div>
              <input type="file" accept="image/*" onChange={handleCoverPick} className="hidden" />
            </label>
          </div>

          <div className="flex items-center gap-3 border-t border-white/5 pt-5">
            <button
              type="submit"
              disabled={submitting}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-brand py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
            >
              <Check size={16} />
              {submitting ? 'Publishing...' : 'Publish Podcast'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/studio')}
              className="rounded-full bg-base-800 px-6 py-3 text-sm font-semibold text-zinc-300 hover:bg-base-700"
            >
              Cancel
            </button>
          </div>
        </form>
      </section>

      <Footer />
    </div>
  )
}

export default CreatePodcast
