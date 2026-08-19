import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft, FaBookOpen, FaExternalLinkAlt,
  FaDownload, FaSearch,
} from "react-icons/fa";
import { getResources } from "../../services/lmsApi";

const CATEGORIES = [
  "Public Speaking","Programming","Culture","Financial Literacy",
  "Science & Space","Biology","Geography & World Knowledge",
  "Art, Creativity & Design","General Knowledge","Bible Knowledge & Christian Character",
];

// Each category gets a consistent colour
const catColors = [
  "from-purple-400 to-purple-600",
  "from-blue-400 to-blue-600",
  "from-emerald-400 to-emerald-600",
  "from-amber-400 to-amber-600",
  "from-sky-400 to-sky-600",
  "from-green-400 to-green-600",
  "from-teal-400 to-teal-600",
  "from-pink-400 to-pink-600",
  "from-indigo-400 to-indigo-600",
  "from-rose-400 to-rose-600",
];
const catColor = (cat) => catColors[CATEGORIES.indexOf(cat) % catColors.length] ?? "from-gray-400 to-gray-600";

const Skeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="bg-white rounded-2xl h-44 animate-pulse" />
    ))}
  </div>
);

export default function StudentResources() {
  const navigate   = useNavigate();
  const hasFetched = useRef(false);

  const [resources,   setResources]   = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");
  const [search,      setSearch]      = useState("");
  const [activeTab,   setActiveTab]   = useState("all"); // "all" or a category name

  // Get student's class from portal storage for filtering
  const classLevel = (() => {
    try {
      const s = JSON.parse(localStorage.getItem("portalStudent") ?? "{}");
      return s.classLevel ?? "";
    } catch { return ""; }
  })();

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const token = localStorage.getItem("portalToken");
    if (!token) { navigate("/portal"); return; }

    // Pass the student's classLevel so the backend filters correctly
    getResources({ classLevel })
      .then(data => setResources(data.resources ?? []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [navigate, classLevel]);

  // Categories that actually have resources
  const usedCategories = [...new Set(resources.map(r => r.category))];

  const filtered = resources.filter(r => {
    const matchesCat  = activeTab === "all" || r.category === activeTab;
    const matchSearch = !search.trim() ||
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.description?.toLowerCase().includes(search.toLowerCase()) ||
      r.category.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-[#E6EBEE]">
      {/* Topbar */}
      <header className="sticky top-0 z-40 bg-[#f056f0] h-[60px] flex items-center px-6 gap-4 shadow-md">
        <button onClick={() => navigate("/portal")}
          className="text-white/80 hover:text-white transition-colors">
          <FaArrowLeft />
        </button>
        <h1 className="text-white font-bold text-lg flex-1">Learning Resources</h1>
        <span className="text-white/70 text-sm">{resources.length} resources</span>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-6">

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-500 px-5 py-3 rounded-2xl font-dm-sans text-sm">{error}</div>
        )}

        {/* Search */}
        <div className="relative">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 text-sm" />
          <input type="text" placeholder="Search resources..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl
                       font-dm-sans text-sm text-gray-700 focus:outline-none focus:border-[#f056f0]
                       shadow-sm transition-colors" />
        </div>

        {/* Category tabs */}
        {!loading && usedCategories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 -mb-1">
            <button onClick={() => setActiveTab("all")}
              className={`flex-shrink-0 px-4 py-2 rounded-full font-dm-sans text-sm font-semibold
                          transition-colors whitespace-nowrap
                          ${activeTab === "all"
                            ? "bg-[#f056f0] text-white"
                            : "bg-white text-gray-500 hover:bg-gray-50 border border-gray-200"}`}>
              All ({resources.length})
            </button>
            {usedCategories.map(cat => (
              <button key={cat} onClick={() => setActiveTab(cat)}
                className={`flex-shrink-0 px-4 py-2 rounded-full font-dm-sans text-sm font-semibold
                            transition-colors whitespace-nowrap
                            ${activeTab === cat
                              ? "bg-[#f056f0] text-white"
                              : "bg-white text-gray-500 hover:bg-gray-50 border border-gray-200"}`}>
                {cat} ({resources.filter(r => r.category === cat).length})
              </button>
            ))}
          </div>
        )}

        {/* Resources */}
        {loading ? <Skeleton /> : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl py-20 text-center shadow-sm">
            <FaBookOpen className="text-4xl text-gray-200 mx-auto mb-3" />
            <p className="font-dm-sans text-sm text-gray-400">
              {search ? "No resources match your search." : "No resources available yet."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map(r => (
              <div key={r._id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden
                           hover:shadow-md transition-shadow duration-200">
                {/* Top gradient or image */}
                <div className={`h-32 relative overflow-hidden bg-gradient-to-br ${catColor(r.category)}`}>
                  {r.image ? (
                    <img src={r.image} alt={r.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FaBookOpen className="text-5xl text-white/30" />
                    </div>
                  )}
                  {/* Category pill */}
                  <span className="absolute bottom-2 left-3 px-2.5 py-1 bg-white/90 backdrop-blur-sm
                                   rounded-full font-dm-sans text-[10px] font-bold text-gray-700 shadow-sm">
                    {r.category}
                  </span>
                </div>

                <div className="p-4">
                  <p className="font-jost font-bold text-gray-800 text-sm line-clamp-1">{r.title}</p>
                  {(r.subject || r.classLevel) && (
                    <p className="font-dm-sans text-xs text-gray-400 mt-0.5">
                      {[r.subject, r.classLevel].filter(Boolean).join(" · ")}
                    </p>
                  )}
                  {r.description && (
                    <p className="font-dm-sans text-xs text-gray-500 mt-2 line-clamp-2 leading-5">
                      {r.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2 mt-3">
                    {r.url && (
                      <a href={r.url} target="_blank" rel="noreferrer"
                        className="flex items-center gap-1.5 px-4 py-2 bg-[#f056f0] text-white rounded-full
                                   font-dm-sans text-xs font-semibold hover:bg-[#525fe1] transition-colors">
                        <FaExternalLinkAlt className="text-[10px]" /> Open
                      </a>
                    )}
                    {r.attachment && (
                      <a href={r.attachment} target="_blank" rel="noreferrer"
                        className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-full
                                   font-dm-sans text-xs text-gray-600 hover:border-[#f056f0]
                                   hover:text-[#f056f0] transition-colors">
                        <FaDownload className="text-[10px]" /> Download
                      </a>
                    )}
                    {!r.url && !r.attachment && (
                      <span className="font-dm-sans text-xs text-gray-300">No link or file attached</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}