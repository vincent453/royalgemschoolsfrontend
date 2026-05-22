import { useState } from "react"
import Slidebar from "../components/layout/Slidebar"
import Topbar from "../components/layout/Topbar"
import SearchHeader from "../components/ui/SearchHeader"
import StudentTable from "../components/ui/StudentTable"
import useRole from "../hooks/useRole"

const Student = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const role = useRole();

  return (
    <div className="flex flex-col h-[100dvh] bg-[#E6EBEE] overflow-x-hidden">

      <div className="sticky top-0 z-50 w-full">
        <Topbar onMenuToggle={() => setSidebarOpen(p => !p)} />
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="-mt-16">
          <Slidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        </div>

        <main className="w-full overflow-y-auto">
          <div className="flex flex-col gap-6 p-6 max-w-6xl mx-auto">

            {/* Only admins see the Add Student button */}
            {role === "admin" ? (
              <SearchHeader buttonText="+ New Student" href="/admin/students/add" />
            ) : (
              <div className="bg-white p-4 rounded-xl shadow-sm">
                <h2 className="font-jost font-bold text-gray-800 text-lg">Students</h2>
                <p className="font-dm-sans text-gray-400 text-sm mt-0.5">View all students</p>
              </div>
            )}

            <div className="mt-5">
              {/* Pass isReadOnly so StudentTable hides delete/edit for teachers */}
              <StudentTable isReadOnly={role === "teacher"} />
            </div>

          </div>
        </main>
      </div>
    </div>
  )
}

export default Student