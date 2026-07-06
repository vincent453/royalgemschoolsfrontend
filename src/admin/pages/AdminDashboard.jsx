import Slidebar from "../components/layout/Slidebar"
import Topbar from "../components/layout/Topbar"
import CalendarCard from "../components/ui/Calender"
import Overview from "../components/ui/Overview"
import Performance from "../components/ui/Performance"
import RecentResults from "../components/ui/RecentResult"
import Statcard from "../components/ui/Statcard"
import TeacherTable from "../components/ui/Table"
import { useState } from "react"

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex flex-col h-screen bg-[#E6EBEE] overflow-hidden">
      <div className="sticky top-0 z-50 w-full">
        <Topbar onMenuToggle={() => setSidebarOpen(p => !p)} />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex flex-1 overflow-hidden rounded-r-2xl shadow-sm relative">
        {/* Sidebar */}
        <div
          className={`fixed md:relative top-[4rem] left-0  z-40 transition-transform duration-300
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"} -mt-0 md:-mt-16`}
        >
                    <Slidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          <div className="p-4 md:p-6">
            <Statcard />
          </div>

          <div className="px-4 md:px-6">
            <div className="flex flex-col md:flex-row gap-4 md:gap-6">
              <div className="w-full md:w-1/2">
                <Performance />
              </div>
              <div className="w-full md:w-1/2">
                <Overview />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 px-4 md:px-6 mt-4 md:mt-6">
            <div className="lg:col-span-1">
              <CalendarCard />
            </div>
            <div className="lg:col-span-2">
              <TeacherTable />
            </div>
          </div>

          <div className="px-4 md:px-6 mt-4 md:mt-5 pb-6">
            <RecentResults />
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard