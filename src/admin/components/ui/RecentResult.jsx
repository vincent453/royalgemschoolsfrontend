import { useState, useEffect } from "react";
import { MoreHorizontal, Printer } from "lucide-react";
import { useNavigate } from "react-router-dom";

const RecentResults = () => {
  const [results,     setResults]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const token = localStorage.getItem("token");
        const res   = await fetch(
          "https://royalgemschoolsbackend.vercel.app/api/results",
          { headers: { Authorization: `Bearer ${token}` } }
        );
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

  const totalItems  = results.length;
  const totalPages  = Math.ceil(totalItems / itemsPerPage);
  const startIndex  = (currentPage - 1) * itemsPerPage;
  const currentData = results.slice(startIndex, startIndex + itemsPerPage);

  const statusColor = (status) =>
    status === "Pass" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-500";

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm">
      <h2 className="font-semibold text-gray-800 mb-4">Recently Added Results</h2>

      {loading ? (
        <div className="py-10 text-center text-gray-400 text-sm">Loading results...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b">
                <th className="py-3">Name</th>
                <th>Class</th>
                <th>Term</th>
                <th>Average</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-gray-400">
                    No results yet
                  </td>
                </tr>
              ) : (
                currentData.map((item) => (
                  <tr key={item._id} className="border-b hover:bg-gray-50">

                    {/* Name + photo */}
                    <td className="py-4 flex items-center gap-3">
                      {item.student?.profilePhoto ? (
                        <img
                          src={item.student.profilePhoto}
                          className="w-10 h-10 rounded-full object-cover"
                          alt={item.student?.firstName}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-[#A033A0] font-bold text-sm">
                          {item.student?.firstName?.[0]}{item.student?.lastName?.[0]}
                        </div>
                      )}
                      <span className="font-medium text-gray-700">
                        {item.student?.firstName} {item.student?.lastName}
                      </span>
                    </td>

                    {/* Class */}
                    <td>
                      <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs">
                        {item.student?.classLevel}
                      </span>
                    </td>

                    {/* Term */}
                    <td className="text-gray-500">{item.term}</td>

                    {/* Average */}
                    <td className="font-semibold text-gray-700">{item.average}</td>

                    {/* Status */}
                    <td>
                      <span className={`px-3 py-1 text-xs rounded-full font-medium ${statusColor(item.resultStatus)}`}>
                        {item.resultStatus}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="flex items-center gap-3 text-gray-400 py-4">
                      <Printer
                        size={16}
                        className="cursor-pointer hover:text-gray-600"
                        onClick={() => navigate(`/admin/results/view/${item.student?._id}`)}
                      />
                      <MoreHorizontal size={16} className="cursor-pointer hover:text-gray-600" />
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
        <p>
          Showing {totalItems === 0 ? 0 : startIndex + 1} to{" "}
          {Math.min(startIndex + itemsPerPage, totalItems)} of {totalItems} entries
        </p>
        <div className="flex items-center gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          <button
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => setCurrentPage(p => p + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecentResults;