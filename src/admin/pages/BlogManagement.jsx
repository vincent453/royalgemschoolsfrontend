import { useEffect, useMemo, useState } from "react";
import { FiEdit2, FiEye, FiSearch, FiX } from "react-icons/fi";
import Slidebar from "../components/layout/Slidebar";
import Topbar from "../components/layout/Topbar";

const API = import.meta.env.VITE_API_URL || "https://royalgemschoolsbackend.vercel.app";

const BlogManagement = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedPost, setSelectedPost] = useState(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [form, setForm] = useState({ title: "", category: "", content: "", image: null });
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await fetch(`${API}/api/blog`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Failed to load blog posts.");
        setPosts(Array.isArray(data) ? data : data.posts ?? []);
      } catch (err) {
        setError(err.message || "Failed to load blog posts.");
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, []);

  useEffect(() => {
    if (!imagePreview.startsWith("blob:")) return undefined;
    return () => URL.revokeObjectURL(imagePreview);
  }, [imagePreview]);

  const filteredPosts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return posts;
    return posts.filter((post) =>
      [post.title, post.category, post.content].some((value) =>
        value?.toLowerCase().includes(query)
      )
    );
  }, [posts, search]);

  const closePost = () => {
    setSelectedPost(null);
    setEditing(false);
    setSaveError("");
    setForm({ title: "", category: "", content: "", image: null });
    setImagePreview("");
  };

  const openPost = (post, edit = false) => {
    setSelectedPost(post);
    setEditing(edit);
    setSaveError("");
    setForm({
      title: post.title ?? "",
      category: post.category ?? "",
      content: post.content ?? "",
      image: null,
    });
    setImagePreview(post.image ?? "");
  };

  const handleImageChange = (event) => {
    const image = event.target.files?.[0];
    if (!image) return;
    setForm((current) => ({ ...current, image }));
    setImagePreview(URL.createObjectURL(image));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!selectedPost) return;

    try {
      setSaving(true);
      setSaveError("");
      const body = new FormData();
      body.append("title", form.title);
      body.append("category", form.category);
      body.append("content", form.content);
      if (form.image) body.append("image", form.image);

      const response = await fetch(`${API}/api/blog/${selectedPost._id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        body,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to update blog post.");

      const updatedPost = data.post ?? data.blog ?? {
        ...selectedPost,
        title: form.title,
        category: form.category,
        content: form.content,
        image: data.image ?? selectedPost.image,
      };
      setPosts((current) => current.map((post) =>
        post._id === selectedPost._id ? { ...post, ...updatedPost } : post
      ));
      closePost();
    } catch (err) {
      setSaveError(err.message || "Failed to update blog post.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-[#E6EBEE] overflow-x-hidden">
      <div className="sticky top-0 z-50 w-full">
        <Topbar onMenuToggle={() => setSidebarOpen((open) => !open)} />
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="-mt-16">
          <Slidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        </div>

        <main className="w-full overflow-y-auto">
          <div className="max-w-6xl mx-auto p-6 space-y-6">
            <header className="bg-white rounded-xl shadow-sm p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="font-jost font-bold text-xl text-gray-800">Blog Posts</h1>
                <p className="font-dm-sans text-sm text-gray-400 mt-1">View and edit published posts.</p>
              </div>
              <label className="relative w-full sm:max-w-sm">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search posts..."
                  className="w-full border border-gray-200 rounded-lg pl-10 pr-3 py-2.5 text-sm outline-none focus:border-[#f056f0]"
                />
              </label>
            </header>

            {error ? (
              <div role="alert" className="bg-white rounded-xl p-8 text-center text-red-600">{error}</div>
            ) : loading ? (
              <div className="bg-white rounded-xl p-8 text-center text-gray-400">Loading blog posts...</div>
            ) : filteredPosts.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center text-gray-400">
                {search ? "No posts match your search." : "No blog posts yet."}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-100">
                {filteredPosts.map((post) => (
                  <article key={post._id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                    {post.image && (
                      <img src={post.image} alt="" className="w-full sm:w-24 h-36 sm:h-20 object-cover rounded-lg" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-jost font-semibold text-gray-800 truncate">{post.title}</p>
                      <p className="font-dm-sans text-xs text-gray-400 mt-1">
                        {post.category || "Uncategorized"}{post.date ? ` · ${post.date}` : ""}
                      </p>
                      <p className="font-dm-sans text-sm text-gray-500 mt-2 line-clamp-2">{post.content}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => openPost(post)}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:border-[#f056f0] hover:text-[#f056f0]"
                      >
                        <FiEye /> View
                      </button>
                      <button
                        type="button"
                        onClick={() => openPost(post, true)}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#f056f0] text-sm text-white hover:bg-[#525fe1]"
                      >
                        <FiEdit2 /> Edit
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {selectedPost && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4" onMouseDown={(event) => {
          if (event.target === event.currentTarget) closePost();
        }}>
          <section className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl">
            <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between">
              <h2 className="font-jost font-bold text-lg text-gray-800">
                {editing ? "Edit blog post" : "Blog post"}
              </h2>
              <button type="button" onClick={closePost} aria-label="Close" className="p-2 text-gray-500 hover:text-gray-800">
                <FiX />
              </button>
            </div>

            {editing ? (
              <form onSubmit={handleSave} className="p-5 space-y-4">
                {imagePreview && <img src={imagePreview} alt="" className="w-full max-h-72 object-cover rounded-xl" />}
                <label className="block text-sm font-medium text-gray-600">
                  Replace image
                  <input type="file" accept="image/*" onChange={handleImageChange} className="block mt-2 text-sm" />
                </label>
                <label className="block text-sm font-medium text-gray-600">
                  Title
                  <input required value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                </label>
                <label className="block text-sm font-medium text-gray-600">
                  Category
                  <input required value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                </label>
                <label className="block text-sm font-medium text-gray-600">
                  Content
                  <textarea required rows={10} value={form.content} onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-y" />
                </label>
                {saveError && <p role="alert" className="text-sm text-red-600">{saveError}</p>}
                <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => setEditing(false)} className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600">Cancel</button>
                  <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-[#f056f0] text-sm text-white disabled:opacity-50">
                    {saving ? "Saving..." : "Save changes"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-5">
                {selectedPost.image && <img src={selectedPost.image} alt={selectedPost.title} className="w-full max-h-96 object-cover rounded-xl" />}
                <p className="font-dm-sans text-sm text-[#f056f0] mt-5">
                  {selectedPost.category}{selectedPost.date ? ` · ${selectedPost.date}` : ""}
                </p>
                <h3 className="font-jost font-bold text-2xl text-gray-800 mt-2">{selectedPost.title}</h3>
                <p className="font-dm-sans text-gray-600 leading-7 mt-4 whitespace-pre-wrap">{selectedPost.content}</p>
                <div className="flex justify-end mt-6">
                  <button type="button" onClick={() => openPost(selectedPost, true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#f056f0] text-sm text-white">
                    <FiEdit2 /> Edit post
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
};

export default BlogManagement;
