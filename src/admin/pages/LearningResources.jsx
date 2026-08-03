import { useEffect, useState } from "react";
import Slidebar from "../components/layout/Slidebar";
import Topbar from "../components/layout/Topbar";

const API = "https://royalgemschoolsbackend.vercel.app";

export default function LearningResources() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [resources, setResources] = useState([]);
  const [form, setForm] = useState({ title: "", subject: "", classLevel: "", description: "", resourceType: "Document", url: "" });
  const [loading, setLoading] = useState(true);

  const fetchResources = async () => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API}/api/learning/resources`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await response.json();
    setResources(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const response = await fetch(`${API}/api/learning/resources`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    });
    if (response.ok) {
      setForm({ title: "", subject: "", classLevel: "", description: "", resourceType: "Document", url: "" });
      fetchResources();
    }
  };

  return (
    <div className="flex h-screen bg-[#E6EBEE] overflow-hidden">
      <div className="sticky top-0 z-50 w-full">
        <Topbar onMenuToggle={() => setSidebarOpen((p) => !p)} />
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="-mt-16">
          <Slidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        </div>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6 max-w-6xl mx-auto">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Learning Resources</h1>
              <p className="text-sm text-gray-500">Publish helpful links, documents, or videos for students.</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <input className="border rounded-xl p-3" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                <input className="border rounded-xl p-3" placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
                <input className="border rounded-xl p-3" placeholder="Class level" value={form.classLevel} onChange={(e) => setForm({ ...form, classLevel: e.target.value })} required />
                <select className="border rounded-xl p-3" value={form.resourceType} onChange={(e) => setForm({ ...form, resourceType: e.target.value })}>
                  <option value="Document">Document</option>
                  <option value="Video">Video</option>
                  <option value="Link">Link</option>
                  <option value="Article">Article</option>
                </select>
              </div>
              <input className="border rounded-xl p-3 w-full" placeholder="Resource URL" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
              <textarea className="border rounded-xl p-3 w-full" rows="3" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <button className="px-4 py-2 rounded-xl bg-[#f056f0] text-white text-sm font-semibold">Publish Resource</button>
            </form>

            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h2 className="font-semibold text-gray-800 mb-4">Shared Resources</h2>
              {loading ? <p className="text-sm text-gray-500">Loading…</p> : (
                <div className="space-y-3">
                  {resources.map((item) => (
                    <div key={item._id} className="border rounded-xl p-3">
                      <p className="font-semibold text-sm text-gray-700">{item.title}</p>
                      <p className="text-xs text-gray-400">{item.subject} • {item.classLevel} • {item.resourceType}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
