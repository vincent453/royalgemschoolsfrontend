import { FaEllipsisV, FaEdit, FaTrash } from "react-icons/fa";

const IncomeTable = ({ data, onEdit, onDelete, loading, error }) => {
  if (loading) {
    return <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center text-gray-400">Loading incomes...</div>;
  }

  if (error) {
    return <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-6 text-center text-red-500">{error}</div>;
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center text-gray-400">
        No incomes found. Add one to get started.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-500 uppercase tracking-wide">Source</th>
              <th className="px-4 py-3 font-medium text-gray-500 uppercase tracking-wide hidden md:table-cell">Description</th>
              <th className="px-4 py-3 font-medium text-gray-500 uppercase tracking-wide">Amount</th>
              <th className="px-4 py-3 font-medium text-gray-500 uppercase tracking-wide">Date</th>
              <th className="px-4 py-3 font-medium text-gray-500 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item._id} className="border-t border-gray-100 hover:bg-[#faf5ff] transition-colors">
                <td className="px-4 py-4 text-gray-700">{item.source}</td>
                <td className="px-4 py-4 text-gray-500 hidden md:table-cell truncate max-w-[240px]">{item.description || "—"}</td>
                <td className="px-4 py-4 text-gray-700">₦{Number(item.amount).toFixed(2)}</td>
                <td className="px-4 py-4 text-gray-700">{new Date(item.date).toLocaleDateString()}</td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <button onClick={() => onEdit(item)} className="text-[#6b46c1] hover:text-[#4c1d95] transition">
                      <FaEdit />
                    </button>
                    <button onClick={() => onDelete(item)} className="text-red-600 hover:text-red-700 transition">
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default IncomeTable;
