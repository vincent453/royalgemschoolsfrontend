import { FaArrowUp, FaArrowDown } from "react-icons/fa";

const LedgerTable = ({ data, loading, error }) => {
  if (loading) {
    return <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center text-gray-400">Loading ledger entries...</div>;
  }

  if (error) {
    return <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-6 text-center text-red-500">{error}</div>;
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center text-gray-400">
        No ledger entries found. Add income or expense to populate the ledger.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-500 uppercase tracking-wide">Date</th>
              <th className="px-4 py-3 font-medium text-gray-500 uppercase tracking-wide">Type</th>
              <th className="px-4 py-3 font-medium text-gray-500 uppercase tracking-wide">Label</th>
              <th className="px-4 py-3 font-medium text-gray-500 uppercase tracking-wide hidden lg:table-cell">Description</th>
              <th className="px-4 py-3 font-medium text-gray-500 uppercase tracking-wide">Amount</th>
              <th className="px-4 py-3 font-medium text-gray-500 uppercase tracking-wide">Balance</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item._id || `${item.type}-${item.date}-${item.amount}`} className="border-t border-gray-100 hover:bg-[#faf5ff] transition-colors">
                <td className="px-4 py-4 text-gray-700">{new Date(item.date).toLocaleDateString()}</td>
                <td className="px-4 py-4 text-gray-700">
                  <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${item.type === "Income" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {item.type === "Income" ? <FaArrowUp /> : <FaArrowDown />} {item.type}
                  </span>
                </td>
                <td className="px-4 py-4 text-gray-700">{item.label || "Transaction"}</td>
                <td className="px-4 py-4 text-gray-500 hidden lg:table-cell truncate max-w-[220px]">{item.description || "—"}</td>
                <td className="px-4 py-4 text-gray-700">₦{Number(item.amount).toFixed(2)}</td>
                <td className="px-4 py-4 text-gray-700">₦{Number(item.runningBalance).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LedgerTable;
