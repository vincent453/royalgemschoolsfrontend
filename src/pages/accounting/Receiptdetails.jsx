// Replaces the earlier FeeStatement-based ReceiptDetails.jsx.
// Now renders a permanent Receipt record (with a real receipt number)
// instead of building a view on the fly from a FeeStatement.
import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { FiArrowLeft, FiPrinter, FiDownload } from "react-icons/fi";
import { getReceiptById, downloadReceiptPdf } from "../../services/receiptApi";

const fmt = (n) => `₦${Number(n || 0).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }) : "—";

const StatusBadge = ({ status }) => (
  <span className={`px-3 py-1 rounded-full text-xs font-semibold
    ${status === "issued" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
    {status === "issued" ? "Issued" : "Void"}
  </span>
);

export default function ReceiptDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    getReceiptById(id)
      .then(data => {
        setReceipt(data);
        // Auto-print if ?print=1 in URL
        if (searchParams.get("print") === "1") {
          setTimeout(() => window.print(), 400);
        }
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadReceiptPdf(id, `${receipt.receiptNumber}.pdf`);
    } catch (e) {
      alert(e.message);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#E6EBEE]">
      <span className="w-8 h-8 border-2 border-[#f056f0] border-t-transparent rounded-full animate-spin block" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-[#E6EBEE]">
      <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-2xl text-sm">{error}</div>
    </div>
  );

  if (!receipt) return null;

  return (
    <div className="min-h-screen bg-[#E6EBEE] print:bg-white">
      {/* Toolbar */}
      <div className="print:hidden sticky top-0 z-40 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between shadow-sm">
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 font-dm-sans text-sm text-gray-500 hover:text-[#f056f0] transition-colors">
          <FiArrowLeft /> Back
        </button>
        <div className="flex items-center gap-3">
          <button onClick={() => window.print()}
            className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-full font-dm-sans text-sm
                       font-semibold text-gray-700 hover:border-[#f056f0] hover:text-[#f056f0] transition-colors">
            <FiPrinter /> Print Receipt
          </button>
          <button onClick={handleDownload} disabled={downloading}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#f056f0] hover:bg-[#525fe1] rounded-full font-dm-sans text-sm
                       font-semibold text-white transition-colors disabled:opacity-50">
            {downloading
              ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <FiDownload />}
            Download PDF
          </button>
        </div>
      </div>

      {/* Receipt */}
      <div className="max-w-2xl mx-auto p-6 print:p-0 print:max-w-full">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 print:shadow-none print:border-0 print:rounded-none">

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
              { label: "Student Name",     value: `${receipt.student?.firstName ?? ""} ${receipt.student?.lastName ?? ""}`.trim() },
              { label: "Registration No.", value: receipt.student?.regNumber },
              { label: "Class",            value: receipt.classLevel },
              { label: "Session",          value: receipt.session },
              { label: "Term",             value: receipt.term },
              { label: "Date Issued",      value: fmtDate(receipt.issuedAt) },
            ].map(r => (
              <div key={r.label}>
                <p className="font-dm-sans text-xs text-gray-400 uppercase tracking-wide">{r.label}</p>
                <p className="font-dm-sans font-semibold text-gray-700 mt-0.5">{r.value || "—"}</p>
              </div>
            ))}
          </div>

          {/* Payment details */}
          <div className="mb-6">
            <p className="font-jost font-bold text-gray-800 mb-3">Payment Details</p>
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-gray-50">
                  <tr>
                    <td className="px-4 py-3 font-dm-sans text-gray-500">Description</td>
                    <td className="px-4 py-3 font-dm-sans font-semibold text-gray-700 text-right">{receipt.description}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-dm-sans text-gray-500">Payment Method</td>
                    <td className="px-4 py-3 font-dm-sans font-semibold text-gray-700 text-right capitalize">
                      {receipt.paymentMethod?.replace("_", " ")}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-dm-sans text-gray-500">Transaction Reference</td>
                    <td className="px-4 py-3 font-dm-sans font-semibold text-gray-700 text-right">
                      {receipt.paymentReference || "—"}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-dm-sans text-gray-500">Cashier</td>
                    <td className="px-4 py-3 font-dm-sans font-semibold text-gray-700 text-right">
                      {receipt.paymentGateway === "paystack" ? "Paystack (Online)" : receipt.issuedBy?.name ?? "Admin"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Amount paid */}
          <div className="bg-[#f056f0] rounded-2xl p-5 flex items-center justify-between text-white mb-2">
            <p className="font-dm-sans text-sm">Amount Paid</p>
            <p className="font-jost font-black text-2xl">{fmt(receipt.amount)}</p>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-4 border-t border-gray-100 text-center">
            <p className="font-dm-sans text-xs text-gray-400">
              This is a computer-generated receipt and does not require a signature.
            </p>
            <p className="font-dm-sans text-xs text-gray-400 mt-1">
              Generated on {fmtDate(new Date())} · Royal Gem Schools
            </p>
          </div>
        </div>
      </div>

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