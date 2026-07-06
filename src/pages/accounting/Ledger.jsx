import { useEffect, useMemo, useState } from "react";
import { FaSearch, FaSyncAlt } from "react-icons/fa";
import Slidebar from "../../admin/components/layout/Slidebar";
import Topbar from "../../admin/components/layout/Topbar";
import LedgerTable from "../../components/accounting/LedgerTable";
import SummaryCard from "../../components/accounting/SummaryCard";
import { getLedger } from "../../services/accountingApi";

const PAGE_SIZE = 10;

const Ledger = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);

  const showToast = (type, message) => {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 3500);
  };

  const loadLedger = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {
        search: search || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      };
      const data = await getLedger(params);
      setEntries(Array.isArray(data?.entries) ? data.entries : []);
      setPage(1);
    } catch (err) {
      setError(err.message || "Failed to load ledger entries.");
      showToast("error", err.message || "Unable to load ledger.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLedger();
  }, []);

  const filtered = useMemo(() => entries, [entries]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totals = useMemo(() => {
    const totalIncome = entries.reduce((sum, entry) => sum + (entry.type === "Income" ? entry.amount : 0), 0);
    const totalExpenses = entries.reduce((sum, entry) => sum + (entry.type === "Expense" ? entry.amount : 0), 0);
    return {
      totalIncome,
      totalExpenses,
      netBalance: totalIncome - totalExpenses,
    };
  }, [entries]);

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
                <p className="text-sm text-gray-500">Accounting / Ledger</p>
                <h1 className="mt-2 text-2xl font-jost font-bold text-gray-900">School Ledger</h1>
                <p className="mt-2 text-sm text-gray-500">Review all income and expense transactions with a running balance.</p>
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
                        placeholder="Search source, vendor or description"
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
                    onClick={loadLedger}
                    className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
                  >
                    <FaSyncAlt className="mr-2" /> Refresh
                  </button>
                </div>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <SummaryCard label="Total Income" value={`₦${totals.totalIncome.toFixed(2)}`} description="All ledger credit entries" icon={<FaSyncAlt className="text-xl" />} color="bg-green-100 text-green-700" />
              <SummaryCard label="Total Expenses" value={`₦${totals.totalExpenses.toFixed(2)}`} description="All ledger debit entries" icon={<FaSyncAlt className="text-xl" />} color="bg-red-100 text-red-700" />
              <SummaryCard label="Closing Balance" value={`₦${totals.netBalance.toFixed(2)}`} description="Net balance after all entries" icon={<FaSyncAlt className="text-xl" />} color="bg-violet-100 text-violet-700" />
            </div>

            <div className="space-y-4">
              <LedgerTable data={pageData} loading={loading} error={error} />

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm text-gray-500">
                <p>{filtered.length === 0 ? "No ledger entries to display." : `Showing ${pageData.length} of ${filtered.length} ledger entries`}</p>
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

      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 rounded-3xl px-5 py-4 shadow-2xl ${toast.type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default Ledger;
