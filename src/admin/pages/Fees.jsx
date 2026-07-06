import { useEffect, useMemo, useState } from "react";
import { FaPlus, FaSearch } from "react-icons/fa";
import Slidebar from "../../admin/components/layout/Slidebar";
import Topbar from "../../admin/components/layout/Topbar";
import Modal from "../../components/accounting/Modal";

const API = "https://royalgemschoolsbackend.vercel.app";
const PAGE_SIZE = 8;

const emptyItem = { title: "", amount: "", description: "" };

const Fees = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [form, setForm] = useState({
    studentId: "",
    term: "",
    session: "",
    dueDate: "",
    description: "",
    items: [emptyItem],
  });

  const showError = (message) => {
    setError(message);
    window.setTimeout(() => setError(""), 4000);
  };

  const loadFees = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/fees`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load fee statements.");
      setFees(Array.isArray(data) ? data : []);
    } catch (err) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/students`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load students.");
      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      showError(err.message);
    }
  };

  useEffect(() => {
    loadFees();
    loadStudents();
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return fees;
    return fees.filter((item) =>
      item.reference.toLowerCase().includes(query) ||
      item.student?.firstName?.toLowerCase().includes(query) ||
      item.student?.lastName?.toLowerCase().includes(query) ||
      item.student?.regNumber?.toLowerCase().includes(query)
    );
  }, [fees, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openAddModal = () => {
    setForm({ studentId: "", term: "", session: "", dueDate: "", description: "", items: [emptyItem] });
    setModalOpen(true);
  };

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (index, field, value) => {
    setForm((prev) => {
      const items = [...prev.items];
      items[index] = { ...items[index], [field]: value };
      return { ...prev, items };
    });
  };

  const addFeeItem = () => {
    setForm((prev) => ({ ...prev, items: [...prev.items, emptyItem] }));
  };

  const removeFeeItem = (index) => {
    setForm((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.studentId || !form.term || !form.session || !form.dueDate) {
      return showError("Please fill in the required statement fields.");
    }
    if (!form.items.length || form.items.some((item) => !item.title || !item.amount)) {
      return showError("Please provide at least one fee item with title and amount.");
    }

    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/fees`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId: form.studentId,
          term: form.term,
          session: form.session,
          description: form.description,
          dueDate: form.dueDate,
          items: form.items,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create fee statement.");
      setModalOpen(false);
      loadFees();
    } catch (err) {
      showError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this fee statement? This action cannot be undone.")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/fees/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete fee statement.");
      loadFees();
    } catch (err) {
      showError(err.message);
    }
  };

  const selectedStudent = students.find((s) => s._id === form.studentId);

  return (
    <div className="flex flex-col h-[100dvh] bg-[#E6EBEE] overflow-x-hidden">
      <div className="sticky top-0 z-50 w-full">
        <Topbar onMenuToggle={() => setSidebarOpen((p) => !p)} />
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="-mt-16">
          <Slidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        </div>

        <main className="w-full overflow-y-auto">
          <div className="max-w-6xl mx-auto p-6 space-y-6">
            <div className="rounded-[32px] border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-4">
                <p className="text-sm text-gray-500">Accounting / Fees</p>
                <h1 className="mt-2 text-2xl font-jost font-bold text-gray-900">Fees & Billing</h1>
                <p className="mt-2 text-sm text-gray-500">Create, track and manage student fee statements in one place.</p>
              </div>

              {error && (
                <div className="mb-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="grid gap-4 lg:grid-cols-[1fr_auto] items-end">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700">Search</label>
                    <div className="mt-2 relative">
                      <FaSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 text-gray-300 -translate-y-1/2" />
                      <input
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        placeholder="Search reference, registration or name"
                        className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm text-gray-800 focus:border-[#f056f0] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <button
                    onClick={loadFees}
                    className="rounded-full border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
                  >
                    Refresh
                  </button>
                  <button
                    onClick={openAddModal}
                    className="inline-flex items-center justify-center rounded-full bg-[#f056f0] px-5 py-3 text-sm font-semibold text-white hover:bg-[#d444c1] transition"
                  >
                    <FaPlus className="mr-2 text-xs" />
                    Create Fee Statement
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm text-left">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 font-medium text-gray-500 uppercase tracking-wide">Reference</th>
                      <th className="px-4 py-3 font-medium text-gray-500 uppercase tracking-wide">Student</th>
                      <th className="px-4 py-3 font-medium text-gray-500 uppercase tracking-wide">Amount Due</th>
                      <th className="px-4 py-3 font-medium text-gray-500 uppercase tracking-wide">Paid</th>
                      <th className="px-4 py-3 font-medium text-gray-500 uppercase tracking-wide">Balance</th>
                      <th className="px-4 py-3 font-medium text-gray-500 uppercase tracking-wide">Status</th>
                      <th className="px-4 py-3 font-medium text-gray-500 uppercase tracking-wide">Due Date</th>
                      <th className="px-4 py-3 font-medium text-gray-500 uppercase tracking-wide">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {pageData.map((item) => (
                      <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4 text-gray-700">{item.reference}</td>
                        <td className="px-4 py-4 text-gray-700">{item.student?.firstName} {item.student?.lastName} ({item.student?.regNumber})</td>
                        <td className="px-4 py-4 text-gray-700">₦{Number(item.amountDue).toFixed(2)}</td>
                        <td className="px-4 py-4 text-gray-700">₦{Number(item.amountPaid).toFixed(2)}</td>
                        <td className="px-4 py-4 text-gray-700">₦{Number(item.balance).toFixed(2)}</td>
                        <td className="px-4 py-4 text-gray-700 capitalize">{item.status}</td>
                        <td className="px-4 py-4 text-gray-700">{new Date(item.dueDate).toLocaleDateString()}</td>
                        <td className="px-4 py-4">
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="rounded-full bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 transition"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm text-gray-500">
                <p>{filtered.length === 0 ? "No fee statements found." : `Showing ${pageData.length} of ${filtered.length} statements`}</p>
                <div className="flex items-center gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold disabled:opacity-50"
                  >Previous</button>
                  <span>Page {page} of {totalPages}</span>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                    className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold disabled:opacity-50"
                  >Next</button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <Modal open={modalOpen} title="Create Fee Statement" onClose={() => setModalOpen(false)}>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-semibold text-gray-700">Student</span>
              <select
                value={form.studentId}
                onChange={(e) => handleFormChange("studentId", e.target.value)}
                className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 focus:border-[#f056f0] focus:outline-none"
                required
              >
                <option value="">Select student</option>
                {students.map((student) => (
                  <option key={student._id} value={student._id}>
                    {student.firstName} {student.lastName} — {student.regNumber}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-gray-700">Term</span>
              <input
                value={form.term}
                onChange={(e) => handleFormChange("term", e.target.value)}
                className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 focus:border-[#f056f0] focus:outline-none"
                placeholder="Term 1"
                required
              />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-semibold text-gray-700">Session</span>
              <input
                value={form.session}
                onChange={(e) => handleFormChange("session", e.target.value)}
                className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 focus:border-[#f056f0] focus:outline-none"
                placeholder="2024/2025"
                required
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-gray-700">Due Date</span>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => handleFormChange("dueDate", e.target.value)}
                className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 focus:border-[#f056f0] focus:outline-none"
                required
              />
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-semibold text-gray-700">Description</span>
            <textarea
              value={form.description}
              onChange={(e) => handleFormChange("description", e.target.value)}
              className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 focus:border-[#f056f0] focus:outline-none"
              placeholder="Optional statement description"
              rows={3}
            />
          </label>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Fee Items</h3>
              <button
                type="button"
                onClick={addFeeItem}
                className="rounded-full bg-[#f056f0] px-4 py-2 text-xs font-semibold text-white hover:bg-[#d444c1] transition"
              >
                Add item
              </button>
            </div>

            {form.items.map((item, index) => (
              <div key={index} className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr_1fr_auto] gap-4 items-end">
                <label className="block">
                  <span className="text-sm font-semibold text-gray-700">Item title</span>
                  <input
                    value={item.title}
                    onChange={(e) => handleItemChange(index, "title", e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 focus:border-[#f056f0] focus:outline-none"
                    placeholder="Tuition"
                    required
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold text-gray-700">Amount</span>
                  <input
                    type="number"
                    value={item.amount}
                    onChange={(e) => handleItemChange(index, "amount", e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 focus:border-[#f056f0] focus:outline-none"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold text-gray-700">Notes</span>
                  <input
                    value={item.description}
                    onChange={(e) => handleItemChange(index, "description", e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 focus:border-[#f056f0] focus:outline-none"
                    placeholder="Optional"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => removeFeeItem(index)}
                  className="rounded-full bg-red-50 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 transition"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {selectedStudent && (
            <div className="rounded-2xl border border-violet-100 bg-violet-50 p-4 text-sm text-violet-700">
              Creating statement for <strong>{selectedStudent.firstName} {selectedStudent.lastName}</strong> ({selectedStudent.regNumber}).
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-full border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-[#f056f0] px-5 py-3 text-sm font-semibold text-white hover:bg-[#d444c1] transition disabled:opacity-50"
            >
              {saving ? "Creating..." : "Create Statement"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Fees;
