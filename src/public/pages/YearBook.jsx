import { useState, useEffect } from "react";
import { FaSearch, FaTimes, FaStar, FaQuoteLeft, FaGraduationCap, FaTrophy } from "react-icons/fa";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Foooter";

const CLASSES  = ["All", "Kindergarten", "Nursery 1", "Nursery 2", "JSS 1", "JSS 2", "JSS 3", "SSS 1", "SSS 2", "SSS 3"];
const SESSIONS = ["2024/2025", "2023/2024", "2022/2023"];

// ── Fetch ─────────────────────────────────────────────────────────
const fetchYearbook = async (session) => {
  const res = await fetch(
    `https://royalgemschoolsbackend.vercel.app/api/yearbook/public?session=${encodeURIComponent(session)}`
  );
  if (!res.ok) throw new Error("Failed to load yearbook");
  const ct = res.headers.get("content-type") ?? "";
  if (!ct.includes("application/json"))
    throw new Error("Server returned an unexpected response.");
  return res.json();
};

// ── Avatar ────────────────────────────────────────────────────────
const Avatar = ({ name }) => {
  const initials = name.split(" ").map((w) => w[0]?.toUpperCase() ?? "").slice(0, 2).join("");
  const palettes = [
    ["#A033A0", "#6d1b6d"],
    ["#525fe1", "#3340c4"],
    ["#0e9f6e", "#057a55"],
    ["#e3a008", "#c27803"],
    ["#e02424", "#9b1c1c"],
    ["#1a56db", "#1e429f"],
  ];
  const [from, to] = palettes[name.charCodeAt(0) % palettes.length];
  return (
    <div
      className="w-full h-full flex items-center justify-center text-white font-bold text-3xl select-none"
      style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
    >
      {initials}
    </div>
  );
};

// ── Featured card ─────────────────────────────────────────────────
const FeaturedCard = ({ entry }) => (
  
  <div className="group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col sm:flex-row">
    {/* Photo */}
    <div className="relative w-full sm:w-52 h-56 sm:h-auto flex-shrink-0 overflow-hidden bg-purple-50">
      {entry.photo
        ? <img src={entry.photo} alt={entry.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        : <Avatar name={entry.name} />
      }
      <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-amber-400 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md">
        <FaStar className="text-[8px]" /> Featured
      </div>
    </div>

    {/* Info */}
    <div className="flex-1 p-6 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h3 className="font-bold text-gray-900 text-xl leading-tight">{entry.name}</h3>
          {entry.nickname && (
            <p className="text-sm text-[#A033A0] font-semibold mt-0.5">"{entry.nickname}"</p>
          )}
          <p className="text-xs text-gray-400 mt-1">{entry.regNumber}</p>
        </div>
        <span className="text-xs font-semibold bg-purple-50 text-[#A033A0] border border-purple-100 px-3 py-1.5 rounded-full whitespace-nowrap">
          {entry.classArm}
        </span>
      </div>

      {entry.quote && (
        <div className="flex gap-3 bg-purple-50 rounded-2xl px-4 py-3">
          <FaQuoteLeft className="text-purple-200 text-base flex-shrink-0 mt-0.5" />
          <p className="text-sm text-gray-600 italic leading-relaxed">{entry.quote}</p>
        </div>
      )}

      {entry.ambition && (
        <p className="text-sm text-gray-500">
          <span className="font-semibold text-gray-700">Ambition — </span>{entry.ambition}
        </p>
      )}

      {entry.awards?.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-auto pt-1">
          {entry.awards.map((a, i) => (
            <span key={i} className="flex items-center gap-1.5 text-xs bg-amber-50 text-amber-700 border border-amber-100 px-3 py-1 rounded-full font-semibold">
              <FaTrophy className="text-[9px] text-amber-400" /> {a}
            </span>
          ))}
        </div>
      )}
    </div>
  </div>
);

// ── Student card ──────────────────────────────────────────────────
const StudentCard = ({ entry }) => (
  <div className="group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
    {/* Photo */}
    <div className="relative h-48 flex-shrink-0 overflow-hidden bg-purple-50">
      {entry.photo
        ? <img src={entry.photo} alt={entry.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        : <Avatar name={entry.name} />
      }
    </div>

    {/* Info */}
    <div className="p-4 flex flex-col gap-2 flex-1">
      <div>
        <h3 className="font-bold text-gray-900 text-sm leading-tight">{entry.name}</h3>
        {entry.nickname && (
          <p className="text-[11px] text-[#A033A0] font-semibold mt-0.5">"{entry.nickname}"</p>
        )}
      </div>

      <div className="flex items-center justify-between gap-1">
        <span className="text-[10px] text-gray-400">{entry.regNumber}</span>
        <span className="text-[10px] font-semibold bg-purple-50 text-[#A033A0] px-2 py-0.5 rounded-full border border-purple-100">
          {entry.classArm}
        </span>
      </div>

      {entry.quote && (
        <p className="text-[11px] text-gray-500 italic line-clamp-2 leading-relaxed pl-2 border-l-2 border-purple-100">
          {entry.quote}
        </p>
      )}

      {entry.ambition && (
        <p className="text-[11px] text-gray-500 line-clamp-1 mt-auto">
          <span className="font-semibold text-gray-600">Dreams: </span>{entry.ambition}
        </p>
      )}

      {entry.awards?.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-2 border-t border-gray-50 mt-auto">
          {entry.awards.slice(0, 2).map((a, i) => (
            <span key={i} className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-medium">
              {a}
            </span>
          ))}
          {entry.awards.length > 2 && (
            <span className="text-[10px] text-gray-400">+{entry.awards.length - 2} more</span>
          )}
        </div>
      )}
    </div>
  </div>
);

// ── Skeleton ──────────────────────────────────────────────────────
const Skeleton = () => (
  <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 animate-pulse">
    <div className="h-48 bg-gray-100" />
    <div className="p-4 flex flex-col gap-2.5">
      <div className="h-3 bg-gray-100 rounded-full w-3/4" />
      <div className="h-2.5 bg-gray-100 rounded-full w-1/2" />
      <div className="h-2.5 bg-gray-100 rounded-full w-full" />
      <div className="h-2.5 bg-gray-100 rounded-full w-4/5" />
    </div>
  </div>
);

// ── Main ──────────────────────────────────────────────────────────
export default function Yearbook() {
  const [entries,       setEntries]       = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState("");
  const [search,        setSearch]        = useState("");
  const [filterClass,   setFilterClass]   = useState("All");
  const [filterSession, setFilterSession] = useState("2024/2025");

  const load = (session) => {
    setLoading(true); setError("");
    fetchYearbook(session)
      .then(setEntries)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(filterSession); }, [filterSession]);

  // ── Filter + group ──
  const filtered = entries.filter((e) => {
    const q      = search.toLowerCase();
    const matchQ = !q || e.name.toLowerCase().includes(q) || e.regNumber.toLowerCase().includes(q) || (e.nickname ?? "").toLowerCase().includes(q);
    const matchC = filterClass === "All" || e.classArm === filterClass;
    return matchQ && matchC;
  });

  const featured = filtered.filter((e) => e.isFeatured);
  const regular  = filtered.filter((e) => !e.isFeatured);

  const byClass = regular.reduce((acc, e) => {
    const key = e.classArm || "Other";
    if (!acc[key]) acc[key] = [];
    acc[key].push(e);
    return acc;
  }, {});

  const classOrder    = ["Kindergarten", "Nursery 1", "Nursery 2", "JSS 1", "JSS 2", "JSS 3", "SSS 1", "SSS 2", "SSS 3", "Other"];
  const sortedClasses = classOrder.filter((c) => byClass[c]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans overflow-x-hidden">
      <Navbar />
      {/* ── NAVBAR ─────────────────────────────────────────────────── */}
      <nav className="mt-[8rem] bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* <div className="w-9 h-9 rounded-xl bg-[#A033A0] flex items-center justify-center">
              <FaGraduationCap className="text-white text-sm" />
            </div>
            <div className="leading-tight hidden sm:block">
              <p className="font-bold text-gray-900 text-sm">Royal Gem Schools</p>
              <p className="text-[10px] text-gray-400">Yearbook</p>
            </div> */}
          </div>

          {/* Session tabs */}
          <div className="flex items-center gap-1.5 bg-gray-100 rounded-xl p-1">
            {SESSIONS.map((s) => (
              <button
                key={s}
                onClick={() => setFilterSession(s)}
                className={`text-xs font-semibold px-4 py-1.5 rounded-lg transition-all duration-200
                  ${filterSession === s
                    ? "bg-white text-[#A033A0] shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* ── HERO BANNER ────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col items-center text-center gap-4">
          <div className="inline-flex items-center gap-2 bg-purple-50 border border-purple-100 text-[#A033A0] text-xs font-semibold px-4 py-1.5 rounded-full">
            <FaGraduationCap className="text-[10px]" /> {filterSession} Academic Session
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight leading-none">
            Class <span className="text-[#A033A0]">Yearbook</span>
          </h1>
          <p className="text-gray-400 text-base max-w-md leading-relaxed">
            Celebrating the brilliant minds, big dreams, and unforgettable memories of our graduating students.
          </p>

          {/* Stats */}
          {!loading && !error && (
            <div className="flex items-center gap-6 mt-2 flex-wrap justify-center">
              {[
                { value: entries.length,                            label: "Students"  },
                { value: entries.filter(e => e.isFeatured).length,  label: "Featured"  },
                { value: sortedClasses.length,                      label: "Classes"   },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-2xl font-black text-gray-900">{s.value}</p>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">{s.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── SEARCH & FILTER ────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-6 py-5">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-3 items-center">
          {/* Search input */}
          <div className="relative flex-1 min-w-[200px]">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 text-xs" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, nickname or reg number…"
              className="w-full h-10 pl-9 pr-10 rounded-xl border border-gray-200 bg-gray-50
                         text-sm text-gray-700 placeholder-gray-300
                         focus:outline-none focus:border-[#A033A0] focus:bg-white transition-all duration-200"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
                <FaTimes className="text-xs" />
              </button>
            )}
          </div>

          {/* Class filter */}
          <div className="flex flex-wrap gap-1.5">
            {CLASSES.map((c) => (
              <button
                key={c}
                onClick={() => setFilterClass(c)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all duration-200
                  ${filterClass === c
                    ? "bg-[#A033A0] text-white border-[#A033A0] shadow-sm"
                    : "bg-white text-gray-500 border-gray-200 hover:border-[#A033A0] hover:text-[#A033A0]"
                  }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── CONTENT ────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-6 pb-20 flex flex-col gap-10">

        {/* Loading */}
        {loading && (
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-3">
              <div className="bg-white rounded-3xl h-48 border border-gray-100 animate-pulse" />
              <div className="bg-white rounded-3xl h-48 border border-gray-100 animate-pulse" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => <Skeleton key={i} />)}
            </div>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center py-20 gap-4">
            <p className="text-5xl">📖</p>
            <p className="font-bold text-gray-800 text-lg">Could not load yearbook</p>
            <p className="text-sm text-gray-400">{error}</p>
            <button
              onClick={() => load(filterSession)}
              className="mt-2 px-6 py-2.5 bg-[#A033A0] text-white text-sm font-semibold rounded-full hover:bg-[#8a2a8a] transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filtered.length === 0 && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center py-24 gap-3">
            <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center text-3xl">🎓</div>
            <p className="font-bold text-gray-800">No students found</p>
            <p className="text-sm text-gray-400">Try a different name, class, or session</p>
          </div>
        )}

        {/* Results */}
        {!loading && !error && filtered.length > 0 && (
          <>
            {/* Featured */}
            {featured.length > 0 && (
              <section className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <h2 className="font-bold text-gray-900 text-base flex items-center gap-2">
                    <span className="text-amber-400">⭐</span> Featured Students
                  </h2>
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs text-gray-400">{featured.length} student{featured.length !== 1 ? "s" : ""}</span>
                </div>
                <div className="flex flex-col gap-3">
                  {featured.map((e) => <FeaturedCard key={e._id} entry={e} />)}
                </div>
              </section>
            )}

            {/* By class */}
            {sortedClasses.map((cls) => (
              <section key={cls} className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <h2 className="font-bold text-gray-900 text-base">{cls}</h2>
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs text-gray-400 bg-white border border-gray-200 px-2.5 py-1 rounded-full">
                    {byClass[cls].length} student{byClass[cls].length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {byClass[cls].map((e) => <StudentCard key={e._id} entry={e} />)}
                </div>
              </section>
            ))}

            {/* Flat grid when one class selected */}
            {filterClass !== "All" && sortedClasses.length === 0 && regular.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {regular.map((e) => <StudentCard key={e._id} entry={e} />)}
              </div>
            )}
          </>
        )}
      </div>

  
      <Footer />
    </div>
  );
}