// components/accounting/RecordManualPaymentModal.jsx
// Used from StudentFees.jsx / OutstandingBalances.jsx — lets admin record
// a cash/bank-transfer/POS payment, which auto-issues a Receipt.
import { useState } from "react";
import { recordManualPayment } from "../../services/receiptApi";

const METHODS = [
  { value: "cash",          label: "Cash" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "pos",           label: "POS" },
  { value: "cheque",        label: "Cheque" },
  { value: "other",         label: "Other" },
];

export default function RecordManualPaymentModal({ feeStatement, onClose, onSuccess }) {
  const [amount,        setAmount]        = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [reference,     setReference]     = useState("");
  const [description,   setDescription]   = useState("");
  const [saving,        setSaving]        = useState(false);
  const [error,         setError]         = useState("");

  if (!feeStatement) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const amt = Number(amount);
    if (!amt || amt <= 0) { setError("Enter a valid amount"); return; }
    if (amt > feeStatement.balance) {
      setError(`Amount cannot exceed the outstanding balance of ₦${feeStatement.balance.toLocaleString()}`);
      return;
    }

    setSaving(true);
    try {
      const { receipt } = await recordManualPayment({
        feeStatementId: feeStatement._id,
        amount: amt,
        paymentMethod,
        paymentReference: reference,
        description,
      });
      onSuccess?.(receipt);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <h3 className="font-jost font-bold text-gray-800 text-lg mb-1">Record Manual Payment</h3>
        <p className="font-dm-sans text-xs text-gray-400 mb-5">
          {feeStatement.student?.firstName} {feeStatement.student?.lastName} ·
          Outstanding: ₦{Number(feeStatement.balance).toLocaleString()}
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2.5 rounded-xl text-xs mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="font-dm-sans text-xs text-[#f056f0] font-semibold uppercase tracking-wide">
              Amount
            </label>
            <input
              type="number" min="0" step="0.01"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              className="border border-gray-200 rounded-xl px-4 py-2.5 font-dm-sans text-sm
                         text-gray-700 focus:outline-none focus:border-[#f056f0] transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-dm-sans text-xs text-[#f056f0] font-semibold uppercase tracking-wide">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={e => setPaymentMethod(e.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-2.5 font-dm-sans text-sm
                         text-gray-700 focus:outline-none focus:border-[#f056f0] bg-white transition-colors"
            >
              {METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-dm-sans text-xs text-[#f056f0] font-semibold uppercase tracking-wide">
              Reference (optional)
            </label>
            <input
              type="text"
              value={reference}
              onChange={e => setReference(e.target.value)}
              placeholder="e.g. transfer ref, cheque no."
              className="border border-gray-200 rounded-xl px-4 py-2.5 font-dm-sans text-sm
                         text-gray-700 focus:outline-none focus:border-[#f056f0] transition-colors placeholder-gray-300"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-dm-sans text-xs text-[#f056f0] font-semibold uppercase tracking-wide">
              Notes (optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Any additional notes"
              className="border border-gray-200 rounded-xl px-4 py-2.5 font-dm-sans text-sm
                         text-gray-700 focus:outline-none focus:border-[#f056f0] transition-colors
                         resize-none placeholder-gray-300"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full border border-gray-200 font-dm-sans text-sm
                         font-semibold text-gray-600 hover:border-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-full bg-[#f056f0] hover:bg-[#525fe1] text-white
                         font-dm-sans text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {saving ? "Recording…" : "Record Payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}