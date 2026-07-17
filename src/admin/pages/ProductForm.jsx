import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft, FaSave, FaImage, FaTimes, FaStar } from "react-icons/fa";
import Slidebar from "../../admin/components/layout/Slidebar";
import Topbar   from "../../admin/components/layout/Topbar";
import { getCategories, getProduct, createProduct, updateProduct } from "../../services/shopApi";

const API = import.meta.env.VITE_API_URL ?? "https://royalgemschoolsbackend.vercel.app";

const STATUSES = ["Active", "Inactive", "Out of Stock"];

export default function ProductForm() {
  const navigate   = useNavigate();
  const { id }     = useParams(); // undefined = create, has value = edit
  const isEdit     = !!id;
  const hasFetched = useRef(false);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [categories,  setCategories]  = useState([]);
  const [inventory,   setInventory]   = useState([]); // list of inventory items to link
  const [loading,     setLoading]     = useState(isEdit);
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState("");
  const [success,     setSuccess]     = useState("");
  const [previewUrls, setPreviewUrls] = useState([]); // existing image URLs
  const [newFiles,    setNewFiles]    = useState([]);  // new File objects

  // Form state
  const [form, setForm] = useState({
    productName:      "",
    sku:              "",
    brand:            "",
    category:         "",
    description:      "",
    shortDescription: "",
    price:            "",
    discountPrice:    "",
    costPrice:        "",
    weight:           "",
    tags:             "",
    isFeatured:       false,
    status:           "Active",
    inventoryItem:    "",
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  // Fetch categories + inventory items + (if edit) product data
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const token = localStorage.getItem("token");
    

    Promise.all([
      getCategories(),
      fetch(`${API}/api/inventory`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json()).then(d => d.items ?? d ?? []).catch(() => []),
      isEdit ? getProduct(id) : Promise.resolve(null),
    ]).then(([cats, inv, product]) => {
      setCategories(Array.isArray(cats) ? cats : []);
      setInventory(Array.isArray(inv)   ? inv  : []);

      if (product) {
        setForm({
          productName:      product.productName      ?? "",
          sku:              product.sku              ?? "",
          brand:            product.brand            ?? "",
          category:         product.category?._id   ?? product.category ?? "",
          description:      product.description      ?? "",
          shortDescription: product.shortDescription ?? "",
          price:            product.price            ?? "",
          discountPrice:    product.discountPrice    ?? "",
          costPrice:        product.costPrice        ?? "",
          weight:           product.weight           ?? "",
          tags:             Array.isArray(product.tags) ? product.tags.join(", ") : "",
          isFeatured:       product.isFeatured       ?? false,
          status:           product.status           ?? "Active",
          inventoryItem:    product.inventoryItem?._id ?? product.inventoryItem ?? "",
        });
        setPreviewUrls(product.images ?? []);
      }
    }).catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setNewFiles(prev => [...prev, ...files]);
    const urls = files.map(f => URL.createObjectURL(f));
    setPreviewUrls(prev => [...prev, ...urls]);
  };

  const removeImage = (index) => {
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    // If the removed index falls in newFiles range, remove that file too
    const existingCount = (isEdit ? (previewUrls.length - newFiles.length) : 0);
    const newFileIndex  = index - existingCount;
    if (newFileIndex >= 0) {
      setNewFiles(prev => prev.filter((_, i) => i !== newFileIndex));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError(""); setSuccess("");

    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v !== "" && v !== null) fd.append(k, v); });
      newFiles.forEach(f => fd.append("images", f));

      if (isEdit) {
        await updateProduct(id, fd);
        setSuccess("Product updated successfully!");
      } else {
        await createProduct(fd);
        setSuccess("Product created successfully!");
        setTimeout(() => navigate("/admin/shop/products"), 1200);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const inputClass = `w-full border border-gray-200 rounded-xl px-4 py-2.5 font-dm-sans text-sm text-gray-700
                      placeholder-gray-300 focus:outline-none focus:border-[#f056f0] transition-colors bg-white`;
  const labelClass = `font-dm-sans text-xs text-[#f056f0] font-semibold uppercase tracking-wide mb-1 block`;
  const section    = `bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-5`;

  if (loading) {
    return (
      <div className="flex flex-col h-[100dvh] bg-[#E6EBEE]">
        <div className="sticky top-0 z-50 w-full"><Topbar onMenuToggle={() => setSidebarOpen(p => !p)} /></div>
        <div className="flex flex-1 overflow-hidden">
          <div className="-mt-16"><Slidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} /></div>
          <main className="w-full overflow-y-auto">
            <div className="max-w-4xl mx-auto p-6 space-y-6">
              {[180, 300, 260, 200].map((h, i) => (
                <div key={i} style={{ height: h }} className="bg-white rounded-2xl animate-pulse" />
              ))}
            </div>
          </main>
        </div>
      </div>
    );
  }

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
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-6 space-y-6">

            {/* Header */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center justify-between">
              <div>
                <button type="button" onClick={() => navigate("/admin/shop/products")}
                  className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#f056f0] mb-3 transition-colors">
                  <FaArrowLeft /> Back to Products
                </button>
                <h1 className="font-jost font-bold text-2xl text-gray-800">
                  {isEdit ? "Edit Product" : "Add New Product"}
                </h1>
                <p className="font-dm-sans text-sm text-gray-400 mt-1">
                  {isEdit ? "Update product details in the shop." : "Add a new product to the online shop."}
                </p>
              </div>
              <button type="submit" disabled={saving}
                className={`flex items-center gap-2 font-jost font-semibold px-6 py-2.5 rounded-full
                            text-white shadow-sm transition-colors
                            ${saving ? "bg-gray-400 cursor-not-allowed" : "bg-[#f056f0] hover:bg-[#525fe1]"}`}>
                {saving
                  ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
                  : <><FaSave /> {isEdit ? "Save Changes" : "Create Product"}</>}
              </button>
            </div>

            {/* Basic Info */}
            <div className={section}>
              <h2 className="font-jost font-bold text-gray-800 border-b border-gray-100 pb-3">Basic Information</h2>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className={labelClass}>Product Name *</label>
                  <input type="text" value={form.productName} onChange={e => set("productName", e.target.value)}
                    placeholder="e.g. School Uniform (JSS)" required className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Category *</label>
                  <select value={form.category} onChange={e => set("category", e.target.value)}
                    required className={`${inputClass} appearance-none`}>
                    <option value="">Select category</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Status</label>
                  <select value={form.status} onChange={e => set("status", e.target.value)}
                    className={`${inputClass} appearance-none`}>
                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>SKU</label>
                  <input type="text" value={form.sku} onChange={e => set("sku", e.target.value)}
                    placeholder="e.g. UNIF-JSS-001" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Brand</label>
                  <input type="text" value={form.brand} onChange={e => set("brand", e.target.value)}
                    placeholder="e.g. Royal Gem" className={inputClass} />
                </div>
              </div>

              <div>
                <label className={labelClass}>Short Description</label>
                <input type="text" value={form.shortDescription}
                  onChange={e => set("shortDescription", e.target.value)}
                  placeholder="Brief one-line description shown in product cards"
                  className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Full Description</label>
                <textarea rows={4} value={form.description}
                  onChange={e => set("description", e.target.value)}
                  placeholder="Full product description..."
                  className={`${inputClass} resize-none`} />
              </div>
              <div>
                <label className={labelClass}>Tags</label>
                <input type="text" value={form.tags} onChange={e => set("tags", e.target.value)}
                  placeholder="comma-separated e.g. uniform, jss, school"
                  className={inputClass} />
              </div>

              {/* Featured toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <FaStar className={`text-lg ${form.isFeatured ? "text-amber-400" : "text-gray-300"}`} />
                  <div>
                    <p className="font-dm-sans text-sm font-semibold text-gray-700">Featured Product</p>
                    <p className="font-dm-sans text-xs text-gray-400">Featured products appear at the top of the shop.</p>
                  </div>
                </div>
                <button type="button" onClick={() => set("isFeatured", !form.isFeatured)}
                  className={`relative w-12 h-6 rounded-full transition-colors duration-300
                    ${form.isFeatured ? "bg-[#f056f0]" : "bg-gray-300"}`}>
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-300
                    ${form.isFeatured ? "left-7" : "left-1"}`} />
                </button>
              </div>
            </div>

            {/* Pricing */}
            <div className={section}>
              <h2 className="font-jost font-bold text-gray-800 border-b border-gray-100 pb-3">Pricing</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>Selling Price (₦) *</label>
                  <input type="number" min={0} step="0.01" value={form.price}
                    onChange={e => set("price", e.target.value)}
                    placeholder="0.00" required className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Discount Price (₦)</label>
                  <input type="number" min={0} step="0.01" value={form.discountPrice}
                    onChange={e => set("discountPrice", e.target.value)}
                    placeholder="Leave blank if no discount" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Cost Price (₦)</label>
                  <input type="number" min={0} step="0.01" value={form.costPrice}
                    onChange={e => set("costPrice", e.target.value)}
                    placeholder="0.00" className={inputClass} />
                </div>
              </div>
              {form.discountPrice && Number(form.discountPrice) >= Number(form.price) && (
                <p className="font-dm-sans text-xs text-amber-500">
                  ⚠ Discount price should be less than the selling price.
                </p>
              )}
            </div>

            {/* Inventory Link */}
            <div className={section}>
              <h2 className="font-jost font-bold text-gray-800 border-b border-gray-100 pb-3">Inventory Link</h2>
              <p className="font-dm-sans text-sm text-gray-400">
                Link this product to an inventory item. Stock quantity will always be read from inventory —
                no duplicate tracking.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Linked Inventory Item</label>
                  <select value={form.inventoryItem} onChange={e => set("inventoryItem", e.target.value)}
                    className={`${inputClass} appearance-none`}>
                    <option value="">— Not linked —</option>
                    {inventory.map(item => (
                      <option key={item._id} value={item._id}>
                        {item.itemName} ({item.itemCode}) — Qty: {item.quantity}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Weight (kg)</label>
                  <input type="number" min={0} step="0.01" value={form.weight}
                    onChange={e => set("weight", e.target.value)}
                    placeholder="0.00" className={inputClass} />
                </div>
              </div>
            </div>

            {/* Images */}
            <div className={section}>
              <h2 className="font-jost font-bold text-gray-800 border-b border-gray-100 pb-3">Product Images</h2>
              <p className="font-dm-sans text-xs text-gray-400">Up to 5 images. First image is the main display image.</p>

              <div className="flex flex-wrap gap-3">
                {previewUrls.map((url, i) => (
                  <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-200">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full
                                 flex items-center justify-center text-xs hover:bg-red-600">
                      <FaTimes />
                    </button>
                    {i === 0 && (
                      <span className="absolute bottom-0 left-0 right-0 bg-[#f056f0]/80 text-white
                                       text-[10px] text-center py-0.5 font-dm-sans">Main</span>
                    )}
                  </div>
                ))}

                {previewUrls.length < 5 && (
                  <label className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-200 flex flex-col
                                    items-center justify-center cursor-pointer hover:border-[#f056f0]
                                    hover:bg-[#f056f0]/5 transition-colors">
                    <FaImage className="text-2xl text-gray-300 mb-1" />
                    <span className="font-dm-sans text-[10px] text-gray-400">Add Image</span>
                    <input type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />
                  </label>
                )}
              </div>
            </div>

            {/* Feedback */}
            {error   && <div className="bg-red-50 border border-red-200 text-red-500 px-5 py-3 rounded-xl font-dm-sans text-sm">{error}</div>}
            {success && <div className="bg-green-50 border border-green-200 text-green-600 px-5 py-3 rounded-xl font-dm-sans text-sm">{success}</div>}

            {/* Actions */}
            <div className="flex justify-end gap-4 pb-8">
              <button type="button" onClick={() => navigate("/admin/shop/products")}
                className="px-8 py-2.5 rounded-full border border-gray-300 font-jost font-semibold text-gray-600
                           hover:border-[#f056f0] hover:text-[#f056f0] transition-all">Cancel</button>
              <button type="submit" disabled={saving}
                className={`flex items-center gap-2 px-8 py-2.5 rounded-full font-jost font-semibold text-white
                            transition-colors ${saving ? "bg-gray-400 cursor-not-allowed" : "bg-[#f056f0] hover:bg-[#525fe1]"}`}>
                {saving
                  ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
                  : <><FaSave /> {isEdit ? "Save Changes" : "Create Product"}</>}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}   