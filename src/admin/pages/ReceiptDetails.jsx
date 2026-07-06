import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiPrinter, FiDownload } from "react-icons/fi";

const API  = "https://royalgemschoolsbackend.vercel.app";
const fmt  = (n) => `₦${Number(n || 0).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }) : "—";

const StatusBadge = ({ status }) => {
  const map = { paid: "bg-emerald-100 text-emerald-700", partial: "bg-amber-100 text-amber-700", pending: "bg-red-100 text-red-600" };
  return <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${map[status] ?? "bg-gray-100 text-gray-500"}`}>{status}</span>;
};

export default function ReceiptDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const printRef = useRef(null);
  const [receipt, setReceipt] = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token") || localStorage.getItem("portalToken");
    fetch(`${API}/api/receipts/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        if (data.message && !data._id) throw new Error(data.message);
        setReceipt(data);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handlePrint = () => window.print();

  const handleDownload = async () => {
    // Open print dialog — browser can save as PDF
    window.print();
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#E6EBEE]">
      <div className="text-center">
        <span className="w-8 h-8 border-2 border-[#f056f0] border-t-transparent rounded-full animate-spin block mx-auto mb-3" />
        <p className="font-dm-sans text-sm text-gray-400">Loading receipt…</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-[#E6EBEE]">
      <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-2xl text-sm">{error}</div>
    </div>
  );

  if (!receipt) return null;

  const student = receipt.student || {};
  const feeStatement = receipt.feeStatement || {};

  return (
    <div className="min-h-screen bg-[#E6EBEE] print:bg-white">
      {/* Toolbar — hidden when printing */}
      <div className="print:hidden sticky top-0 z-40 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between shadow-sm">
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 font-dm-sans text-sm text-gray-500 hover:text-[#f056f0] transition-colors">
          <FiArrowLeft /> Back
        </button>
        <div className="flex items-center gap-3">
          <button onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-full font-dm-sans text-sm
                       font-semibold text-gray-700 hover:border-[#f056f0] hover:text-[#f056f0] transition-colors">
            <FiPrinter /> Print Receipt
          </button>
          <button onClick={handleDownload}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#f056f0] hover:bg-[#525fe1] rounded-full font-dm-sans text-sm
                       font-semibold text-white transition-colors">
            <FiDownload /> Download PDF
          </button>
        </div>
      </div>

      {/* Receipt */}
      <div className="max-w-2xl mx-auto p-6 print:p-0 print:max-w-full">
        <div ref={printRef}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 print:shadow-none print:border-0 print:rounded-none">

          {/* School header */}
          <div className="flex items-center justify-between border-b border-gray-100 pb-6 mb-6">
            <div>
              <h1 className="font-jost font-black text-gray-800 text-2xl">Royal Gem Schools</h1>
              <p className="font-dm-sans text-xs text-gray-400 mt-1">Nurturing to Flourish</p>
            </div>
            <div className="text-right">
              <p className="font-dm-sans text-xs text-gray-400 uppercase tracking-wide">Receipt</p>
              <p className="font-jost font-bold text-[#f056f0] text-lg mt-0.5">{receipt.receiptNumber}</p>
              <StatusBadge status={receipt.status} />
            </div>
          </div>

          {/* Student info */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            {[
              { label: "Student Name",      value: `${student.firstName} ${student.lastName}` },
              { label: "Admission Number",  value: student.regNumber },
              { label: "Class",             value: receipt.classLevel || student.classLevel },
              { label: "Session",           value: receipt.session },
              { label: "Term",              value: receipt.term },
              { label: "Issued Date",       value: fmtDate(receipt.issuedAt) },
            ].map(r => (
              <div key={r.label}>
                <p className="font-dm-sans text-xs text-gray-400 uppercase tracking-wide">{r.label}</p>
                <p className="font-dm-sans font-semibold text-gray-700 mt-0.5">{r.value || "—"}</p>
              </div>
            ))}
          </div>

          {/* Fee items */}
          <div className="mb-6">
            <p className="font-jost font-bold text-gray-800 mb-3">Payment Details</p>
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-dm-sans text-xs text-gray-400 font-semibold uppercase tracking-wide">Description</th>
                    <th className="px-4 py-3 text-right font-dm-sans text-xs text-gray-400 font-semibold uppercase tracking-wide">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  <tr>
                    <td className="px-4 py-3 font-dm-sans text-gray-700">{receipt.description || "Payment"}</td>
                    <td className="px-4 py-3 font-dm-sans text-gray-700 text-right">{fmt(receipt.amount)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment summary */}
          <div className="border-t border-gray-100 pt-4 space-y-2">
            {[
              { label: "Payment Method", value: receipt.paymentMethod?.toUpperCase() || "—", bold: false },
              { label: "Payment Reference", value: receipt.paymentReference || receipt.paymentGateway, bold: false },
              { label: "Amount Paid", value: fmt(receipt.amount), bold: true, color: "text-emerald-600" },
            ].map(r => (
              <div key={r.label} className="flex items-center justify-between">
                <p className={`font-dm-sans text-sm ${r.bold ? "font-bold text-gray-800" : "text-gray-500"}`}>{r.label}</p>
                <p className={`font-jost font-bold text-lg ${r.color ?? "text-gray-800"}`}>{r.value}</p>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-8 pt-4 border-t border-gray-100 text-center">
            <p className="font-dm-sans text-xs text-gray-400">
              This is a computer-generated receipt. No signature required.
            </p>
            <p className="font-dm-sans text-xs text-gray-400 mt-1">
              Generated on {fmtDate(receipt.issuedAt)} · Royal Gem Schools
            </p>
          </div>
        </div>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print\\:bg-white, .print\\:bg-white * { visibility: visible; }
          .print\\:bg-white { position: absolute; left: 0; top: 0; width: 100%; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}