import { useEffect, useMemo, useState } from "react";
import { FaPlus, FaSearch } from "react-icons/fa";
import Slidebar from "../../admin/components/layout/Slidebar";
import Topbar from "../../admin/components/layout/Topbar";
import IncomeTable from "../../components/accounting/IncomeTable";
import IncomeForm from "../../components/accounting/IncomeForm";
import DeleteModal from "../../components/accounting/DeleteModal";
import Modal from "../../components/accounting/Modal";
import { getIncomes, createIncome, updateIncome, deleteIncome } from "../../services/accountingApi";

const PAGE_SIZE = 8;

const Income = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ source: "", amount: "", date: "", description: "" });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const showToast = (type, message) => {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 3500);
  };

  const loadIncomes = async () => {
    setLoading(true);
    setError("");
    try {
      const params = { search: search || undefined, startDate: startDate || undefined, endDate: endDate || undefined };
      const data = await getIncomes(params);
      setIncomes(Array.isArray(data) ? data : []);
      setPage(1);
    } catch (err) {
      setError(err.message || "Failed to load incomes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadIncomes(); }, []);

  const handleOpenAdd = () => {
    setEditing(null);
    setFormData({ source: "", amount: "", date: "", description: "" });
    setModalOpen(true);
  };

  const handleEdit = (item) => {
    setEditing(item);
    setFormData({ source: item.source || "", amount: item.amount?.toString() || "", date: item.date?.slice(0, 10) || "", description: item.description || "" });
    setModalOpen(true);
  };

  const handleDelete = (item) => {
    setDeleteTarget(item);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        source: formData.source,
        amount: parseFloat(formData.amount) || 0,
        date: formData.date,
        description: formData.description,
      };
      if (editing) {
        await updateIncome(editing._id, payload);
        showToast("success", "Income updated successfully.");
      } else {
        await createIncome(payload);
        showToast("success", "Income added successfully.");
      }
      setModalOpen(false);
      await loadIncomes();
    } catch (err) {
      showToast("error", err.message || "Failed to save income.");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteIncome(deleteTarget._id);
      showToast("success", "Income deleted successfully.");
      setDeleteTarget(null);
      await loadIncomes();
    } catch (err) {
      showToast("error", err.message || "Failed to delete income.");
    } finally {
      setDeleting(false);
    }
  };

  const filtered = useMemo(() => incomes, [incomes]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
                <p className="text-sm text-gray-500">Accounting / Income</p>
                <h1 className="mt-2 text-2xl font-jost font-bold text-gray-900">Income Management</h1>
                <p className="mt-2 text-sm text-gray-500">Track all incoming funds, search records, and manage income entries.</p>
              </div>

              <div className="grid gap-4 lg:grid-cols-[1fr_auto] items-end">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700">Search</label>
                    <div className="mt-2 relative">
                      <FaSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 text-gray-300 -translate-y-1/2" />
                      <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search source or description"
                        className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm text-gray-800 focus:border-[#f056f0] focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700">From</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-800 focus:border-[#f056f0] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700">To</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-800 focus:border-[#f056f0] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <button
                    onClick={loadIncomes}
                    className="rounded-full border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
                  >
                    Refresh
                  </button>
                  <button
                    onClick={handleOpenAdd}
                    className="inline-flex items-center justify-center rounded-full bg-[#f056f0] px-5 py-3 text-sm font-semibold text-white hover:bg-[#d444c1] transition"
                  >
                    <FaPlus className="mr-2 text-xs" /> Add Income
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <IncomeTable data={pageData} loading={loading} error={error} onEdit={handleEdit} onDelete={handleDelete} />

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm text-gray-500">
                <p>{filtered.length === 0 ? "No incomes to display." : `Showing ${pageData.length} of ${filtered.length} entries`}</p>
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

      <Modal open={modalOpen} title={editing ? "Edit Income" : "Add Income"} onClose={() => setModalOpen(false)}>
        <IncomeForm data={formData} onChange={(e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))} onSubmit={handleSubmit} loading={saving} />
      </Modal>

      <DeleteModal
        open={Boolean(deleteTarget)}
        title="Delete income"
        message={`Are you sure you want to delete the income entry for "${deleteTarget?.source}"?`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />

      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 rounded-3xl px-5 py-4 shadow-2xl ${toast.type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default Income;
