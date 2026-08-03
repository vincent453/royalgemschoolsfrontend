import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaChartBar, FaDownload, FaPrint } from "react-icons/fa";
import Slidebar from "../../admin/components/layout/Slidebar";
import Topbar from "../../admin/components/layout/Topbar";
import { getReports } from "../../services/scholarshipApi";

const fmt = (n) => `₦${Number(n || 0).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;

export default function ScholarshipReports() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({ totalBeneficiaries: 0, scholarshipValue: 0 });

  useEffect(() => {
    getReports({}).then((data) => {
      const list = data.reports ?? [];
      setReports(list);
      setStats({ totalBeneficiaries: data.totalBeneficiaries ?? 0, scholarshipValue: data.scholarshipValue ?? 0 });
    }).catch(() => {});
  }, []);

  return (
    <div className="flex flex-col h-[100dvh] bg-[#E6EBEE] overflow-x-hidden">
      <div className="sticky top-0 z-50 w-full"><Topbar onMenuToggle={() => setSidebarOpen((p) => !p)} /></div>
      <div className="flex flex-1 overflow-hidden">
        <div className="-mt-16"><Slidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} /></div>
        <main className="w-full overflow-y-auto">
          <div className="max-w-7xl mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-jost font-bold text-2xl text-gray-800">Scholarship Reports</h1>
                <p className="font-dm-sans text-sm text-gray-400 mt-1">Summary of beneficiary coverage and scholarship value.</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => window.print()} className="flex items-center gap-2 border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-600 hover:border-[#f056f0] hover:text-[#f056f0]"><FaPrint /> Print</button>
                <button onClick={() => navigate("/admin/scholarships/beneficiaries")} className="flex items-center gap-2 bg-[#f056f0] hover:bg-[#525fe1] text-white px-4 py-2 rounded-full text-sm"><FaDownload /> Export</button>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"><p className="font-dm-sans text-xs text-gray-400 uppercase tracking-wide">Total Beneficiaries</p><p className="font-jost font-bold text-2xl text-gray-800 mt-2">{stats.totalBeneficiaries}</p></div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"><p className="font-dm-sans text-xs text-gray-400 uppercase tracking-wide">Scholarship Value</p><p className="font-jost font-bold text-2xl text-emerald-600 mt-2">{fmt(stats.scholarshipValue)}</p></div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2"><FaChartBar className="text-[#f056f0]" /><h2 className="font-jost font-bold text-gray-800">Beneficiary Report</h2></div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50"><tr>{["Student","Scholarship","Class","Discount","Status"].map((h) => <th key={h} className="px-5 py-3 text-left font-dm-sans text-xs text-gray-400 uppercase tracking-wide">{h}</th>)}</tr></thead>
                  <tbody className="divide-y divide-gray-50">{reports.map((item) => <tr key={item._id} className="hover:bg-[#fdf8ff] transition-colors"><td className="px-5 py-4 font-dm-sans text-sm text-gray-700">{item.student?.firstName} {item.student?.lastName}</td><td className="px-5 py-4 font-dm-sans text-sm text-gray-700">{item.scholarship?.scholarshipName}</td><td className="px-5 py-4 font-dm-sans text-sm text-gray-700">{item.student?.classLevel}</td><td className="px-5 py-4 font-jost font-bold text-emerald-600">{fmt(item.discountAmount)}</td><td className="px-5 py-4 font-dm-sans text-sm text-gray-700">{item.status}</td></tr>)}</tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
