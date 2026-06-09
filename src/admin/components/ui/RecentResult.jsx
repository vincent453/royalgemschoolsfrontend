import { useState, useEffect } from "react";
import { MoreHorizontal, Printer } from "lucide-react";
import { useNavigate } from "react-router-dom";

const RecentResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("https://royalgemschoolsbackend.vercel.app/api/results", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setResults(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch results:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  const totalItems = results.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = results.slice(startIndex, startIndex + itemsPerPage);

  const statusColor = (status) =>
    status === "Pass" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-500";

  return (
    <div className="bg-white p-4 md:p-5 rounded-xl shadow-sm">
      <h2 className="font-semibold text-gray-800 mb-4">Recently Added Results</h2>

      {loading ? (
        <div className="py-10 text-center text-gray-400 text-sm">Loading results...</div>
      ) : (
        <div className="overflow-x-auto -mx-4 md:mx-0">
          <div className="min-w-[540px] px-4 md:px-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b">
                  <th className="py-3">Name</th>
                  <th>Class</th>
                  <th className="hidden sm:table-cell">Term</th>
                  <th>Average</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {currentData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-gray-400">No results yet</td>
                  </tr>
                ) : (
                  currentData.map((item) => (
                    <tr key={item._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 md:py-4 flex items-center gap-2 md:gap-3">
                        {item.student?.profilePhoto ? (
                          <img src={item.student.profilePhoto} className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover" alt={item.student?.firstName} />
                        ) : (
                          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-purple-100 flex items-center justify-center text-[#f056f0] font-bold text-xs md:text-sm">
                            {item.student?.firstName?.[0]}{item.student?.lastName?.[0]}
                          </div>
                        )}
                        <span className="font-medium text-gray-700 text-xs md:text-sm whitespace-nowrap">
                          {item.student?.firstName} {item.student?.lastName}
                        </span>
                      </td>
                      <td>
                        <span className="bg-orange-100 text-orange-600 px-2 md:px-3 py-1 rounded-full text-xs whitespace-nowrap">
                          {item.student?.classLevel}
                        </span>
                      </td>
                      <td className="hidden sm:table-cell text-gray-500 text-xs md:text-sm">{item.term}</td>
                      <td className="font-semibold text-gray-700 text-xs md:text-sm">{item.average}</td>
                      <td>
                        <span className={`px-2 md:px-3 py-1 text-xs rounded-full font-medium ${statusColor(item.resultStatus)}`}>
                          {item.resultStatus}
                        </span>
                      </td>
                      <td className="flex items-center gap-2 md:gap-3 text-gray-400 py-3 md:py-4">
                        <Printer size={15} className="cursor-pointer hover:text-gray-600" onClick={() => navigate(`/admin/results/view/${item.student?._id}`)} />
                        <MoreHorizontal size={15} className="cursor-pointer hover:text-gray-600" />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mt-4 text-sm text-gray-500">
        <p className="text-xs md:text-sm">
          Showing {totalItems === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + itemsPerPage, totalItems)} of {totalItems} entries
        </p>
        <div className="flex items-center gap-2">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="px-3 py-1 border rounded disabled:opacity-50 text-xs md:text-sm">Prev</button>
          <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(p => p + 1)} className="px-3 py-1 border rounded disabled:opacity-50 text-xs md:text-sm">Next</button>
        </div>
      </div>
    </div>
  );
};

export default RecentResults;