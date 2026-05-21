export default function ParentsDetailsForm({ form, setForm }) {
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <div className="bg-white rounded-md shadow-sm p-4 md:p-6 w-full">
      <h2 className="text-base font-bold text-gray-800 pb-4 border-b border-gray-100">Parents Details</h2>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-6 md:gap-x-8 gap-y-4 md:gap-y-5">
        <Field label="First Name" required>
          <Input name="parentFirstName" placeholder="Mana" value={form.parentFirstName} onChange={handleChange} />
        </Field>
        <Field label="Last Name" required>
          <Input name="parentLastName" placeholder="Wick" value={form.parentLastName} onChange={handleChange} />
        </Field>
        <Field label="Email" required>
          <Input name="parentEmail" type="email" placeholder="hello@example.com" value={form.parentEmail} onChange={handleChange} />
        </Field>
        <Field label="Phone Number" required>
          <Input name="parentPhone" type="tel" placeholder="+123456789" value={form.parentPhone} onChange={handleChange} />
        </Field>
      </div>
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-[#A13EA1]">{label}{required && <span className="text-red-500">*</span>}</label>
      {children}
    </div>
  );
}

function Input({ ...props }) {
  return (
    <input {...props} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-700 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#A13EA1] focus:border-transparent transition" />
  );
}