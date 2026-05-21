import { useEffect, useState } from "react";

const API = "https://royalgemschoolsbackend.vercel.app";

const Statcard = () => {
  const [stats, setStats] = useState({ students: 0, teachers: 0, results: 0, users: 0 });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    Promise.allSettled([
      fetch(`${API}/api/students`, { headers }).then(r => r.json()),
      fetch(`${API}/api/users`, { headers }).then(r => r.json()),
      fetch(`${API}/api/results`, { headers }).then(r => r.json()),
    ]).then(([studentsRes, usersRes, resultsRes]) => {
      const students = studentsRes.status === "fulfilled" ? studentsRes.value : [];
      const usersData = usersRes.status === "fulfilled" ? usersRes.value : {};
      const results = resultsRes.status === "fulfilled" ? resultsRes.value : [];
      const allUsers = usersData.users || [];
      const teachers = allUsers.filter(u => u.role === "teacher");
      setStats({
        students: Array.isArray(students) ? students.length : 0,
        teachers: teachers.length,
        results: Array.isArray(results) ? results.length : 0,
        users: allUsers.length,
      });
    });
  }, []);

  const cards = [
    { id: 1, label: "Total Students", value: stats.students, icon: "🎓", bg: "bg-purple-100", change: `${stats.students} enrolled` },
    { id: 2, label: "Total Teachers", value: stats.teachers, icon: "👨‍🏫", bg: "bg-blue-100", change: `${stats.teachers} active` },
    { id: 3, label: "Total Results", value: stats.results, icon: "📋", bg: "bg-green-100", change: `${stats.results} uploaded` },
    { id: 4, label: "Total Users", value: stats.users, icon: "👥", bg: "bg-orange-100", change: `${stats.users} registered` },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 mb-6 gap-px bg-gray-100 rounded-xl overflow-hidden shadow-sm">
      {cards.map((card, i) => (
        <div
          key={card.id}
          style={{ animationDelay: `${i * 80}ms` }}
          className="bg-white p-4 md:p-5 flex items-center gap-3 md:gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-default"
        >
          <div className={`w-11 h-11 md:w-14 md:h-14 ${card.bg} rounded-2xl flex items-center justify-center text-xl md:text-2xl flex-shrink-0`}>
            {card.icon}
          </div>
          <div className="min-w-0">
            <p className="text-[10px] md:text-xs text-gray-400 font-semibold uppercase tracking-wide truncate">{card.label}</p>
            <p className="text-xl md:text-2xl font-extrabold text-gray-800 tracking-tight leading-tight">{card.value}</p>
            <span className="text-xs font-semibold text-emerald-500">{card.change}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Statcard;