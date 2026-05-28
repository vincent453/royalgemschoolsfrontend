import { useState, useEffect } from "react"
import BlogCard from "../ui/BlogCard"
import SectionHeader from "../ui/SectionHeader"

const API = import.meta.env.VITE_API_URL || "https://royalgemschoolsbackend.vercel.app"

const CATEGORY_COLORS = [
  "text-[#525fe1]",
  "text-[#A033A0]",
  "text-[#0f6e56]",
  "text-[#ba7517]",
  "text-[#993c1d]",
  "text-[#185fa5]",
]

const Blog = () => {
  const [posts, setPosts]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState("")

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true)
        setError("")
        const res  = await fetch(`${API}/api/blog`)
        const data = await res.json()
        // show only the 3 most recent posts on the homepage
        const all  = Array.isArray(data) ? data : data.posts || []
        setPosts(all.slice(0, 3))
      } catch (err) {
        console.error(err)
        setError("Could not load posts.")
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

  // derive a stable color per category
  const categories = [...new Set(posts.map((p) => p.category))]
  const getCategoryColor = (category) => {
    const index = categories.indexOf(category)
    return CATEGORY_COLORS[index % CATEGORY_COLORS.length]
  }

  return (
    <div className="mt-[5rem] px-[0rem] py:px-[5rem] md:px-[5rem]">
      <SectionHeader
        title="Latest Blog & news"
        description="Discover the latest insights, tips, and stories from our educational community. Our blog features articles on a wide range of topics, including teaching strategies, student success stories, educational trends, and much more."
      />

      <div>
        {loading ? (
          <div className="flex items-center justify-center gap-3 py-20 text-gray-400">
            <svg className="w-6 h-6 animate-spin text-[#A033A0]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            <span className="font-dm-sans text-sm">Loading posts...</span>
          </div>
        ) : error ? (
          <p className="text-center text-red-500 font-dm-sans py-12">{error}</p>
        ) : posts.length === 0 ? (
          <p className="text-center text-gray-400 font-dm-sans py-12">No posts yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-6 md:px-14 py-12">
            {posts.map((post) => (
              <BlogCard
                key={post._id}
                image={post.image}
                date={post.date}
                category={post.category}
                categoryColor={getCategoryColor(post.category)}
                title={post.title}
                href={`/blog/${post.slug || post._id}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Blog