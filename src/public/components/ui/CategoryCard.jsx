const CategoryCard = ({ icon, label }) => {
  return (
    <div className="flex items-center gap-2 sm:gap-3 bg-white rounded-full px-3 sm:px-5 py-2 sm:py-3 shadow-sm border border-gray-100 hover:shadow-md hover:border-[#f056f0]/30 transition-all duration-300 cursor-pointer w-full">
      <img
        src={icon}
        alt={label}
        className="w-7 h-7 sm:w-10 sm:h-10 object-contain shrink-0"
      />
      <span className="font-jost font-semibold text-gray-700 text-xs sm:text-sm leading-tight">
        {label}
      </span>
    </div>
  );
};

export default CategoryCard;