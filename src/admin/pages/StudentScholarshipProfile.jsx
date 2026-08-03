import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft, FaGraduationCap, FaUsers } from "react-icons/fa";
import Slidebar from "../../admin/components/layout/Slidebar";
import Topbar from "../../admin/components/layout/Topbar";
import { getStudentScholarshipProfile } from "../../services/scholarshipApi";

const fmt = (n) => `₦${Number(n || 0).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;

export default function StudentScholarshipProfile() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [student, setStudent] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    getStudentScholarshipProfile(id).then((data) => {
      setStudent(data.student);
      setAssignments(data.assignments ?? []);
      setHistory(data.history ?? []);
    }).catch(() => {});
  }, [id]);

  return (
    <div className="flex flex-col h-[100dvh] bg-[#E6EBEE] overflow-x-hidden">
      <div className="sticky top-0 z-50 w-full"><Topbar onMenuToggle={() => setSidebarOpen((p) => !p)} /></div>
      <div className="flex flex-1 overflow-hidden">
        <div className="-mt-16"><Slidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} /></div>
        <main className="w-full overflow-y-auto">
          <div className="max-w-6xl mx-auto p-6 space-y-6">
            <button onClick={() => navigate("/admin/scholarships/beneficiaries")} className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#f056f0]">
              <FaArrowLeft /> Back to beneficiaries
            </button>
            {student && (
              <>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h1 className="font-jost font-bold text-2xl text-gray-800">{student.firstName} {student.lastName}</h1>
                  <p className="font-dm-sans text-sm text-gray-400 mt-1">{student.regNumber} · {student.classLevel} · {student.gender}</p>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h2 className="font-jost font-bold text-gray-800 border-b border-gray-100 pb-3 mb-4">Scholarship History</h2>
                    {assignments.length === 0 ? <p className="font-dm-sans text-sm text-gray-400">No scholarship history.</p> : assignments.map((item) => <div key={item._id} className="border-b border-gray-50 py-3 last:border-b-0"><p className="font-dm-sans font-semibold text-gray-700">{item.scholarship?.scholarshipName}</p><p className="font-dm-sans text-xs text-gray-400">{item.status} · Discount {fmt(item.discountAmount)}</p></div>)}
                  </div>
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h2 className="font-jost font-bold text-gray-800 border-b border-gray-100 pb-3 mb-4">Audit Trail</h2>
                    {history.length === 0 ? <p className="font-dm-sans text-sm text-gray-400">No audit trail recorded.</p> : history.map((entry) => <div key={entry._id} className="border-b border-gray-50 py-3 last:border-b-0"><p className="font-dm-sans font-semibold text-gray-700">{entry.action}</p><p className="font-dm-sans text-xs text-gray-400">{entry.reason || "No reason provided"}</p></div>)}
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
