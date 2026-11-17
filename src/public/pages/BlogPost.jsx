import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Foooter";

const API = import.meta.env.VITE_API_URL || "https://royalgemschoolsbackend.vercel.app";

const BlogPost = () => {
  const { slugOrId } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPost = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await fetch(`${API}/api/blog/${encodeURIComponent(slugOrId)}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Could not load this blog post.");
        setPost(data.post ?? data.blog ?? data);
      } catch (err) {
        setError(err.message || "Could not load this blog post.");
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [slugOrId]);

  return (
    <div className="min-h-screen bg-[#E6EBEE]">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <Link to="/blog" className="inline-flex mb-6 text-sm font-semibold text-[#f056f0] hover:underline">
          ← All news and events
        </Link>
        {loading ? (
          <div className="bg-white rounded-2xl p-10 text-center text-gray-400">Loading blog post...</div>
        ) : error ? (
          <div role="alert" className="bg-white rounded-2xl p-10 text-center text-red-600">{error}</div>
        ) : post ? (
          <article className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {post.image && <img src={post.image} alt={post.title} className="w-full max-h-[28rem] object-cover" />}
            <div className="p-6 sm:p-10">
              <p className="font-dm-sans text-sm text-[#f056f0]">
                {post.category}{post.date ? ` · ${post.date}` : ""}
              </p>
              <h1 className="font-jost font-bold text-3xl sm:text-4xl text-[#702b70] mt-3">{post.title}</h1>
              <p className="font-dm-sans text-gray-600 leading-8 mt-6 whitespace-pre-wrap">{post.content}</p>
            </div>
          </article>
        ) : (
          <div className="bg-white rounded-2xl p-10 text-center text-gray-500">Blog post not found.</div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default BlogPost;
