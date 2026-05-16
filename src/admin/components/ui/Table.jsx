import { useState, useEffect } from "react";

const TeacherTable = () => {
  const [teachers,    setTeachers]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const token = localStorage.getItem("token");
        const res   = await fetch(
          "https://royalgemschoolsbackend.vercel.app/api/users",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        if (res.ok) {
          const onlyTeachers = (data.users || []).filter(u => u.role === "teacher");
          setTeachers(onlyTeachers);
        }
      } catch (err) {
        console.error("Failed to fetch teachers:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTeachers();
  }, []);

  const totalItems  = teachers.length;
  const totalPages  = Math.ceil(totalItems / itemsPerPage);
  const startIndex  = (currentPage - 1) * itemsPerPage;
  const currentData = teachers.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="bg-white p-5 rounded-md shadow-sm overflow-x-auto">
      <h2 className="font-bold text-gray-800 mb-4">Teacher Details</h2>

      {loading ? (
        <div className="py-8 text-center text-gray-400 text-sm">Loading teachers...</div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="py-2">Name</th>
              <th>Email</th>
              <th>Subject</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {currentData.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-gray-400">
                  No teachers found
                </td>
              </tr>
            ) : (
              currentData.map((teacher) => (
                <tr key={teacher._id} className="border-b hover:bg-gray-50">
                  <td className="py-3 font-medium text-gray-700">{teacher.name}</td>
                  <td className="text-gray-500">{teacher.email}</td>
                  <td className="text-gray-500">{teacher.subject || "—"}</td>
                  <td>
                    <span className={`px-2 py-1 text-xs rounded-full font-semibold
                      ${teacher.isActive
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-500"}`}>
                      {teacher.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between mt-3">
        <p className="text-sm text-gray-500">
          Showing {totalItems === 0 ? 0 : startIndex + 1} to{" "}
          {Math.min(startIndex + itemsPerPage, totalItems)} of {totalItems} entries
        </p>
        <div className="flex gap-2">
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

export default TeacherTable;