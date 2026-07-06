// School Fees page for Parent Portal
// Route: /parent/fees or shown as a section inside ParentDashboard
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiCreditCard, FiFileText } from "react-icons/fi";

const API  = "https://royalgemschoolsbackend.vercel.app";
const fmt  = (n) => `₦${Number(n || 0).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const StatusBadge = ({ status }) => {
  const map   = { paid: "bg-emerald-100 text-emerald-700", partial: "bg-amber-100 text-amber-700", pending: "bg-red-100 text-red-600" };
  const label = { paid: "Paid", partial: "Partial", pending: "Unpaid" };
  return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${map[status] ?? "bg-gray-100 text-gray-500"}`}>{label[status] ?? status}</span>;
};

export default function SchoolFees() {
  const navigate = useNavigate();
  const [fees,    setFees]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [paying,  setPaying]  = useState(null); // fee id being paid
  const [error,   setError]   = useState("");
  const [toast,   setToast]   = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("portalToken");
    if (!token) { navigate("/portal"); return; }
    fetch(`${API}/api/fees/me/all`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => setFees(Array.isArray(data) ? data : []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [navigate]);
  const handlePay = async (feeId) => {
    setPaying(feeId);
    try {
      const token = localStorage.getItem("portalToken");
      const res   = await fetch(`${API}/api/fees/paystack/initialize`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ feeStatementId: feeId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to initialize payment");
      window.location.href = data.authorizationUrl;
    } catch (e) {
      setToast({ type: "error", msg: e.message });
      setTimeout(() => setToast(null), 4000);
    } finally {
      setPaying(null);
    }
  };

  const totalDue  = fees.reduce((s, f) => s + (f.amountDue  || 0), 0);
  const totalPaid = fees.reduce((s, f) => s + (f.amountPaid || 0), 0);
  const totalBal  = fees.reduce((s, f) => s + (f.balance    || 0), 0);

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">{error}</div>
      )}

      {/* Summary */}
      {!loading && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Fees",   value: fmt(totalDue),  color: "text-gray-800"   },
            { label: "Amount Paid",  value: fmt(totalPaid), color: "text-emerald-600" },
            { label: "Outstanding",  value: fmt(totalBal),  color: "text-red-500"     },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center">
              <p className="font-dm-sans text-xs text-gray-400">{s.label}</p>
              <p className={`font-jost font-bold text-xl mt-1 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Fee list */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="font-jost font-bold text-gray-800 text-lg mb-4 border-b border-gray-100 pb-3">
          Fee Statements
        </h3>

        {loading ? (
          <div className="flex items-center justify-center py-10 gap-3 text-gray-400">
            <span className="w-5 h-5 border-2 border-[#f056f0] border-t-transparent rounded-full animate-spin" />
            <span className="font-dm-sans text-sm">Loading…</span>
          </div>
        ) : fees.length === 0 ? (
          <div className="py-10 text-center font-dm-sans text-sm text-gray-400">
            No fee statements found.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {fees.map(fee => (
              <div key={fee._id}
                className="border border-gray-100 rounded-2xl p-5 hover:border-[#f056f0]/30 transition-all duration-200">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <p className="font-dm-sans font-semibold text-gray-700 text-sm">
                      {fee.term} — {fee.session}
                    </p>
                    <p className="font-dm-sans text-xs text-gray-400 mt-0.5">
                      Due: {fmtDate(fee.dueDate)} · Ref: {fee.reference}
                    </p>
                  </div>
                  <StatusBadge status={fee.status} />
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[
                    { label: "Total",   value: fmt(fee.amountDue),  color: "text-gray-700"   },
                    { label: "Paid",    value: fmt(fee.amountPaid), color: "text-emerald-600" },
                    { label: "Balance", value: fmt(fee.balance),    color: "text-red-500"     },
                  ].map(s => (
                    <div key={s.label} className="bg-gray-50 rounded-xl py-2 text-center">
                      <p className={`font-jost font-bold text-sm ${s.color}`}>{s.value}</p>
                      <p className="font-dm-sans text-xs text-gray-400">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Items */}
                {(fee.items ?? []).length > 0 && (
                  <div className="mb-4 border border-gray-100 rounded-xl overflow-hidden">
                    {fee.items.map((item, i) => (
                      <div key={i} className="flex justify-between px-4 py-2.5 border-b border-gray-50 last:border-b-0">
                        <span className="font-dm-sans text-xs text-gray-600">{item.title}</span>
                        <span className="font-dm-sans text-xs font-semibold text-gray-700">{fmt(item.amount)}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <button
                    onClick={async () => {
                      try {
                        const token = localStorage.getItem("portalToken");
                        const res = await fetch(`${API}/api/receipts/byFeeStatement/${fee._id}`, {
                          headers: { Authorization: `Bearer ${token}` }
                        });
                        const receipt = await res.json();
                        if (receipt._id) {
                          navigate(`/portal/receipt/${receipt._id}`);
                        } else {
                          setToast({ type: "error", msg: receipt.message || "Receipt not found" });
                          setTimeout(() => setToast(null), 4000);
                        }
                      } catch (e) {
                        setToast({ type: "error", msg: e.message });
                        setTimeout(() => setToast(null), 4000);
                      }
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-full
                               font-dm-sans text-xs font-semibold text-gray-600
                               hover:border-[#f056f0] hover:text-[#f056f0] transition-colors"
                  >
                    <FiFileText /> View Receipt
                  </button>

                  {fee.status !== "paid" && (
                    <button
                      onClick={() => handlePay(fee._id)}
                      disabled={paying === fee._id}
                      className="flex items-center gap-1.5 px-4 py-2 bg-[#f056f0] hover:bg-[#525fe1] rounded-full
                                 font-dm-sans text-xs font-semibold text-white transition-colors
                                 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {paying === fee._id ? (
                        <><span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing…</>
                      ) : (
                        <><FiCreditCard /> Pay Now — {fmt(fee.balance)}</>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-lg
                         font-dm-sans text-sm font-semibold
                         ${toast.type === "success" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}