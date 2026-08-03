import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "https://royalgemschoolsbackend.vercel.app";

export default function LearningDashboard() {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    Promise.all([
      fetch(`${API}/api/learning/assignments`, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(`${API}/api/learning/resources`, { headers: { Authorization: `Bearer ${token}` } }),
    ])
      .then(async ([assignRes, resourceRes]) => {
        const [assignData, resourceData] = await Promise.all([assignRes.json(), resourceRes.json()]);
        setAssignments(Array.isArray(assignData) ? assignData : []);
        setResources(Array.isArray(resourceData) ? resourceData : []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-6 text-sm text-gray-500">Loading learning workspace…</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Learning Management</h1>
          <p className="text-sm text-gray-500">Assignments, submissions, and shared learning resources.</p>
        </div>
        <button
          onClick={() => navigate("/admin/learning/assignments")}
          className="px-4 py-2 rounded-xl bg-[#f056f0] text-white text-sm font-semibold"
        >
          Manage Assignments
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Recent Assignments</h2>
            <span className="text-sm text-gray-400">{assignments.length}</span>
          </div>
          <div className="space-y-3">
            {assignments.slice(0, 4).map((item) => (
              <div key={item._id} className="border rounded-xl p-3">
                <p className="font-semibold text-sm text-gray-700">{item.title}</p>
                <p className="text-xs text-gray-400">{item.subject} • {item.classLevel}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Learning Resources</h2>
            <span className="text-sm text-gray-400">{resources.length}</span>
          </div>
          <div className="space-y-3">
            {resources.slice(0, 4).map((item) => (
              <div key={item._id} className="border rounded-xl p-3">
                <p className="font-semibold text-sm text-gray-700">{item.title}</p>
                <p className="text-xs text-gray-400">{item.subject} • {item.resourceType}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
