import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaAward, FaGraduationCap, FaCalendarAlt, FaUsers, FaChartBar, FaPlus } from "react-icons/fa";
import Slidebar from "../../admin/components/layout/Slidebar";
import Topbar from "../../admin/components/layout/Topbar";
import { getScholarships, getBeneficiaries } from "../../services/scholarshipApi";

const fmt = (n) => `₦${Number(n || 0).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;

export default function ScholarshipDashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({ total: 0, active: 0, expired: 0, beneficiaries: 0 });
  const [scholarships, setScholarships] = useState([]);
  const [beneficiaries, setBeneficiaries] = useState([]);

  useEffect(() => {
    Promise.all([getScholarships({ limit: 100 }), getBeneficiaries({ limit: 10, status: "Active" })])
      .then(([scholarshipData, beneficiaryData]) => {
        const list = scholarshipData.scholarships ?? [];
        setScholarships(list);
        setStats({
          total: list.length,
          active: list.filter((s) => s.status === "Active").length,
          expired: list.filter((s) => s.status === "Expired").length,
          beneficiaries: beneficiaryData.total ?? 0,
        });
        setBeneficiaries(beneficiaryData.assignments ?? []);
      })
      .catch(() => {});
  }, []);

  const cards = [
    { label: "Total Scholarships", value: stats.total, icon: <FaGraduationCap />, color: "bg-[#f056f0]/10 text-[#f056f0]" },
    { label: "Active Scholarships", value: stats.active, icon: <FaAward />, color: "bg-emerald-100 text-emerald-600" },
    { label: "Expired Scholarships", value: stats.expired, icon: <FaCalendarAlt />, color: "bg-amber-100 text-amber-600" },
    { label: "Students on Scholarship", value: stats.beneficiaries, icon: <FaUsers />, color: "bg-blue-100 text-blue-600" },
  ];

  return (
    <div className="flex flex-col h-[100dvh] bg-[#E6EBEE] overflow-x-hidden">
      <div className="sticky top-0 z-50 w-full"><Topbar onMenuToggle={() => setSidebarOpen((p) => !p)} /></div>
      <div className="flex flex-1 overflow-hidden">
        <div className="-mt-16"><Slidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} /></div>
        <main className="w-full overflow-y-auto">
          <div className="max-w-7xl mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-jost font-bold text-2xl text-gray-800">Scholarship Dashboard</h1>
                <p className="font-dm-sans text-sm text-gray-400 mt-1">Overview of scholarships, awards, and beneficiaries.</p>
              </div>
              <button onClick={() => navigate("/admin/scholarships/new")} className="flex items-center gap-2 bg-[#f056f0] hover:bg-[#525fe1] text-white px-5 py-2.5 rounded-full font-jost font-semibold text-sm transition-colors">
                <FaPlus /> Add Scholarship
              </button>
            </div>

            <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
              {cards.map((card) => (
                <div key={card.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${card.color}`}>{card.icon}</div>
                  <p className="font-dm-sans text-xs text-gray-400 uppercase tracking-wide mt-3">{card.label}</p>
                  <p className="font-jost font-bold text-2xl text-gray-800 mt-1">{card.value}</p>
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-4"><FaChartBar className="text-[#f056f0]" /><h2 className="font-jost font-bold text-gray-800">Recent Scholarships</h2></div>
                <div className="space-y-3">
                  {scholarships.slice(0, 5).map((s) => (
                    <div key={s._id} className="flex items-center justify-between border-b border-gray-50 pb-3 last:border-b-0">
                      <div>
                        <p className="font-dm-sans font-semibold text-gray-700 text-sm">{s.scholarshipName}</p>
                        <p className="font-dm-sans text-xs text-gray-400">{s.type} · {s.applicableSession || "All sessions"}</p>
                      </div>
                      <span className="text-xs font-semibold text-[#f056f0]">{s.status}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-4"><FaUsers className="text-[#f056f0]" /><h2 className="font-jost font-bold text-gray-800">Recent Beneficiaries</h2></div>
                <div className="space-y-3">
                  {beneficiaries.slice(0, 5).map((item) => (
                    <div key={item._id} className="flex items-center justify-between border-b border-gray-50 pb-3 last:border-b-0">
                      <div>
                        <p className="font-dm-sans font-semibold text-gray-700 text-sm">{item.student?.firstName} {item.student?.lastName}</p>
                        <p className="font-dm-sans text-xs text-gray-400">{item.scholarship?.scholarshipName}</p>
                      </div>
                      <span className="font-jost font-bold text-sm text-emerald-600">{fmt(item.discountAmount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
