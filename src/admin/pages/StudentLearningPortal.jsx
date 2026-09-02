import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaBookOpen, FaTasks, FaNewspaper, FaArrowRight } from "react-icons/fa";

export default function StudentLearningPortal() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("portalToken");
    const role = localStorage.getItem("portalRole");

    if (!token || role !== "student") {
      navigate("/portal");
    }
  }, [navigate]);

  const cards = [
    {
      title: "My Assignments",
      description: "View class work, due dates, submissions, and feedback.",
      icon: <FaTasks className="text-2xl text-[#f056f0]" />,
      action: "/student/assignments",
      accent: "from-[#f056f0]/10 to-[#525fe1]/10",
    },
    {
      title: "Learning Resources",
      description: "Browse study material by class and category.",
      icon: <FaBookOpen className="text-2xl text-[#525fe1]" />,
      action: "/student/resources",
      accent: "from-[#525fe1]/10 to-[#4ecdc4]/10",
    },
  ];

  return (
    <div className="min-h-screen bg-[#E6EBEE]">
      <header className="sticky top-0 z-40 bg-[#f056f0] h-[60px] flex items-center px-6 shadow-md">
        <button onClick={() => navigate("/student/dashboard")} className="text-white/80 hover:text-white transition-colors">
          <FaArrowRight className="rotate-180" />
        </button>
        <h1 className="text-white font-bold text-lg flex-1 ml-3">My Learning</h1>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="font-jost font-bold text-2xl text-gray-800">Learning dashboard</h2>
          <p className="font-dm-sans text-sm text-gray-500 mt-2">
            Stay on top of assignments, submission status, and helpful resources for your class.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {cards.map((card) => (
            <button
              key={card.title}
              onClick={() => navigate(card.action)}
              className={`text-left bg-gradient-to-br ${card.accent} rounded-2xl shadow-sm border border-white p-6 hover:shadow-md transition-all`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                  {card.icon}
                </div>
                <FaArrowRight className="text-gray-500" />
              </div>
              <h3 className="font-jost font-bold text-xl text-gray-800 mb-2">{card.title}</h3>
              <p className="font-dm-sans text-sm text-gray-600 leading-6">{card.description}</p>
            </button>
          ))}
        </div>

        <div className="mt-6 bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-3">
            <FaNewspaper className="text-[#f056f0]" />
            <h3 className="font-jost font-bold text-lg text-gray-800">Student quick guide</h3>
          </div>
          <ul className="space-y-2 font-dm-sans text-sm text-gray-600 list-disc pl-5">
            <li>Check your assignments for the classes you are enrolled in.</li>
            <li>Upload your work before the due date to avoid a late mark.</li>
            <li>Open learning resources by category and class to support your study.</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
