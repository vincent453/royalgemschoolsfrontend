const SummaryCard = ({ label, value, description, icon, color }) => (
  <div className="bg-white rounded-[28px] border border-gray-100 shadow-sm p-5 flex flex-col justify-between min-h-[150px]">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-gray-400 font-semibold">{label}</p>
        <p className="mt-4 text-3xl font-jost font-bold text-gray-900">{value}</p>
      </div>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color || "bg-[#f8f0ff] text-[#8c4ddb]"}`}>
        {icon}
      </div>
    </div>
    {description && <p className="mt-4 text-sm text-gray-500">{description}</p>}
  </div>
);

export default SummaryCard;
