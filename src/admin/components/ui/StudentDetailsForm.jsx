import { useState, useRef } from "react";

export default function StudentDetailsForm({
  title = "Student Details",
  form,
  setForm,
}) {
  const fileInputRef = useRef(null);
  const [photo, setPhoto] = useState(null);

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(URL.createObjectURL(file));
      setForm({ ...form, profilePhoto: file });
    }
  };

  const handleRemove = () => {
    setPhoto(null);
    setForm({ ...form, profilePhoto: null });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <div className="bg-white rounded-md shadow-sm p-4 sm:p-6 w-full">
      {/* Title */}
      <h2 className="text-base font-bold text-gray-800 pb-4 border-b border-gray-100">
        {title}
      </h2>

      {/* ── Photo + Fields wrapper ── */}
      {/* On mobile: stack vertically. On md+: side by side */}
      <div className="mt-6 flex flex-col md:flex-row gap-6 md:gap-8">

        {/* ── Photo Upload ── */}
        <div className="flex flex-row md:flex-col items-center md:items-start gap-4 md:gap-3 md:w-36 md:flex-shrink-0">
          <div className="w-24 h-24 md:w-full md:h-[8rem] rounded-xl border border-gray-200 bg-gray-100 overflow-hidden flex items-center justify-center flex-shrink-0">
            {photo ? (
              <img src={photo} alt="Student" className="w-full h-full object-cover" />
            ) : (
              <svg viewBox="0 0 80 80" className="w-12 h-12 md:w-16 md:h-16 text-gray-400" fill="currentColor">
                <circle cx="40" cy="30" r="14" />
                <ellipse cx="40" cy="62" rx="24" ry="14" />
              </svg>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-[#A13EA1] md:hidden">
              Photo<span className="text-red-500">*</span>
            </label>
            <label className="hidden md:block text-sm font-semibold text-[#A13EA1]">
              Photo<span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 bg-[#A13EA1] hover:bg-[#8a328a] text-white text-xs font-semibold rounded-lg transition-colors"
              >
                Choose
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-400 text-xs font-semibold rounded-lg border border-red-200 transition-colors"
              >
                Remove
              </button>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhoto}
          />
        </div>

        {/* ── Form Fields ── */}
        {/* 1 col on mobile, 2 cols on sm+ */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">

          <Field label="First Name" required>
            <Input name="firstName" placeholder="James" value={form.firstName} onChange={handleChange} />
          </Field>

          <Field label="Last Name" required>
            <Input name="lastName" placeholder="Wally" value={form.lastName} onChange={handleChange} />
          </Field>

          {/* Date & Place of Birth — stacks on mobile */}
          <Field label="Date & Place of Birth" required>
            <div className="flex flex-col xs:flex-row gap-2">
              <Input
                name="dateOfBirth"
                type="date"
                value={form.dateOfBirth}
                onChange={handleChange}
                className="flex-1"
              />
              <Input
                name="placeOfBirth"
                placeholder="City / Country"
                value={form.placeOfBirth}
                onChange={handleChange}
                className="flex-1"
              />
            </div>
          </Field>

          <Field label="Gender" required>
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#A13EA1] focus:border-transparent transition"
            >
              <option value="">Select gender</option>
              <option>Male</option>
              <option>Female</option>
            </select>
          </Field>

          <Field label="Class Level" required>
            <select
              name="classLevel"
              value={form.classLevel}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#A13EA1] focus:border-transparent transition"
            >
              <option value="">Select class</option>
              <option value="JSS 1">JSS 1</option>
              <option value="JSS 2">JSS 2</option>
              <option value="JSS 3">JSS 3</option>
              <option value="SSS 1">SSS 1</option>
              <option value="SSS 2">SSS 2</option>
              <option value="SSS 3">SSS 3</option>
            </select>
          </Field>

          <Field label="Session" required>
            <Input name="session" value={form.session} placeholder="e.g. 2023/2024" onChange={handleChange} />
          </Field>

          <Field label="Reg. Number" required>
            <Input name="regNumber" value={form.regNumber} placeholder="e.g. STU/2024/001" onChange={handleChange} />
          </Field>

          {/* Address — always full width */}
          <Field label="Address" required className="col-span-1 sm:col-span-2">
            <textarea
              name="address"
              placeholder="Enter full address..."
              value={form.address}
              onChange={handleChange}
              rows={3}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-700 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#A13EA1] focus:border-transparent resize-none transition"
            />
          </Field>

        </div>
      </div>
    </div>
  );
}

function Field({ label, required, children, className = "" }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-sm font-semibold text-[#A13EA1]">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function Input({ className = "", ...props }) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-700 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#A13EA1] focus:border-transparent transition ${className}`}
    />
  );
}