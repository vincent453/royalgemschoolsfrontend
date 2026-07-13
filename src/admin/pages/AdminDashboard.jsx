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
    <div className="flex flex-col h-[100dvh] bg-[#E6EBEE] overflow-x-hidden">
   
         <div className="sticky top-0 z-50 w-full">
           <Topbar onMenuToggle={() => setSidebarOpen(p => !p)} />
         </div>
   
         <div className="flex flex-1 overflow-hidden">
           <div className="-mt-16">
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