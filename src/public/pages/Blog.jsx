import { useState, useRef, useEffect } from 'react'
import { FiX, FiPlus, FiImage } from 'react-icons/fi'
import BlogCard from '../components/ui/BlogCard'

const API = import.meta.env.VITE_API_URL || "https://royalgemschoolsbackend.onrender.com"

const CATEGORY_COLORS = [
  'text-[#525fe1]', 'text-[#A033A0]', 'text-[#0f6e56]',
  'text-[#ba7517]', 'text-[#993c1d]', 'text-[#185fa5]',
]

const colorForCategory = (category, allCategories) => {
  const idx = allCategories.indexOf(category)
  return CATEGORY_COLORS[idx % CATEGORY_COLORS.length]
}

const getStaffRole = () => {
  const token = localStorage.getItem('token')
  if (!token) return null
  try { return JSON.parse(atob(token.split('.')[1])).role ?? null } catch { return null }
}

const canManage = () => {
  const role = getStaffRole()
  return role === 'admin' || role === 'teacher'
}

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` })

// ── Upload Modal ──────────────────────────────────────────────
const UploadModal = ({ onClose, onCreated }) => {
  const fileRef    = useRef()
  const [file,     setFile]     = useState(null)
  const [preview,  setPreview]  = useState(null)
  const [dragging, setDragging] = useState(false)
  const [form,     setForm]     = useState({ title: '', category: '', date: '', href: '' })
  const [errors,   setErrors]   = useState({})
  const [saving,   setSaving]   = useState(false)
  const [apiError, setApiError] = useState('')

  const handleFile = (f) => {
    if (!f || !f.type.startsWith('image/')) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0])
  }

  const validate = () => {
    const e = {}
    if (!preview)              e.image    = 'Please upload an image'
    if (!form.title.trim())    e.title    = 'Title is required'
    if (!form.category.trim()) e.category = 'Category is required'
    if (!form.date.trim())     e.date     = 'Date is required'
    return e
  }

  const handleSubmit = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setSaving(true); setApiError('')
    try {
      const fd = new FormData()
      fd.append('title',    form.title.trim())
      fd.append('category', form.category.trim())
      fd.append('date',     form.date.trim())
      fd.append('href',     form.href.trim())
      if (file) fd.append('image', file)
      const res  = await fetch(`${API}/api/blog`, { method: 'POST', headers: authHeaders(), body: fd })
      const data = await res.json()
      if (!res.ok) { setApiError(data.message ?? 'Failed to publish'); return }
      onCreated(data); onClose()
    } catch { setApiError('Network error. Please try again.') }
    finally { setSaving(false) }
  }

  const field = (key, label, placeholder) => (
    <div className="flex flex-col gap-1">
      <label className="font-jost text-sm font-semibold text-gray-700">{label}</label>
      <input
        type="text" placeholder={placeholder} value={form[key]}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        className="border border-gray-200 rounded-md px-3 py-2 font-dm-sans text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#A033A0]/30 focus:border-[#A033A0]"
      />
      {errors[key] && <p className="text-red-500 text-xs">{errors[key]}</p>}
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-jost font-bold text-[#702b70] text-xl">New Blog Post</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer border-none bg-transparent">
            <FiX className="text-xl" />
          </button>
        </div>
        <div className="px-6 py-5 flex flex-col gap-5">
          <div>
            <label className="font-jost text-sm font-semibold text-gray-700 block mb-2">Cover Image</label>
            <div
              onClick={() => fileRef.current.click()}
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-xl cursor-pointer transition-colors overflow-hidden
                ${dragging ? 'border-[#A033A0] bg-purple-50' : 'border-gray-200 hover:border-[#A033A0] bg-gray-50'}`}
            >
              {preview ? (
                <div className="relative h-48">
                  <img src={preview} alt="preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <span className="text-white font-jost text-sm font-semibold bg-black/50 px-3 py-1 rounded-full">Change image</span>
                  </div>
                </div>
              ) : (
                <div className="h-40 flex flex-col items-center justify-center gap-2 text-gray-400">
                  <FiImage className="text-3xl" />
                  <p className="font-dm-sans text-sm">Drop image here or <span className="text-[#A033A0] font-semibold">browse</span></p>
                  <p className="text-xs">PNG, JPG, WEBP up to 10MB</p>
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => handleFile(e.target.files[0])} />
            </div>
            {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image}</p>}
          </div>

          {field('title',    'Post Title',      'e.g. How Math Builds Critical Thinking')}
          {field('category', 'Category',        'e.g. Education, Events, News')}
          {field('date',     'Date',            'e.g. May 20, 2026')}
          {field('href',     'Link (optional)', 'https://...')}

          {apiError && (
            <p className="text-red-500 text-sm bg-red-50 border border-red-200 px-3 py-2 rounded-lg">⚠️ {apiError}</p>
          )}

          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 font-jost font-semibold text-sm py-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer bg-white">
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={saving} className="flex-1 bg-[#A033A0] hover:bg-[#702b70] disabled:opacity-60 text-white font-jost font-semibold text-sm py-3 rounded-lg transition-colors cursor-pointer border-none">
              {saving ? 'Publishing…' : 'Publish Post'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main Blog Page ────────────────────────────────────────────
const Blog = () => {
  const [posts,     setPosts]     = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState('')
  const [showModal, setShowModal] = useState(false)
  const [filter,    setFilter]    = useState('All')

  const manage = canManage()

  useEffect(() => { fetchPosts() }, [])

  const fetchPosts = async () => {
    setLoading(true); setError('')
    try {
      const res  = await fetch(`${API}/api/blog`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      setPosts(data)
    } catch { setError('Could not load posts. Please try again.') }
    finally { setLoading(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this post?')) return
    try {
      const res = await fetch(`${API}/api/blog/${id}`, { method: 'DELETE', headers: authHeaders() })
      if (res.ok) setPosts(prev => prev.filter(p => p._id !== id))
    } catch { alert('Failed to delete post.') }
  }

  const handleCreated = (post) => setPosts(prev => [post, ...prev])

  const allCategories = Array.from(new Set(posts.map(p => p.category)))
  const categories    = ['All', ...allCategories]
  const visible       = filter === 'All' ? posts : posts.filter(p => p.category === filter)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-[#702b70] py-16 px-4 text-center">
        <p className="font-dm-sans text-purple-200 text-sm tracking-widest uppercase mb-3">Our Blog</p>
        <h1 className="font-jost font-bold text-white text-3xl sm:text-4xl md:text-5xl mb-4">News & Insights</h1>
        <p className="font-dm-sans text-purple-100 text-base sm:text-lg max-w-xl mx-auto">
          Stories, updates, and ideas from the Royal Gem Schools community.
        </p>
      </section>

      {/* Controls */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-14 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat} onClick={() => setFilter(cat)}
                className={`font-jost text-sm font-semibold px-4 py-2 rounded-full border transition-colors cursor-pointer
                  ${filter === cat ? 'bg-[#A033A0] text-white border-[#A033A0]' : 'bg-white text-gray-600 border-gray-200 hover:border-[#A033A0] hover:text-[#A033A0]'}`}
              >
                {cat}
              </button>
            ))}
          </div>
          {manage && (
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 bg-[#A033A0] hover:bg-[#702b70] text-white font-jost font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors shrink-0 cursor-pointer border-none"
            >
              <FiPlus className="text-base" /> New Post
            </button>
          )}
        </div>
      </section>

      {/* Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-14 pb-20">
        {loading ? (
          <div className="flex justify-center items-center py-32 gap-3 text-gray-400">
            <svg className="w-6 h-6 animate-spin text-[#A033A0]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            <span className="font-dm-sans text-sm">Loading posts…</span>
          </div>
        ) : error ? (
          <div className="text-center py-24 flex flex-col items-center gap-3">
            <p className="text-red-500 font-dm-sans">{error}</p>
            <button onClick={fetchPosts} className="text-sm text-[#A033A0] underline cursor-pointer bg-transparent border-none font-dm-sans">Retry</button>
          </div>
        ) : visible.length === 0 ? (
          <div className="text-center py-24 text-gray-400 font-dm-sans">
            <FiImage className="text-5xl mx-auto mb-4 opacity-30" />
            <p>No posts in this category yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
            {visible.map(post => (
              <BlogCard
                key={post._id}
                image={post.image}
                date={post.date}
                category={post.category}
                categoryColor={colorForCategory(post.category, allCategories)}
                title={post.title}
                href={post.href}
                onDelete={manage ? () => handleDelete(post._id) : undefined}
              />
            ))}
          </div>
        )}
      </section>

      {showModal && <UploadModal onClose={() => setShowModal(false)} onCreated={handleCreated} />}
    </div>
  )
}

export default Blog