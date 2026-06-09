import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Slidebar from "../components/layout/Slidebar";
import Topbar from "../components/layout/Topbar";
import { FaUser, FaCamera } from "react-icons/fa";

const classes     = ["JSS 1", "JSS 2", "JSS 3", "SSS 1", "SSS 2", "SSS 3"];
const genders     = ["Male", "Female"];
const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const EditStudent = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false)
  const { id }     = useParams();
  const navigate   = useNavigate();

  const [photo,   setPhoto]   = useState(null);
  const [preview, setPreview] = useState(null);
  const [form,    setForm]    = useState({
    firstName:   "",
    lastName:    "",
    email:       "",
    phone:       "",
    dob:         "",
    gender:      "",
    bloodGroup:  "",
    address:     "",
    city:        "",
    grade:       "",
    studentId:   "",
    parentName:  "",
    parentPhone: "",
    parentEmail: "",
  });

  const [loading,     setLoading]     = useState(false);
  const [fetching,    setFetching]    = useState(true);   // loading existing data
  const [fetchError,  setFetchError]  = useState("");
  const [submitError, setSubmitError] = useState("");

  // ── Fetch existing student data on mount ──
  useEffect(() => {
    const fetchStudent = async () => {
      try {
        setFetching(true);
        const token = localStorage.getItem("token");
        const res   = await fetch(
          `https://royalgemschoolsbackend.vercel.app/api/students/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load student");

        // Map API response fields to form fields
        setForm({
          firstName:   data.firstName   || "",
          lastName:    data.lastName    || "",
          email:       data.email       || "",
          phone:       data.parentPhone || "",   // phone stored as parentPhone on model
          dob:         data.dateOfBirth ? data.dateOfBirth.split("T")[0] : "",
          gender:      data.gender      || "",
          bloodGroup:  data.bloodGroup  || "",
          address:     data.address     || "",
          city:        data.city        || "",
          grade:       data.classLevel  || "",
          studentId:   data.regNumber   || "",
          parentName:  `${data.parentFirstName || ""} ${data.parentLastName || ""}`.trim(),
          parentPhone: data.parentPhone || "",
          parentEmail: data.parentEmail || "",
        });

        // Show existing photo as preview
        if (data.profilePhoto) {
          setPreview(data.profilePhoto);
        }
      } catch (err) {
        setFetchError(err.message);
      } finally {
        setFetching(false);
      }
    };

    fetchStudent();
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSubmitError("");

    try {
      const token    = localStorage.getItem("token");
      const formData = new FormData();

      formData.append("firstName",      form.firstName);
      formData.append("lastName",       form.lastName);
      formData.append("dateOfBirth",    form.dob);
      formData.append("gender",         form.gender);
      formData.append("address",        form.address);
      formData.append("classLevel",     form.grade);
      formData.append("regNumber",      form.studentId);
      formData.append("parentFirstName", form.parentName.split(" ")[0] || form.parentName);
      formData.append("parentLastName",  form.parentName.split(" ")[1] || "");
      formData.append("parentPhone",    form.parentPhone);
      formData.append("parentEmail",    form.parentEmail);

      if (photo instanceof File) {
        formData.append("profilePhoto", photo);
      }

      const res = await fetch(
        `https://royalgemschoolsbackend.vercel.app/api/students/${id}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");

      navigate("/admin/students");
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = `w-full border border-gray-200 rounded-lg px-4 py-2.5
                      font-dm-sans text-gray-700 text-sm placeholder-gray-300
                      focus:outline-none focus:border-[#f056f0] bg-white
                      transition-colors duration-300`;

  const labelClass = `font-dm-sans text-[#f056f0] text-sm font-semibold mb-1 block`;

  // ── Loading state ──
  if (fetching) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#E6EBEE]">
        <p className="font-dm-sans text-gray-400 text-sm">Loading student data...</p>
      </div>
    );
  }

  // ── Fetch error state ──
  if (fetchError) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#E6EBEE]">
        <div className="text-center">
          <p className="font-dm-sans text-red-400 text-sm mb-3">{fetchError}</p>
          <button
            onClick={() => navigate("/admin/students")}
            className="font-dm-sans text-sm text-[#f056f0] underline"
          >
            ← Back to Students
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#E6EBEE] overflow-hidden">
      <div className="fixed top-1 left-0 h-screen w-64 z-40">
                  <Slidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      </div>

      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="sticky top-0 z-50 w-full">
          <Topbar onMenuToggle={() => setSidebarOpen(p => !p)} />
        </div>

        <main className="flex-1 overflow-scroll ml-64 mt-16">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-5xl mx-auto p-6">

            {/* ── Page Title ── */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-jost font-bold text-gray-800 text-2xl">Edit Student</h1>
                <p className="font-dm-sans text-gray-400 text-sm mt-0.5">
                  Update information for {form.firstName} {form.lastName}
                </p>
              </div>
              <span className={`px-3 py-1 text-xs rounded-full font-dm-sans font-semibold
                               ${form.grade?.startsWith("JSS")
                                 ? "bg-blue-100 text-blue-600"
                                 : "bg-purple-100 text-[#f056f0]"}`}>
                {form.grade || "No Class"}
              </span>
            </div>

            {/* ── Section 1: Personal Details ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-6">
              <h2 className="font-jost font-bold text-gray-800 text-lg border-b border-gray-100 pb-3">
                Personal Details
              </h2>

              <div className="flex flex-col md:flex-row gap-8 items-start">

                {/* Photo upload */}
                <div className="flex flex-col items-center gap-3 shrink-0">
                  <div className="relative w-28 h-28 rounded-full bg-gray-100 border-2 border-[#f056f0]/20 overflow-hidden">
                    {preview ? (
                      <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FaUser className="text-gray-300 text-4xl" />
                      </div>
                    )}
                    <label
                      htmlFor="photo"
                      className="absolute inset-0 bg-black/40 flex items-center justify-center
                                 opacity-0 hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                    >
                      <FaCamera className="text-white text-xl" />
                    </label>
                  </div>
                  <input id="photo" type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
                  <div className="flex gap-2">
                    <label
                      htmlFor="photo"
                      className="font-dm-sans text-xs font-semibold px-4 py-1.5 rounded-full
                                 bg-[#f056f0] text-white cursor-pointer hover:bg-[#525fe1]
                                 transition-colors duration-300"
                    >
                      Change
                    </label>
                    {preview && (
                      <button
                        type="button"
                        onClick={() => { setPhoto(null); setPreview(null); }}
                        className="font-dm-sans text-xs font-semibold px-4 py-1.5 rounded-full
                                   border border-red-300 text-red-400 hover:bg-red-50
                                   transition-colors duration-300"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                {/* Fields */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                  <div>
                    <label className={labelClass}>First Name *</label>
                    <input name="firstName" value={form.firstName} onChange={handleChange}
                      placeholder="First name" className={inputClass} required />
                  </div>
                  <div>
                    <label className={labelClass}>Last Name *</label>
                    <input name="lastName" value={form.lastName} onChange={handleChange}
                      placeholder="Last name" className={inputClass} required />
                  </div>
                  <div>
                    <label className={labelClass}>Date of Birth *</label>
                    <input type="date" name="dob" value={form.dob} onChange={handleChange}
                      className={inputClass} required />
                  </div>
                  <div>
                    <label className={labelClass}>Gender *</label>
                    <select name="gender" value={form.gender} onChange={handleChange}
                      className={inputClass} required>
                      <option value="">Select Gender</option>
                      {genders.map((g) => <option key={g}>{g}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Blood Group</label>
                    <select name="bloodGroup" value={form.bloodGroup} onChange={handleChange}
                      className={inputClass}>
                      <option value="">Select Blood Group</option>
                      {bloodGroups.map((b) => <option key={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Phone Number</label>
                    <input name="phone" value={form.phone} onChange={handleChange}
                      placeholder="+234 800 000 0000" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Email</label>
                    <input type="email" name="email" value={form.email} onChange={handleChange}
                      placeholder="student@email.com" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>City</label>
                    <input name="city" value={form.city} onChange={handleChange}
                      placeholder="City" className={inputClass} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Address</label>
                    <textarea name="address" value={form.address} onChange={handleChange}
                      placeholder="Enter full address..." rows={3}
                      className={`${inputClass} resize-none`} />
                  </div>
                </div>
              </div>
            </div>

            {/* ── Section 2: Academic Details ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4">
              <h2 className="font-jost font-bold text-gray-800 text-lg border-b border-gray-100 pb-3">
                Academic Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Student ID</label>
                  <input name="studentId" value={form.studentId} onChange={handleChange}
                    placeholder="e.g. RGS-001" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Class *</label>
                  <select name="grade" value={form.grade} onChange={handleChange}
                    className={inputClass} required>
                    <option value="">Select Class</option>
                    {classes.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* ── Section 3: Parent / Guardian ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4">
              <h2 className="font-jost font-bold text-gray-800 text-lg border-b border-gray-100 pb-3">
                Parent / Guardian
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className={labelClass}>Parent / Guardian Name *</label>
                  <input name="parentName" value={form.parentName} onChange={handleChange}
                    placeholder="Full name" className={inputClass} required />
                </div>
                <div>
                  <label className={labelClass}>Parent Phone *</label>
                  <input name="parentPhone" value={form.parentPhone} onChange={handleChange}
                    placeholder="+234 800 000 0000" className={inputClass} required />
                </div>
                <div>
                  <label className={labelClass}>Parent Email</label>
                  <input type="email" name="parentEmail" value={form.parentEmail}
                    onChange={handleChange} placeholder="parent@email.com" className={inputClass} />
                </div>
              </div>
            </div>

            {/* ── Error ── */}
            {submitError && (
              <div className="bg-red-50 border border-red-200 text-red-500 px-4 py-3 rounded-xl text-sm font-dm-sans">
                {submitError}
              </div>
            )}

            {/* ── Actions ── */}
            <div className="flex items-center justify-end gap-4 pb-6">
              <button
                type="button"
                onClick={() => navigate("/admin/students")}
                className="font-jost font-semibold px-8 py-2.5 rounded-full border
                           border-gray-300 text-gray-600 hover:border-[#f056f0]
                           hover:text-[#f056f0] transition-all duration-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="font-jost font-semibold px-8 py-2.5 rounded-full
                           bg-[#f056f0] hover:bg-[#525fe1] text-white
                           transition-colors duration-500 disabled:opacity-50
                           disabled:cursor-not-allowed"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>

          </form>
        </main>
      </div>
    </div>
  );
};

export default EditStudent;