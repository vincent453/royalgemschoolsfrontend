import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "https://royalgemschoolsbackend.vercel.app";

export default function StudentLearningPortal() {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [resources, setResources] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [studentId, setStudentId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("portalToken");
    if (!token) {
      navigate("/portal");
      return;
    }

    const payload = JSON.parse(atob(token.split(".")[1]));
    setStudentId(payload.studentId);

    Promise.all([
      fetch(`${API}/api/learning/assignments?studentId=${payload.studentId}`),
      fetch(`${API}/api/learning/resources?classLevel=JSS1`),
      fetch(`${API}/api/learning/submissions?studentId=${payload.studentId}`),
    ])
      .then(async ([assignRes, resourceRes, subRes]) => {
        const [assignData, resourceData, subData] = await Promise.all([assignRes.json(), resourceRes.json(), subRes.json()]);
        setAssignments(Array.isArray(assignData) ? assignData : []);
        setResources(Array.isArray(resourceData) ? resourceData : []);
        setSubmissions(Array.isArray(subData) ? subData : []);
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const submitAssignment = async (assignmentId) => {
    const token = localStorage.getItem("portalToken");
    const response = await fetch(`${API}/api/learning/submissions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ assignment: assignmentId, student: studentId, content: "Submitted via portal", status: "Submitted" }),
    });
    if (response.ok) {
      const data = await response.json();
      setSubmissions((prev) => [data, ...prev]);
    }
  };

  if (loading) return <div className="p-6 text-sm text-gray-500">Loading your learning workspace…</div>;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">My Learning</h1>
        <p className="text-sm text-gray-500">Assignments, submissions, and resources for your class.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Assignments</h2>
          <div className="space-y-3">
            {assignments.map((item) => (
              <div key={item._id} className="border rounded-xl p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-sm text-gray-700">{item.title}</p>
                    <p className="text-xs text-gray-400">{item.subject} • Due {new Date(item.dueDate).toLocaleDateString()}</p>
                  </div>
                  <button onClick={() => submitAssignment(item._id)} className="text-xs bg-[#f056f0] text-white px-3 py-1 rounded-full">Submit</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Resources</h2>
          <div className="space-y-3">
            {resources.map((item) => (
              <div key={item._id} className="border rounded-xl p-3">
                <p className="font-semibold text-sm text-gray-700">{item.title}</p>
                <p className="text-xs text-gray-400">{item.subject}</p>
                {item.url && <a href={item.url} target="_blank" rel="noreferrer" className="text-xs text-[#f056f0]">Open</a>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-5">
        <h2 className="font-semibold text-gray-800 mb-4">My Submissions</h2>
        <div className="space-y-3">
          {submissions.map((item) => (
            <div key={item._id} className="border rounded-xl p-3 flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm text-gray-700">{item.assignment?.title || "Assignment"}</p>
                <p className="text-xs text-gray-400">Status: {item.status}</p>
              </div>
              <span className="text-xs text-gray-500">{item.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
