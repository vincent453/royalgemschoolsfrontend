// Parent / Student portal — Receipt History section
// Drop this into ParentDashboard.jsx / StudentDashboard.jsx alongside SchoolFees
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaEye, FaDownload } from "react-icons/fa";
import { getMyReceipts, downloadReceiptPdf } from "../../services/receiptApi";

const fmt = (n) => `₦${Number(n || 0).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export default function ReceiptHistory() {
  const navigate = useNavigate();
  const [receipts, setReceipts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [search,   setSearch]   = useState("");
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    getMyReceipts()
      .then(data => setReceipts(Array.isArray(data) ? data : []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return receipts;
    return receipts.filter(r =>
      r.receiptNumber?.toLowerCase().includes(q) ||
      r.paymentReference?.toLowerCase().includes(q)
    );
  }, [receipts, search]);

  const handleDownload = async (r) => {
    setDownloadingId(r._id);
    try {
      await downloadReceiptPdf(r._id, `${r.receiptNumber}.pdf`);
    } catch (e) {
      alert(e.message);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
        <h3 className="font-jost font-bold text-gray-800 text-lg">Receipt History</h3>
        <div className="relative w-48">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-xs pointer-events-none" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search receipts…"
            className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-full font-dm-sans text-xs
                       text-gray-700 focus:outline-none focus:border-[#f056f0] transition-colors"
          />
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">{error}</div>}

      {loading ? (
        <div className="flex items-center justify-center py-10 gap-3 text-gray-400">
          <span className="w-5 h-5 border-2 border-[#f056f0] border-t-transparent rounded-full animate-spin" />
          <span className="font-dm-sans text-sm">Loading receipts…</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-10 text-center font-dm-sans text-sm text-gray-400">
          No receipts found.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(r => (
            <div key={r._id}
              className="flex items-center justify-between gap-4 p-4 rounded-xl border border-gray-100
                         hover:border-[#f056f0]/30 hover:bg-[#fdf8ff] transition-all duration-200">
              <div>
                <p className="font-dm-sans font-semibold text-gray-700 text-sm">{r.receiptNumber}</p>
                <p className="font-dm-sans text-xs text-gray-400 mt-0.5">
                  {r.term} · {r.session} · {fmtDate(r.issuedAt)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <p className="font-jost font-bold text-gray-800 text-sm">{fmt(r.amount)}</p>
                <button
                  onClick={() => navigate(`/portal/receipt/${r._id}`)}
                  className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-colors"
                  title="View"
                >
                  <FaEye className="text-xs" />
                </button>
                <button
                  onClick={() => handleDownload(r)}
                  disabled={downloadingId === r._id}
                  className="p-2 bg-[#f056f0]/10 hover:bg-[#f056f0]/20 text-[#f056f0] rounded-full transition-colors disabled:opacity-50"
                  title="Download"
                >
                  {downloadingId === r._id
                    ? <span className="w-3 h-3 border-2 border-[#f056f0] border-t-transparent rounded-full animate-spin block" />
                    : <FaDownload className="text-xs" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}