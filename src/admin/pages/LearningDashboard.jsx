import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Slidebar from "../components/layout/Slidebar";
import Topbar from "../components/layout/Topbar";

const API = "https://royalgemschoolsbackend.vercel.app";

const fallbackAssignments = [
  { _id: "demo-1", title: "English Comprehension Task", subject: "English", classLevel: "JSS 1", dueDate: "2026-08-10" },
  { _id: "demo-2", title: "Basic Algebra Practice", subject: "Mathematics", classLevel: "SSS 1", dueDate: "2026-08-12" },
];

const fallbackResources = [
  { _id: "demo-r1", title: "Reading Guide", subject: "English", classLevel: "JSS 1", resourceType: "Document" },
  { _id: "demo-r2", title: "Science Revision Video", subject: "Science", classLevel: "SSS 1", resourceType: "Video" },
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

export default function LearningDashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [assignments, setAssignments] = useState(fallbackAssignments);
  const [resources, setResources] = useState(fallbackResources);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem("token");
        const [assignRes, resourceRes] = await Promise.all([
          fetch(`${API}/api/learning/assignments`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API}/api/learning/resources`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const [assignData, resourceData] = await Promise.all([readJsonSafely(assignRes), readJsonSafely(resourceRes)]);
        const nextAssignments = Array.isArray(assignData) && assignData.length ? assignData : fallbackAssignments;
        const nextResources = Array.isArray(resourceData) && resourceData.length ? resourceData : fallbackResources;

        setAssignments(nextAssignments);
        setResources(nextResources);
        setError(assignRes.ok && resourceRes.ok ? "" : "Live learning data is temporarily unavailable. Showing a ready-to-use view.");
      } catch (err) {
        setAssignments(fallbackAssignments);
        setResources(fallbackResources);
        setError("The learning connection is unavailable right now. Showing a ready-to-use view.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

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
          <div className="p-4 md:p-6">
            <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="font-jost font-bold text-gray-800 text-3xl">Learning Management</h1>
                <p className="font-dm-sans text-gray-400 text-sm mt-1">Assignments, submissions, and shared learning resources.</p>
              </div>
              <button
                onClick={() => navigate("/admin/learning/assignments")}
                className="px-4 py-2 rounded-xl bg-[#f056f0] text-white text-sm font-semibold"
              >
                Manage Assignments
              </button>
            </div>

            {error && (
              <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <p className="text-xs uppercase tracking-wide text-gray-400">Assignments</p>
                <p className="mt-2 text-3xl font-bold text-gray-800">{assignments.length}</p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <p className="text-xs uppercase tracking-wide text-gray-400">Resources</p>
                <p className="mt-2 text-3xl font-bold text-gray-800">{resources.length}</p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <p className="text-xs uppercase tracking-wide text-gray-400">Status</p>
                <p className="mt-2 text-lg font-semibold text-[#f056f0]">{loading ? "Loading…" : "Ready"}</p>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-jost font-bold text-gray-800 text-lg">Recent Assignments</h2>
                  <span className="text-sm text-gray-400">{assignments.length}</span>
                </div>
                <div className="space-y-3">
                  {assignments.slice(0, 4).map((item) => (
                    <div key={item._id} className="border border-gray-100 rounded-xl p-3">
                      <p className="font-semibold text-sm text-gray-700">{item.title}</p>
                      <p className="text-xs text-gray-400 mt-1">{item.subject} • {item.classLevel}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-jost font-bold text-gray-800 text-lg">Learning Resources</h2>
                  <span className="text-sm text-gray-400">{resources.length}</span>
                </div>
                <div className="space-y-3">
                  {resources.slice(0, 4).map((item) => (
                    <div key={item._id} className="border border-gray-100 rounded-xl p-3">
                      <p className="font-semibold text-sm text-gray-700">{item.title}</p>
                      <p className="text-xs text-gray-400 mt-1">{item.subject} • {item.resourceType}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
