import { FaExternalLinkAlt } from "react-icons/fa";

const statusStyles = {
  pending: "bg-yellow-100 text-yellow-700",
  partial: "bg-orange-100 text-orange-700",
  paid: "bg-green-100 text-green-700",
};

export default function FeeStatements({ statements, loading, error, onPay }) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center text-gray-400">
        Loading fee statements...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
        {error}
      </div>
    );
  }

  if (!statements || statements.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center text-gray-400">
        No fee statements have been issued yet.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Fee Statements</h2>
          <p className="text-sm text-gray-500">Review your invoices and pay outstanding balances.</p>
        </div>
        <span className="text-xs uppercase tracking-[0.25em] text-gray-400">{statements.length} statement{statements.length !== 1 ? "s" : ""}</span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-500 uppercase tracking-wide">Reference</th>
              <th className="px-4 py-3 font-medium text-gray-500 uppercase tracking-wide">Term / Session</th>
              <th className="px-4 py-3 font-medium text-gray-500 uppercase tracking-wide">Amount Due</th>
              <th className="px-4 py-3 font-medium text-gray-500 uppercase tracking-wide">Paid</th>
              <th className="px-4 py-3 font-medium text-gray-500 uppercase tracking-wide">Balance</th>
              <th className="px-4 py-3 font-medium text-gray-500 uppercase tracking-wide">Status</th>
              <th className="px-4 py-3 font-medium text-gray-500 uppercase tracking-wide">Due Date</th>
              <th className="px-4 py-3 font-medium text-gray-500 uppercase tracking-wide">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {statements.map((statement) => (
              <tr key={statement._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-4 text-gray-700">{statement.reference}</td>
                <td className="px-4 py-4 text-gray-700">{statement.term} / {statement.session}</td>
                <td className="px-4 py-4 text-gray-700">₦{Number(statement.amountDue).toFixed(2)}</td>
                <td className="px-4 py-4 text-gray-700">₦{Number(statement.amountPaid).toFixed(2)}</td>
                <td className="px-4 py-4 text-gray-700">₦{Number(statement.balance).toFixed(2)}</td>
                <td className="px-4 py-4">
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[statement.status] || "bg-gray-100 text-gray-700"}`}>
                    {statement.status}
                  </span>
                </td>
                <td className="px-4 py-4 text-gray-700">{new Date(statement.dueDate).toLocaleDateString()}</td>
                <td className="px-4 py-4">
                  {statement.balance > 0 ? (
                    <button
                      onClick={() => onPay(statement)}
                      className="inline-flex items-center gap-2 rounded-full bg-[#f056f0] px-4 py-2 text-white text-xs font-semibold hover:bg-[#d444c1] transition"
                    >
                      Pay Now
                      <FaExternalLinkAlt className="text-[10px]" />
                    </button>
                  ) : (
                    <span className="text-xs font-semibold text-green-700">Settled</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
