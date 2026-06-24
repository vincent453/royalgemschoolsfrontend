import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiUsers, FiBookOpen, FiCheckSquare, FiUpload,
  FiLogOut, FiMenu, FiX
} from "react-icons/fi";
import Slidebar from "../components/layout/Slidebar";
import Topbar from "../components/layout/Topbar";

const API = import.meta.env.VITE_API_URL ?? "https://royalgemschoolsbackend.vercel.app";

const StatCard = ({ icon, label, value, color }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
      {icon}
    </div>
    <div>
      <p className="font-dm-sans text-xs text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="font-jost font-bold text-2xl text-gray-800 mt-0.5">{value}</p>
    </div>
  </div>
);

const QuickAction = ({ icon, label, description, onClick, color }) => (
  <button
    onClick={onClick}
    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 text-left
               hover:border-[#f056f0]/40 hover:shadow-md transition-all duration-200 flex items-start gap-4"
  >
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
      {icon}
    </div>
    <div>
      <p className="font-jost font-semibold text-gray-800 text-sm">{label}</p>
      <p className="font-dm-sans text-xs text-gray-400 mt-0.5">{description}</p>
    </div>
  </button>
);

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [teacher,     setTeacher]     = useState(null);
  const [students,    setStudents]    = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [recentResults, setRecentResults] = useState([]);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }

    // Decode teacher info from token
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setTeacher({ role: payload.role, id: payload.id });
    } catch {
      navigate("/login");
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      fetch(`${API}/api/students`,       { headers }).then(r => r.json()),
      fetch(`${API}/api/assignments/my`, { headers }).then(r => r.json()),
      fetch(`${API}/api/results`,        { headers }).then(r => r.json()),
      fetch(`${API}/api/users/profile`,  { headers }).then(r => r.json()),
    ])
      .then(([studentsData, assignmentsData, resultsData, profileData]) => {
        setStudents(Array.isArray(studentsData) ? studentsData : []);
        setAssignments(Array.isArray(assignmentsData) ? assignmentsData : []);

        // Enrich teacher state with profile (subject, assignedClass from User model)
        if (profileData && !profileData.message) {
          setTeacher(prev => ({ ...prev, profile: profileData }));
        }

        // Recent 5 results
        const results = Array.isArray(resultsData) ? resultsData : [];
        setRecentResults(results.slice(0, 5));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Subjects and classes — from SubjectAssignment records first,
  // then fall back to the User profile fields (subject, assignedClass)
  // saved when the account was created in AddUsers
  const profile        = teacher?.profile ?? {};
  const profileSubject = profile.subject       ?? "";
  const profileClass   = profile.assignedClass ?? "";
  // assignedClasses is an array saved for subject teachers
  const profileClasses = Array.isArray(profile.assignedClasses)
    ? profile.assignedClasses.filter(Boolean)
    : [];

  const myClasses = (() => {
    const fromAssignments = assignments.flatMap(a => a.classLevels ?? []);
    if (fromAssignments.length) return [...new Set(fromAssignments)];
    if (profileClasses.length)  return [...new Set(profileClasses)];
    return profileClass ? [profileClass] : [];
  })();

  const mySubjects = (() => {
    const fromAssignments = assignments.map(a => a.subject).filter(Boolean);
    if (fromAssignments.length) return [...new Set(fromAssignments)];
    // profile.subject may be comma-separated e.g. "Mathematics, English"
    if (profileSubject) {
      return profileSubject.split(",").map(s => s.trim()).filter(Boolean);
    }
    return [];
  })();

  return (
    <div className="flex flex-col h-[100dvh] bg-[#E6EBEE] overflow-x-hidden">
      <div className="sticky top-0 z-50 w-full">
        <Topbar onMenuToggle={() => setSidebarOpen(p => !p)} />
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="-mt-16">
          <Slidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        </div>

        <main className="w-full overflow-y-auto">
          <div className="max-w-6xl mx-auto p-6 flex flex-col gap-6">

            {/* ── Welcome Banner ── */}
            <div className="bg-gradient-to-r from-[#f056f0] to-[#525fe1] rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-dm-sans text-white/70 text-sm">Welcome back</p>
                  <h1 className="font-jost font-bold text-2xl mt-0.5">Teacher Portal</h1>
                  <p className="font-dm-sans text-white/80 text-sm mt-1">
                    {mySubjects.length > 0
                      ? `Subject: ${mySubjects.join(", ")}`
                      : "No subjects assigned yet"}
                  </p>
                  <p className="font-dm-sans text-white/70 text-sm mt-0.5">
                    {myClasses.length > 0
                      ? `Class: ${myClasses.join(", ")}`
                      : "No class assigned yet"}
                  </p>
                </div>
                <div className="hidden md:flex flex-col items-end gap-2">
                  {myClasses.map(c => (
                    <span key={c} className="px-3 py-1.5 bg-white/20 rounded-full text-xs font-dm-sans font-bold">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Stat Cards ── */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl h-24 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                  icon={<FiUsers className="text-[#f056f0] text-xl" />}
                  label="My Students"
                  value={students.length}
                  color="bg-pink-50"
                />
                <StatCard
                  icon={<FiBookOpen className="text-[#525fe1] text-xl" />}
                  label="Subjects"
                  value={mySubjects.length}
                  color="bg-indigo-50"
                />
                <StatCard
                  icon={<FiCheckSquare className="text-emerald-500 text-xl" />}
                  label="Classes"
                  value={myClasses.length}
                  color="bg-emerald-50"
                />
                <StatCard
                  icon={<FiUpload className="text-amber-500 text-xl" />}
                  label="Results"
                  value={recentResults.length}
                  color="bg-amber-50"
                />
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* ── Quick Actions ── */}
              <div className="lg:col-span-1 flex flex-col gap-4">
                <h2 className="font-jost font-bold text-gray-800 text-lg">Quick Actions</h2>
                <div className="flex flex-col gap-3">
                  <QuickAction
                    icon={<FiUpload className="text-[#f056f0] text-base" />}
                    label="Upload Subject Scores"
                    description="Enter marks for your assigned subject"
                    onClick={() => navigate("/teacher/upload-subject-result")}
                    color="bg-pink-50"
                  />
                  <QuickAction
                    icon={<FiCheckSquare className="text-[#525fe1] text-base" />}
                    label="Finalize Results"
                    description="Publish complete result cards for students"
                    onClick={() => navigate("/teacher/finalize-result")}
                    color="bg-indigo-50"
                  />
                  <QuickAction
                    icon={<FiUsers className="text-emerald-600 text-base" />}
                    label="View Students"
                    description="Browse all students in your class"
                    onClick={() => navigate("/admin/students")}
                    color="bg-emerald-50"
                  />
                  <QuickAction
                    icon={<FiBookOpen className="text-amber-500 text-base" />}
                    label="View Results"
                    description="Check uploaded results and report cards"
                    onClick={() => navigate("/admin/results")}
                    color="bg-amber-50"
                  />
                </div>
              </div>

              {/* ── My Assignments + Recent Results ── */}
              <div className="lg:col-span-2 flex flex-col gap-6">

                {/* Assignments */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="font-jost font-bold text-gray-800">My Assignments</h2>
                    <p className="font-dm-sans text-xs text-gray-400 mt-0.5">Subjects you're assigned to teach</p>
                  </div>
                  {loading ? (
                    <div className="p-6 space-y-3">
                      {[...Array(2)].map((_, i) => (
                        <div key={i} className="h-10 bg-gray-100 rounded-xl animate-pulse" />
                      ))}
                    </div>
                  ) : assignments.length === 0 && !profileSubject && !profileClass ? (
                    <div className="py-10 text-center font-dm-sans text-sm text-gray-400">
                      No assignments yet. Contact admin.
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-50">
                      {/* Show from SubjectAssignment records if they exist */}
                      {assignments.length > 0 && assignments.map((a) => (
                        <div key={a._id} className="px-6 py-3 flex items-center justify-between">
                          <div>
                            <p className="font-dm-sans font-semibold text-gray-700 text-sm">{a.subject}</p>
                            <p className="font-dm-sans text-xs text-gray-400 mt-0.5">{a.session}</p>
                          </div>
                          <div className="flex flex-wrap gap-1 justify-end">
                            {(a.classLevels ?? []).map(c => (
                              <span key={c} className="px-2 py-0.5 bg-[#f056f0]/10 text-[#f056f0]
                                                       text-xs font-dm-sans font-semibold rounded-full">
                                {c}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                      {/* Fallback: show profile subject+class when no assignment records */}
                      {assignments.length === 0 && (profileSubject || profileClass) && (
                        <div className="px-6 py-3 flex items-center justify-between">
                          <div>
                            <p className="font-dm-sans font-semibold text-gray-700 text-sm">
                              {profileSubject || "No subject set"}
                            </p>
                            <p className="font-dm-sans text-xs text-gray-400 mt-0.5">
                              Set on account — assign via admin for full tracking
                            </p>
                          </div>
                          {profileClass && (
                            <span className="px-2 py-0.5 bg-[#f056f0]/10 text-[#f056f0]
                                             text-xs font-dm-sans font-semibold rounded-full">
                              {profileClass}
                            </span>
                          )}
                          {profileClasses.map(c => (
                            <span key={c} className="px-2 py-0.5 bg-[#f056f0]/10 text-[#f056f0]
                                             text-xs font-dm-sans font-semibold rounded-full">
                              {c}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Recent Results */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="font-jost font-bold text-gray-800">Recent Results</h2>
                    <p className="font-dm-sans text-xs text-gray-400 mt-0.5">Latest published result cards</p>
                  </div>
                  {loading ? (
                    <div className="p-6 space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-10 bg-gray-100 rounded-xl animate-pulse" />
                      ))}
                    </div>
                  ) : recentResults.length === 0 ? (
                    <div className="py-10 text-center font-dm-sans text-sm text-gray-400">
                      No results published yet.
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-50">
                      {recentResults.map((r) => {
                        const s = r.student ?? {};
                        const name = s.firstName
                          ? `${s.firstName} ${s.lastName}`
                          : s.name ?? "Unknown";
                        return (
                          <div key={r._id} className="px-6 py-3 flex items-center justify-between
                                                        hover:bg-[#fdf8ff] transition-colors duration-150">
                            <div className="flex items-center gap-3">
                              {s.profilePhoto ? (
                                <img src={s.profilePhoto} alt={name}
                                  className="w-8 h-8 rounded-full object-cover shrink-0" />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-[#f056f0]/10 flex items-center
                                                justify-center shrink-0">
                                  <span className="text-[#f056f0] font-bold text-xs">
                                    {name[0]}
                                  </span>
                                </div>
                              )}
                              <div>
                                <p className="font-dm-sans font-semibold text-gray-700 text-sm">{name}</p>
                                <p className="font-dm-sans text-xs text-gray-400">
                                  {r.term} · {r.session}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`font-jost font-bold text-sm
                                ${Number(r.average) >= 70 ? "text-emerald-600"
                                  : Number(r.average) >= 50 ? "text-amber-500"
                                  : "text-red-500"}`}>
                                {r.average}%
                              </span>
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-dm-sans font-semibold
                                ${r.resultStatus === "Pass"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-red-100 text-red-500"}`}>
                                {r.resultStatus}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>  
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}