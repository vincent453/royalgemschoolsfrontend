import { useState, useEffect, useMemo, useCallback } from "react"
import { FiImage } from "react-icons/fi"

import Navbar from "../components/layout/Navbar"
import BlogCard from "../components/ui/BlogCard"
import Footer from "../components/layout/Foooter"
import SEO from "../components/layout/SEO"

const API = import.meta.env.VITE_API_URL || "https://royalgemschoolsbackend.vercel.app"

const CATEGORY_COLORS = [
  "text-[#525fe1]",
  "text-[#A033A0]",
  "text-[#0f6e56]",
  "text-[#ba7517]",
  "text-[#993c1d]",
  "text-[#185fa5]",
]

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

const getCategoryColor = (category, categories) => {
  const index = categories.indexOf(category)
  return CATEGORY_COLORS[index % CATEGORY_COLORS.length]
}

const getToken = () => localStorage.getItem("token")

const getUserRole = () => {
  const token = getToken()

  if (!token) return null

  try {
    const decoded = JSON.parse(atob(token.split(".")[1]))
    return decoded?.role || null
  } catch (error) {
    console.error("Invalid token:", error)
    return null
  }
}

const canManagePosts = () => {
  const role = getUserRole()
  return role === "admin" || role === "teacher"
}

const getAuthHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
})

// ─────────────────────────────────────────────
// Blog Page
// ─────────────────────────────────────────────

const Blog = () => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeCategory, setActiveCategory] = useState("All")

  const manageAccess = canManagePosts()

  // ─────────────────────────────────────────────
  // Fetch Posts
  // ─────────────────────────────────────────────

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true)
      setError("")

      const response = await fetch(`${API}/api/blog`)

      if (!response.ok) {
        throw new Error("Failed to fetch blog posts")
      }

      const data = await response.json()

      setPosts(Array.isArray(data) ? data : data.posts || [])
    } catch (error) {
      console.error(error)
      setError("Could not load blog posts. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [])

  // ─────────────────────────────────────────────
  // Delete Post
  // ─────────────────────────────────────────────

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this post?"
    )

    if (!confirmDelete) return

    try {
      const response = await fetch(`${API}/api/blog/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        throw new Error("Failed to delete post")
      }

      setPosts((prevPosts) =>
        prevPosts.filter((post) => post._id !== id)
      )
    } catch (error) {
      console.error(error)
      alert("Failed to delete post.")
    }
  }

  // ─────────────────────────────────────────────
  // Initial Fetch
  // ─────────────────────────────────────────────

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  // ─────────────────────────────────────────────
  // Categories
  // ─────────────────────────────────────────────

  const categories = useMemo(() => {
    const uniqueCategories = [
      ...new Set(posts.map((post) => post.category)),
    ]

    return ["All", ...uniqueCategories]
  }, [posts])

  // ─────────────────────────────────────────────
  // Filtered Posts
  // ─────────────────────────────────────────────

  const filteredPosts = useMemo(() => {
    if (activeCategory === "All") {
      return posts
    }

    return posts.filter(
      (post) => post.category === activeCategory
    )
  }, [posts, activeCategory])

  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
  title="School News & Events | Royal Gem School"
  description="Stay updated with school news, announcements, achievements, and upcoming events."
  keywords="school news, school events, education updates"
  url="https://royalgemschool.com/blog"
/>
      <Navbar />

      {/* Hero Section */}
      <section className="bg-[#702b70] py-16 px-4 text-center mt-[5rem]">
        <p className="font-dm-sans text-purple-200 text-sm tracking-widest uppercase mb-3">
          Our Blog
        </p>

        <h1 className="font-jost font-bold text-white text-3xl sm:text-4xl md:text-5xl mb-4">
          News & Insights
        </h1>

        <p className="font-dm-sans text-purple-100 text-base sm:text-lg max-w-xl mx-auto">
          Stories, updates, and ideas from the Royal Gem Schools community.
        </p>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-14 py-8">
        <div className="flex flex-wrap gap-3">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-full border text-sm font-semibold transition-all duration-300 cursor-pointer
                ${
                  activeCategory === category
                    ? "bg-[#A033A0] text-white border-[#A033A0]"
                    : "bg-white text-gray-600 border-gray-200 hover:border-[#A033A0] hover:text-[#A033A0]"
                }`}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      {/* Blog Posts */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-14 pb-20">
        {loading ? (
          <div className="flex items-center justify-center gap-3 py-32 text-gray-400">
            <svg
              className="w-6 h-6 animate-spin text-[#A033A0]"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />

              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              />
            </svg>

            <span className="font-dm-sans text-sm">
              Loading posts...
            </span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-3 py-24">
            <p className="text-red-500 font-dm-sans">
              {error}
            </p>

            <button
              onClick={fetchPosts}
              className="text-sm text-[#A033A0] underline font-dm-sans cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <FiImage className="mx-auto mb-4 text-5xl opacity-30" />

            <p className="font-dm-sans">
              No posts found in this category.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
            {filteredPosts.map((post) => (
              <BlogCard
                key={post._id}
                image={post.image}
                date={post.date}
                category={post.category}
                categoryColor={getCategoryColor(
                  post.category,
                  categories
                )}
                title={post.title}
                content={post.content}
                href={`/blog/${post.slug || post._id}`}
                onDelete={
                  manageAccess
                    ? () => handleDelete(post._id)
                    : undefined
                }
              />
            ))}
          </div>
        )}
      </section>
      <Footer />
    </div>
  )
}

export default Blog