const subjectColors = [
  "bg-green-100 text-green-700",
  "bg-violet-100 text-violet-700",
  "bg-orange-100 text-orange-700",
  "bg-blue-100 text-blue-700",
  "bg-pink-100 text-pink-700",
  "bg-teal-100 text-teal-700",
];

export default function TeacherCard({ name = "Unknown", role = "Teacher", photo = null, subjects = [], onProfile, onChat }) {
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 md:p-5 flex flex-col items-center gap-3 w-full sm:w-[200px] md:w-[220px] relative group hover:shadow-md transition-shadow duration-200">
      {/* Menu button */}
      <button className="absolute top-3 right-3 md:top-4 md:right-4 w-7 h-7 md:w-8 md:h-8 bg-violet-50 hover:bg-violet-100 rounded-lg flex items-center justify-center transition-colors">
        <span className="flex gap-[3px] items-center">
          {[0, 1, 2].map((i) => <span key={i} className="w-1 h-1 rounded-full bg-violet-400 block" />)}
        </span>
      </button>

      {/* Avatar */}
      <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-4 border-white shadow-md flex-shrink-0 mt-2">
        {photo ? (
          <img src={photo} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-violet-200 flex items-center justify-center text-violet-700 font-bold text-xl md:text-2xl">{initials}</div>
        )}
      </div>

      {/* Name & Role */}
      <div className="text-center">
        <p className="font-bold text-gray-800 text-sm md:text-[15px] leading-tight">{name}</p>
        <p className="text-xs md:text-sm text-gray-400 mt-0.5">{role}</p>
      </div>

      {/* Subject tags */}
      <div className="flex flex-wrap justify-center gap-1.5">
        {subjects.map((subject, i) => (
          <span key={i} className={`text-[10px] md:text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${subjectColors[i % subjectColors.length]}`}>
            {subject}
          </span>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2 w-full mt-1">
        <button onClick={onProfile} className="flex-1 flex items-center justify-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs md:text-sm font-semibold py-2 rounded-xl transition-colors">
          <svg className="w-3 h-3 md:w-3.5 md:h-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
          </svg>
          Profile
        </button>
        <button onClick={onChat} className="flex-1 flex items-center justify-center gap-1.5 bg-[#dc2626] hover:bg-[#b91c1c] text-white text-xs md:text-sm font-semibold py-2 rounded-xl transition-colors">
          <svg className="w-3 h-3 md:w-3.5 md:h-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
          </svg>
          Delete
        </button>
      </div>
    </div>
  );
}