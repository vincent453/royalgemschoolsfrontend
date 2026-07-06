import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiCreditCard } from "react-icons/fi";
import Slidebar from "../components/layout/Slidebar";
import Topbar from "../components/layout/Topbar";

const API = "https://royalgemschoolsbackend.vercel.app";
const fmt = (n) => `₦${Number(n || 0).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;

const StatusBadge = ({ status }) => {
  const map = { paid: "bg-emerald-100 text-emerald-700", partial: "bg-amber-100 text-amber-700", pending: "bg-red-100 text-red-600" };
  return <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${map[status] ?? "bg-gray-100 text-gray-500"}`}>{status}</span>;
};

export default function CollectPayment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [statement, setStatement] = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [paying,    setPaying]    = useState(false);
  const [error,     setError]     = useState("");
  const [toast,     setToast]     = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${API}/api/fees/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        if (data.message) throw new Error(data.message);
        setStatement(data);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handlePay = async () => {
    setPaying(true);
    try {
      const token = localStorage.getItem("portalToken") || localStorage.getItem("token");
      const res  = await fetch(`${API}/api/fees/paystack/initialize`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ feeStatementId: id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to initialize payment");
      window.location.href = data.authorizationUrl;
    } catch (e) {
      setToast({ type: "error", msg: e.message });
      setTimeout(() => setToast(null), 4000);
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-[#E6EBEE] overflow-x-hidden">
      <div className="sticky top-0 z-50 w-full">
        <Topbar onMenuToggle={() => setSidebarOpen(p => !p)} />
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="-mt-16">
          <Slidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        </div>
        <main className="w-full overflow-y-auto">
          <div className="max-w-2xl mx-auto p-6 space-y-6">

            {/* Back */}
            <button onClick={() => navigate(-1)}
              className="flex items-center gap-2 font-dm-sans text-sm text-gray-500 hover:text-[#f056f0] transition-colors">
              <FiArrowLeft /> Back
            </button>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl text-sm">{error}</div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-24 gap-3 text-gray-400">
                <span className="w-6 h-6 border-2 border-[#f056f0] border-t-transparent rounded-full animate-spin" />
                <span className="font-dm-sans text-sm">Loading statement…</span>
              </div>
            ) : statement ? (
              <>
                {/* Student info */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-[#f056f0]/10 flex items-center justify-center shrink-0">
                      <span className="text-[#f056f0] font-bold text-xl">
                        {statement.student?.firstName?.[0]}{statement.student?.lastName?.[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-jost font-bold text-gray-800 text-lg">
                        {statement.student?.firstName} {statement.student?.lastName}
                      </p>
                      <p className="font-dm-sans text-xs text-gray-400 mt-0.5">
                        {statement.student?.regNumber} · {statement.classLevel} · {statement.term} · {statement.session}
                      </p>
                    </div>
                    <div className="ml-auto">
                      <StatusBadge status={statement.status} />
                    </div>
                  </div>
                </div>

                {/* Fee breakdown */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <p className="font-jost font-bold text-gray-800 mb-4">Fee Breakdown</p>
                  <div className="space-y-2">
                    {(statement.items ?? []).map((item, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50">
                        <div>
                          <p className="font-dm-sans font-semibold text-gray-700 text-sm">{item.title}</p>
                          {item.description && <p className="font-dm-sans text-xs text-gray-400">{item.description}</p>}
                        </div>
                        <p className="font-jost font-bold text-gray-700">{fmt(item.amount)}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 space-y-2 pt-3 border-t border-gray-100">
                    {[
                      { label: "Total Fee",   value: fmt(statement.amountDue),  color: "text-gray-800" },
                      { label: "Amount Paid", value: fmt(statement.amountPaid), color: "text-emerald-600" },
                      { label: "Balance Due", value: fmt(statement.balance),    color: "text-red-500" },
                    ].map(r => (
                      <div key={r.label} className="flex items-center justify-between">
                        <p className="font-dm-sans text-sm text-gray-500">{r.label}</p>
                        <p className={`font-jost font-bold text-lg ${r.color}`}>{r.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pay button */}
                {statement.status !== "paid" ? (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4">
                    <div>
                      <p className="font-jost font-bold text-gray-800">Pay via Paystack</p>
                      <p className="font-dm-sans text-xs text-gray-400 mt-1">
                        You will be redirected to Paystack to complete the payment securely.
                        The outstanding balance of <strong className="text-[#f056f0]">{fmt(statement.balance)}</strong> will be charged.
                      </p>
                    </div>
                    <button
                      onClick={handlePay}
                      disabled={paying}
                      className="flex items-center justify-center gap-2 w-full py-3.5 rounded-full
                                 bg-[#f056f0] hover:bg-[#525fe1] text-white font-jost font-semibold text-sm
                                 transition-colors duration-300 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {paying ? (
                        <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing…</>
                      ) : (
                        <><FiCreditCard className="text-base" /> Pay Now — {fmt(statement.balance)}</>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center">
                    <p className="font-jost font-bold text-emerald-700 text-lg">✓ Fully Paid</p>
                    <p className="font-dm-sans text-sm text-emerald-600 mt-1">This fee statement has been settled.</p>
                  </div>
                )}
              </>
            ) : null}
          </div>
        </main>
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