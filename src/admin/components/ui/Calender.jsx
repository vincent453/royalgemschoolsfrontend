import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./Calendar.css";

const CalendarCard = () => {
  return (
    <div className="bg-white p-4 md:p-5 rounded-xl shadow-sm w-full">
      <h2 className="font-semibold text-gray-800 mb-4 text-sm md:text-base">School Calendar</h2>
      <div className="overflow-x-auto">
        <Calendar className="react-calendar-custom w-full" />
      </div>
    </div>
  );
};

export default CalendarCard;