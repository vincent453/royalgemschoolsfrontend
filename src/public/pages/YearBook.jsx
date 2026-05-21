import { useState, useEffect, useRef } from "react";
import { FaSearch, FaTimes, FaStar, FaQuoteLeft, FaChevronDown, FaBook } from "react-icons/fa";

const CLASSES = ["All", "JSS 1", "JSS 2", "JSS 3", "SS 1", "SS 2", "SS 3"];
const SESSIONS = ["2024/2025", "2023/2024", "2022/2023"];

// ── Fetch yearbook entries ─────────────────────────────────────────
const fetchYearbook = async (session) => {
  const res = await fetch(`/api/yearbook/public?session=${session}`);
  if (!res.ok) throw new Error("Failed to load yearbook");
  return res.json();
};

// ── Initials avatar ───────────────────────────────────────────────
const Avatar = ({ name, size = "lg" }) => {
  const initials = name.split(" ").map((w) => w[0]?.toUpperCase() ?? "").slice(0, 2).join("");
  const colors   = [
    "from-[#A033A0] to-[#6d1b6d]",
    "from-[#1a6fb5] to-[#0c447c]",
    "from-[#c0392b] to-[#922b21]",
    "from-[#16a085] to-[#0e6655]",
    "from-[#d35400] to-[#a04000]",
  ];
  const color = colors[name.charCodeAt(0) % colors.length];
  const sz    = size === "lg" ? "w-full h-full text-2xl" : "w-full h-full text-sm";

  return (
    <div className={`bg-gradient-to-br ${color} ${sz} flex items-center justify-center font-bold text-white`}>
      {initials}
    </div>
  );
};

// ── Featured card (large) ─────────────────────────────────────────
const FeaturedCard = ({ entry, index }) => (
  <div
    className="group relative bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100
               hover:shadow-2xl hover:-translate-y-1 transition-all duration-500"
    style={{ animationDelay: `${index * 80}ms` }}
  >
    {/* Gold accent bar */}
    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500" />

    {/* Featured badge */}
    <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 bg-amber-50 border border-amber-200
                    text-amber-600 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
      <FaStar className="text-[9px]" /> Featured
    </div>

    <div className="flex flex-col sm:flex-row">
      {/* Photo */}
      <div className="relative w-full sm:w-48 h-52 sm:h-auto shrink-0 bg-gradient-to-br from-[#f5eaf5] to-[#e8d0e8] overflow-hidden">
        {entry.photo
          ? <img src={entry.photo} alt={entry.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          : <Avatar name={entry.name} />
        }
        {/* Diagonal overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent sm:bg-gradient-to-r" />
      </div>

      {/* Content */}
      <div className="flex-1 p-6 flex flex-col gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-extrabold text-gray-900 text-xl tracking-tight">{entry.name}</h3>
            {entry.nickname && (
              <span className="text-xs text-[#A033A0] bg-[#f5eaf5] px-2 py-0.5 rounded-full font-semibold border border-[#A033A0]/20">
                "{entry.nickname}"
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-1 font-medium">{entry.regNumber} · {entry.classArm}</p>
        </div>

        {entry.quote && (
          <div className="relative pl-5 border-l-2 border-[#A033A0]/30">
            <FaQuoteLeft className="absolute -left-1 -top-1 text-[#A033A0]/20 text-lg" />
            <p className="text-sm text-gray-600 italic leading-relaxed">{entry.quote}</p>
          </div>
        )}

        {entry.ambition && (
          <p className="text-sm text-gray-500">
            <span className="font-semibold text-gray-700">Ambition: </span>{entry.ambition}
          </p>
        )}

        {entry.awards?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-auto">
            {entry.awards.map((a, i) => (
              <span key={i} className="text-[10px] bg-[#f5eaf5] text-[#7a2079] border border-[#A033A0]/15
                                       px-2.5 py-1 rounded-full font-semibold">
                🏅 {a}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
);

// ── Regular card ──────────────────────────────────────────────────
const StudentCard = ({ entry, index }) => (
  <div
    className="group bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100
               hover:shadow-xl hover:-translate-y-2 transition-all duration-500 flex flex-col"
    style={{ animationDelay: `${index * 60}ms` }}
  >
    {/* Photo */}
    <div className="relative h-52 bg-gradient-to-br from-[#f5eaf5] to-[#e0c8e0] overflow-hidden">
      {entry.photo
        ? <img src={entry.photo} alt={entry.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        : <Avatar name={entry.name} />
      }

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white/90 to-transparent" />

      {/* Name overlay */}
      <div className="absolute bottom-3 left-4 right-4">
        <h3 className="font-extrabold text-gray-900 text-base leading-tight truncate">{entry.name}</h3>
        {entry.nickname && (
          <p className="text-[11px] text-[#A033A0] font-semibold mt-0.5">"{entry.nickname}"</p>
        )}
      </div>
    </div>

    {/* Content */}
    <div className="p-4 flex flex-col gap-3 flex-1">
      <p className="text-[11px] text-gray-400 font-medium">{entry.regNumber} · {entry.classArm}</p>

      {entry.quote && (
        <div className="relative pl-3 border-l-2 border-[#A033A0]/25">
          <p className="text-xs text-gray-500 italic leading-relaxed line-clamp-2">{entry.quote}</p>
        </div>
      )}

      {entry.ambition && (
        <p className="text-xs text-gray-500 line-clamp-1">
          <span className="font-semibold text-gray-600">Dreams of: </span>{entry.ambition}
        </p>
      )}

      {entry.awards?.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-auto pt-2 border-t border-gray-50">
          {entry.awards.slice(0, 3).map((a, i) => (
            <span key={i} className="text-[10px] bg-[#f5eaf5] text-[#7a2079] px-2 py-0.5 rounded-full font-medium">
              {a}
            </span>
          ))}
          {entry.awards.length > 3 && (
            <span className="text-[10px] text-gray-400">+{entry.awards.length - 3} more</span>
          )}
        </div>
      )}
    </div>
  </div>
);

// ── Class section divider ─────────────────────────────────────────
const ClassDivider = ({ label, count }) => (
  <div className="flex items-center gap-4 py-2">
    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#A033A0]/30 to-transparent" />
    <div className="flex items-center gap-2 bg-white border border-[#A033A0]/20 rounded-full px-5 py-1.5 shadow-sm">
      <span className="text-sm font-bold text-[#A033A0]">{label}</span>
      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{count} students</span>
    </div>
    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#A033A0]/30 to-transparent" />
  </div>
);

// ── Main yearbook page ────────────────────────────────────────────
export default function Yearbook() {
  const [entries, setEntries]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [search, setSearch]       = useState("");
  const [filterClass, setFilterClass]     = useState("All");
  const [filterSession, setFilterSession] = useState("2024/2025");
  const [mounted, setMounted]     = useState(false);
  const heroRef = useRef();

  useEffect(() => {
    setTimeout(() => setMounted(true), 100);
  }, []);

  useEffect(() => {
    setLoading(true); setError("");
    fetchYearbook(filterSession)
      .then(setEntries)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [filterSession]);

  // Filter + group
  const filtered = entries.filter((e) => {
    const q     = search.toLowerCase();
    const matchQ = !q || e.name.toLowerCase().includes(q) || e.regNumber.toLowerCase().includes(q) || e.nickname?.toLowerCase().includes(q);
    const matchC = filterClass === "All" || e.classArm === filterClass;
    return matchQ && matchC;
  });

  const featured = filtered.filter((e) => e.isFeatured);
  const regular  = filtered.filter((e) => !e.isFeatured);

  // Group regular entries by class
  const byClass = regular.reduce((acc, e) => {
    const key = e.classArm || "Other";
    if (!acc[key]) acc[key] = [];
    acc[key].push(e);
    return acc;
  }, {});

  const classOrder = ["JSS 1","JSS 2","JSS 3","SS 1","SS 2","SS 3","Other"];
  const sortedClasses = classOrder.filter((c) => byClass[c]);

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans">

      {/* ── HERO ── */}
      <div
        ref={heroRef}
        className="relative overflow-hidden bg-gradient-to-br from-[#A033A0] via-[#7a2079] to-[#4a0f4a] text-white"
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "32px 32px" }} />

        {/* Blobs */}
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-0 left-10 w-60 h-60 rounded-full bg-white/5 blur-2xl" />

        <div className={`relative z-10 max-w-6xl mx-auto px-6 py-16 flex flex-col items-center text-center gap-4
          transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>

          {/* Logo + school name */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-white/15 border-2 border-white/30 flex items-center justify-center text-2xl">
              💎
            </div>
            <span className="font-semibold text-white/80 text-sm tracking-widest uppercase">Royal Gem Schools</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-px w-16 bg-white/30" />
            <FaBook className="text-white/60 text-sm" />
            <div className="h-px w-16 bg-white/30" />
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">
            Year<span className="text-amber-300">book</span>
          </h1>
          <p className="text-white/70 text-lg max-w-md leading-relaxed">
            Celebrating the brilliant minds, big dreams, and unforgettable moments of {filterSession}.
          </p>

          {/* Session selector */}
          <div className="flex items-center gap-3 mt-2">
            {SESSIONS.map((s) => (
              <button
                key={s}
                onClick={() => setFilterSession(s)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 cursor-pointer border-none
                  ${filterSession === s
                    ? "bg-white text-[#A033A0] shadow-lg"
                    : "bg-white/15 text-white/80 hover:bg-white/25 border border-white/20"
                  }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Stats */}
          {!loading && (
            <div className="flex gap-8 mt-4 text-center">
              {[
                { label: "Students",  val: entries.length   },
                { label: "Featured",  val: entries.filter(e => e.isFeatured).length },
                { label: "Classes",   val: sortedClasses.length },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-3xl font-black text-white">{s.val}</p>
                  <p className="text-xs text-white/60 uppercase tracking-wider mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" className="w-full">
            <path d="M0 60L1440 60L1440 20C1200 60 900 0 720 20C540 40 240 0 0 20L0 60Z" fill="#fafafa" />
          </svg>
        </div>
      </div>

      {/* ── CONTROLS ── */}
      <div className="max-w-6xl mx-auto px-6 -mt-2 mb-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-4 flex flex-wrap gap-3 items-center">

          {/* Search */}
          <div className="relative flex-1 min-w-52">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 text-xs" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, nickname or reg number…"
              className="w-full h-10 pl-9 pr-4 rounded-xl border border-gray-200 bg-[#fafafa]
                         text-sm text-gray-700 placeholder-gray-300 focus:outline-none
                         focus:border-[#A033A0] focus:ring-2 focus:ring-[#A033A0]/15 transition-all"
            />
          </div>

          {/* Class pills */}
          <div className="flex flex-wrap gap-1.5">
            {CLASSES.map((c) => (
              <button
                key={c}
                onClick={() => setFilterClass(c)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer border
                  ${filterClass === c
                    ? "bg-[#A033A0] text-white border-[#A033A0] shadow-md shadow-[#A033A0]/20"
                    : "bg-white text-gray-500 border-gray-200 hover:border-[#A033A0]/40 hover:text-[#A033A0]"
                  }`}
              >
                {c}
              </button>
            ))}
          </div>

          {search && (
            <button
              onClick={() => setSearch("")}
              className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center
                         text-gray-500 transition-colors cursor-pointer border-none"
            >
              <FaTimes className="text-xs" />
            </button>
          )}
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="max-w-6xl mx-auto px-6 pb-20 flex flex-col gap-12">

        {loading ? (
          <div className="flex flex-col gap-8">
            <div className="grid grid-cols-1 gap-4">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="bg-white rounded-3xl h-40 animate-pulse border border-gray-100" />
              ))}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-3xl h-72 animate-pulse border border-gray-100" />
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-3">📖</p>
            <p className="font-semibold text-gray-600">Could not load yearbook</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 flex flex-col items-center gap-3">
            <div className="w-20 h-20 rounded-full bg-[#f5eaf5] flex items-center justify-center text-4xl">🎓</div>
            <p className="font-bold text-gray-700 text-lg">No entries found</p>
            <p className="text-sm text-gray-400">Try a different name or filter</p>
          </div>
        ) : (
          <>
            {/* Featured section */}
            {featured.length > 0 && (
              <section className="flex flex-col gap-5">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">⭐</span>
                  <h2 className="font-black text-2xl text-gray-900 tracking-tight">Featured Students</h2>
                  <div className="h-px flex-1 bg-gradient-to-r from-amber-200 to-transparent" />
                </div>
                <div className="flex flex-col gap-4">
                  {featured.map((entry, i) => (
                    <FeaturedCard key={entry._id} entry={entry} index={i} />
                  ))}
                </div>
              </section>
            )}

            {/* Regular entries by class */}
            {sortedClasses.length > 0 && (
              <section className="flex flex-col gap-10">
                {filterClass === "All" && featured.length > 0 && (
                  <div className="flex items-center gap-4">
                    <div className="h-px flex-1 bg-gray-200" />
                    <span className="text-sm font-semibold text-gray-400 uppercase tracking-widest">All Students</span>
                    <div className="h-px flex-1 bg-gray-200" />
                  </div>
                )}

                {sortedClasses.map((cls) => (
                  <div key={cls} className="flex flex-col gap-5">
                    <ClassDivider label={cls} count={byClass[cls].length} />
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                      {byClass[cls].map((entry, i) => (
                        <StudentCard key={entry._id} entry={entry} index={i} />
                      ))}
                    </div>
                  </div>
                ))}
              </section>
            )}

            {/* If filtering by one class, no grouping needed */}
            {filterClass !== "All" && !sortedClasses.length && regular.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {regular.map((entry, i) => (
                  <StudentCard key={entry._id} entry={entry} index={i} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* ── FOOTER ── */}
      <div className="bg-gradient-to-br from-[#A033A0] to-[#6d1b6d] text-white py-10 px-6 text-center">
        <div className="max-w-xl mx-auto flex flex-col items-center gap-2">
          <span className="text-3xl">💎</span>
          <p className="font-black text-xl tracking-tight">Royal Gem Schools</p>
          <p className="text-white/60 text-sm italic">Nurturing to Flourish</p>
          <div className="h-px w-24 bg-white/20 my-2" />
          <p className="text-white/50 text-xs">{filterSession} Yearbook · All rights reserved</p>
        </div>
      </div>
    </div>
  );
}