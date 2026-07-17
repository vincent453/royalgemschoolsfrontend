import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaSave,
  FaImage,
  FaTimes
} from "react-icons/fa";

import Slidebar from "../../admin/components/layout/Slidebar";
import Topbar from "../../admin/components/layout/Topbar";

import {
  getCategories,
  createCategory,
  updateCategory
} from "../../services/shopApi";

export default function CategoryForm() {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEdit = !!id;
  const hasFetched = useRef(false);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [preview, setPreview] = useState("");
  const [image, setImage] = useState(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    sortOrder: 0,
    isActive: true,
  });

  const set = (key, value) =>
    setForm(prev => ({
      ...prev,
      [key]: value,
    }));

  useEffect(() => {
    if (!isEdit) {
      setLoading(false);
      return;
    }

    if (hasFetched.current) return;

    hasFetched.current = true;

    const fetchCategory = async () => {
      try {
        const categories = await getCategories();

        const category = categories.find(c => c._id === id);

        if (!category) {
          setError("Category not found.");
          return;
        }

        setForm({
          name: category.name || "",
          description: category.description || "",
          sortOrder: category.sortOrder || 0,
          isActive: category.isActive,
        });

        if (category.image) {
          setPreview(category.image);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [id, isEdit]);

  const handleImage = e => {
    const file = e.target.files[0];

    if (!file) return;

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImage(null);
    setPreview("");
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!form.name.trim()) {
      setError("Category name is required.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload = new FormData();
      payload.append("name", form.name);
      payload.append("description", form.description);
      payload.append("sortOrder", form.sortOrder);
      payload.append("isActive", form.isActive);

      if (image) {
        payload.append("image", image);
      }

      if (isEdit) {
        await updateCategory(id, payload);
        setSuccess("Category updated successfully.");
      } else {
        await createCategory(payload);
        setSuccess("Category created successfully.");
      }

      setTimeout(() => navigate("/admin/shop/categories"), 800);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-dm-sans focus:outline-none focus:border-[#f056f0]";

  const labelClass =
    "block mb-1 text-xs uppercase tracking-wide font-semibold text-[#f056f0]";

  const section =
    "bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5";

  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-[#E6EBEE]">
        <Topbar onMenuToggle={() => setSidebarOpen(p => !p)} />

        <div className="flex flex-1 overflow-hidden">
          <Slidebar
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />

          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {[160, 220, 180].map((h, i) => (
                <div
                  key={i}
                  style={{ height: h }}
                  className="bg-white rounded-2xl animate-pulse"
                />
              ))}
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#E6EBEE]">
      <Topbar onMenuToggle={() => setSidebarOpen(p => !p)} />

      <div className="flex flex-1 overflow-hidden">
        <Slidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">

            {/* Header */}
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => navigate("/admin/shop/categories")}
                className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-[#f056f0] hover:border-[#f056f0] transition"
              >
                <FaArrowLeft />
              </button>

              <h1 className="font-jost font-bold text-xl text-gray-800">
                {isEdit ? "Edit Category" : "New Category"}
              </h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Basic Information */}
              <div className={section}>
                <h2 className="font-jost font-bold text-gray-800 border-b border-gray-100 pb-3">
                  Category Information
                </h2>

                <div className="grid md:grid-cols-2 gap-5">

                  <div className="md:col-span-2">
                    <label className={labelClass}>Category Name *</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => set("name", e.target.value)}
                      placeholder="e.g. School Uniform"
                      className={inputClass}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className={labelClass}>Description</label>
                    <textarea
                      rows={4}
                      value={form.description}
                      onChange={(e) => set("description", e.target.value)}
                      placeholder="Describe this category..."
                      className={`${inputClass} resize-none`}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Sort Order</label>
                    <input
                      type="number"
                      value={form.sortOrder}
                      onChange={(e) => set("sortOrder", e.target.value)}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Status</label>

                    <select
                      value={form.isActive ? "true" : "false"}
                      onChange={(e) =>
                        set("isActive", e.target.value === "true")
                      }
                      className={`${inputClass} appearance-none`}
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>

                </div>
              </div>

              {/* Image Upload */}
              <div className={section}>
                <h2 className="font-jost font-bold text-gray-800 border-b border-gray-100 pb-3">
                  Category Image
                </h2>

                <div className="flex flex-wrap gap-5 items-start">

                  {preview && (
                    <div className="relative w-36 h-36 rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
                      <img
                        src={preview}
                        alt=""
                        className="w-full h-full object-cover"
                      />

                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  )}

                  {!preview && (
                    <label
                      className="w-36 h-36 border-2 border-dashed border-gray-300 rounded-2xl
                      flex flex-col items-center justify-center cursor-pointer
                      hover:border-[#f056f0] hover:bg-[#f056f0]/5 transition"
                    >
                      <FaImage className="text-4xl text-gray-300 mb-2" />

                      <span className="text-xs text-gray-400 font-dm-sans">
                        Upload Image
                      </span>

                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImage}
                      />
                    </label>
                  )}

                </div>
              </div>

              {/* Messages */}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-3 text-red-500 text-sm font-dm-sans">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-3 text-green-600 text-sm font-dm-sans">
                  {success}
                </div>
              )}

              {/* Buttons */}

              <div className="flex justify-end gap-4 pb-10">

                <button
                  type="button"
                  onClick={() => navigate("/admin/shop/categories")}
                  className="px-8 py-2.5 rounded-full border border-gray-300
                  font-jost font-semibold text-gray-600
                  hover:border-[#f056f0]
                  hover:text-[#f056f0]
                  transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className={`px-8 py-2.5 rounded-full text-white font-jost font-semibold
                  flex items-center gap-2 transition
                  ${
                    saving
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-[#f056f0] hover:bg-[#525fe1]"
                  }`}
                >
                  {saving ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FaSave />
                      {isEdit ? "Save Category" : "Create Category"}
                    </>
                  )}
                </button>

              </div>

            </form>
          </div>
        </main>
      </div>
    </div>
  );
}