import { useEffect, useState } from "react";
import Slidebar from "../components/layout/Slidebar";
import Topbar from "../components/layout/Topbar";

const API = "https://royalgemschoolsbackend.vercel.app";

const fallbackResources = [
  { _id: "demo-r1", title: "Reading Guide", subject: "English", classLevel: "JSS 1", description: "A simple reading guide for students.", resourceType: "Document", url: "#" },
  { _id: "demo-r2", title: "Science Revision Video", subject: "Science", classLevel: "SSS 1", description: "Revision video for science topics.", resourceType: "Video", url: "#" },
];

async function readJsonSafely(response) {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export default function LearningResources() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [resources, setResources] = useState(fallbackResources);
  const [form, setForm] = useState({ title: "", subject: "", classLevel: "", description: "", resourceType: "Document", url: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchResources = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API}/api/learning/resources`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await readJsonSafely(response);
      const nextResources = Array.isArray(data) && data.length ? data : fallbackResources;
      setResources(nextResources);
      setError(response.ok ? "" : "Live resource data is unavailable. Showing a ready-to-use view.");
    } catch {
      setResources(fallbackResources);
      setError("The connection to the learning service is unavailable. Showing sample content.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API}/api/learning/resources`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (response.ok) {
        setForm({ title: "", subject: "", classLevel: "", description: "", resourceType: "Document", url: "" });
        await fetchResources();
      } else {
        setError("Resource could not be saved right now. Please try again later.");
      }
    } catch {
      setError("Resource could not be saved right now. Please try again later.");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#E6EBEE] overflow-hidden">
      <div className="sticky top-0 z-50 w-full">
        <Topbar onMenuToggle={() => setSidebarOpen((p) => !p)} />
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex flex-1 overflow-hidden rounded-r-2xl shadow-sm relative">
        <div className={`fixed md:relative top-[4rem] left-0 z-40 transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"} -mt-0 md:-mt-16`}>
          <Slidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        </div>

        <div className="flex-1 flex flex-col overflow-y-auto">
          <div className="p-4 md:p-6 space-y-6">
            <div>
              <h1 className="font-jost font-bold text-gray-800 text-3xl">Learning Resources</h1>
              <p className="font-dm-sans text-gray-400 text-sm mt-1">Publish helpful links, documents, or videos for students.</p>
            </div>

            {error && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <input className="border border-gray-200 rounded-xl p-3" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                <input className="border border-gray-200 rounded-xl p-3" placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
                <input className="border border-gray-200 rounded-xl p-3" placeholder="Class level" value={form.classLevel} onChange={(e) => setForm({ ...form, classLevel: e.target.value })} required />
                <select className="border border-gray-200 rounded-xl p-3" value={form.resourceType} onChange={(e) => setForm({ ...form, resourceType: e.target.value })}>
                  <option value="Document">Document</option>
                  <option value="Video">Video</option>
                  <option value="Link">Link</option>
                  <option value="Article">Article</option>
                </select>
              </div>
              <input className="border border-gray-200 rounded-xl p-3 w-full" placeholder="Resource URL" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
              <textarea className="border border-gray-200 rounded-xl p-3 w-full" rows="3" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <button className="px-4 py-2 rounded-xl bg-[#f056f0] text-white text-sm font-semibold">Publish Resource</button>
            </form>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-jost font-bold text-gray-800 text-lg mb-4">Shared Resources</h2>
              {loading ? <p className="text-sm text-gray-500">Loading…</p> : (
                <div className="space-y-3">
                  {resources.map((item) => (
                    <div key={item._id} className="border border-gray-100 rounded-xl p-3">
                      <p className="font-semibold text-sm text-gray-700">{item.title}</p>
                      <p className="text-xs text-gray-400 mt-1">{item.subject} • {item.classLevel} • {item.resourceType}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
