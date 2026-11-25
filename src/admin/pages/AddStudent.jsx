import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Slidebar from "../components/layout/Slidebar";
import Topbar from "../components/layout/Topbar";
import ParentsDetailsForm from "../components/ui/ParentDetailsForm";
import StudentDetailsForm from "../components/ui/StudentDetailsForm";
import useRole from "../hooks/useRole";

const AddStudent = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate();
  const role = useRole();
  const isTeachingStaff = ["teacher", "class_teacher"].includes(role);
  const [assignedClasses, setAssignedClasses] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(isTeachingStaff);
  const [profileError, setProfileError] = useState("");
  const [studentForm, setStudentForm] = useState({
    firstName: "",
    lastName: "",
    classLevel: "",
    session: "",
    regNumber: "",
    gender: "",
    dateOfBirth: "",
    placeOfBirth: "",   
    address: "",
    profilePhoto: null,
  });

  const [parentForm, setParentForm] = useState({
    parentFirstName: "",
    parentLastName: "",
    parentPhone: "",
    parentEmail: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isTeachingStaff) return;

    const loadAssignedClasses = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("https://royalgemschoolsbackend.vercel.app/api/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const profile = await response.json();
        if (!response.ok) throw new Error(profile.message || "Failed to load your class assignments.");
        const classes = [...new Set([
          profile.assignedClass,
          ...(Array.isArray(profile.assignedClasses) ? profile.assignedClasses : []),
        ].filter(Boolean))];
        setAssignedClasses(classes);
        if (classes.length === 1) {
          setStudentForm((prev) => ({ ...prev, classLevel: classes[0] }));
        }
      } catch (err) {
        setProfileError(err.message);
      } finally {
        setLoadingProfile(false);
      }
    };

    loadAssignedClasses();
  }, [isTeachingStaff]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      if (isTeachingStaff && !assignedClasses.includes(studentForm.classLevel)) {
        throw new Error("You can only add students to a class assigned to you.");
      }

      const token = localStorage.getItem("token");

      const formData = new FormData();

      // Append student fields — skip profilePhoto (file), handle it separately
      Object.entries(studentForm).forEach(([key, value]) => {
        if (key !== "profilePhoto") {
          formData.append(key, value ?? "");
        }
      });

      // ✅ Append file only once, and only if it exists
      if (studentForm.profilePhoto) {
        formData.append("profilePhoto", studentForm.profilePhoto);
      }

      // Append parent fields
      Object.entries(parentForm).forEach(([key, value]) => {
        formData.append(key, value ?? "");
      });

      const response = await fetch("https://royalgemschoolsbackend.vercel.app/api/students", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // ❗ Do NOT set Content-Type — browser sets it automatically with boundary for FormData
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      setSuccess("Student uploaded successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="flex flex-col h-full bg-[#E6EBEE] overflow-hidden">
      {/* Topbar */}
      <div className="sticky top-0 z-50 w-full">
        <Topbar onMenuToggle={() => setSidebarOpen(p => !p)} />
      </div>

      {/* Below topbar: sidebar + content */}
      <div className="flex flex-1 overflow-y-scroll h-full rounded-r-2xl shadow-sm">
        <div className="-mt-16">
                    <Slidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
        </div>

        <main className="flex-1 overflow-y-auto px-6 py-10 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="font-jost font-bold text-gray-800 text-2xl">Add Student</h1>
            <button
              type="button"
              onClick={() => navigate(isTeachingStaff ? "/teacher/students" : "/admin/students")}
              className="font-dm-sans text-sm text-[#A13EA1] underline"
            >
              Back to Students
            </button>
          </div>
          {profileError && (
            <div className="bg-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">
              Could not load your class assignments: {profileError}
            </div>
          )}
          {isTeachingStaff && !loadingProfile && !profileError && assignedClasses.length === 0 && (
            <div className="bg-amber-50 text-amber-700 px-4 py-3 rounded-xl text-sm font-medium">
              You do not have any assigned classes, so you cannot add students yet.
            </div>
          )}
          <StudentDetailsForm
            form={studentForm}
            setForm={setStudentForm}
            allowedClasses={isTeachingStaff ? assignedClasses : undefined}
          />

          <ParentsDetailsForm form={parentForm} setForm={setParentForm} />

          <div className="space-y-2">
            {error && (
              <div className="bg-red-100 text-red-500 px-4 py-3 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-100 text-green-600 px-4 py-3 rounded-xl text-sm font-medium">
                {success}
              </div>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || loadingProfile || Boolean(profileError) || (isTeachingStaff && assignedClasses.length === 0)}
            className={`px-6 py-3 text-white rounded-xl transition-all ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#A13EA1] hover:bg-[#8a328a]"
            }`}
          >
            {loading ? "Uploading..." : "Upload Student"}
          </button>
        </main>
      </div>
    </div>
  );
};

export default AddStudent;