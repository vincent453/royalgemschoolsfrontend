const IncomeForm = ({ data, onChange, onSubmit, loading }) => (
  <form className="space-y-4" onSubmit={onSubmit}>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <label className="block">
        <span className="text-sm font-semibold text-gray-700">Source</span>
        <input
          type="text"
          name="source"
          value={data.source}
          onChange={onChange}
          className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-800 focus:border-[#f056f0] focus:outline-none"
          placeholder="School fees, Donation, etc."
          required
        />
      </label>
      <label className="block">
        <span className="text-sm font-semibold text-gray-700">Amount</span>
        <input
          type="number"
          name="amount"
          value={data.amount}
          onChange={onChange}
          className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-800 focus:border-[#f056f0] focus:outline-none"
          placeholder="0.00"
          min="0"
          step="0.01"
          required
        />
      </label>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <label className="block">
        <span className="text-sm font-semibold text-gray-700">Date</span>
        <input
          type="date"
          name="date"
          value={data.date}
          onChange={onChange}
          className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-800 focus:border-[#f056f0] focus:outline-none"
          required
        />
      </label>
      <label className="block">
        <span className="text-sm font-semibold text-gray-700">Description</span>
        <input
          type="text"
          name="description"
          value={data.description}
          onChange={onChange}
          className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-800 focus:border-[#f056f0] focus:outline-none"
          placeholder="Payment received for..."
        />
      </label>
    </div>

    <label className="block">
      <span className="text-sm font-semibold text-gray-700">Notes</span>
      <textarea
        name="notes"
        value={data.notes}
        onChange={onChange}
        className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-800 focus:border-[#f056f0] focus:outline-none"
        placeholder="Optional notes"
        rows={4}
      />
    </label>

    <button
      type="submit"
      disabled={loading}
      className="inline-flex items-center justify-center rounded-full bg-[#f056f0] px-5 py-3 text-sm font-semibold text-white hover:bg-[#d444c1] transition disabled:opacity-60"
    >
      {loading ? "Saving..." : "Save Income"}
    </button>
  </form>
);

export default IncomeForm;
