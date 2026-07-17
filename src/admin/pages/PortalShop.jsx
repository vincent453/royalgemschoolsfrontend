import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaShoppingCart, FaPlus, FaMinus, FaTimes, FaBoxOpen, FaStar } from "react-icons/fa";
import { getPublicProducts, getPublicCategories, placeOrder, initializePayment } from "../../services/shopApi";

const fmt = (n) => `₦${Number(n || 0).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;

const API = import.meta.env.VITE_API_URL ?? "https://royalgemschoolsbackend.vercel.app";

const StatusBadge = ({ stock, min }) => {
  if (stock <= 0)    return <span className="text-xs font-semibold text-red-500">Out of Stock</span>;
  if (stock <= min)  return <span className="text-xs font-semibold text-amber-500">Low Stock ({stock} left)</span>;
  return <span className="text-xs font-semibold text-emerald-600">In Stock</span>;
};

export default function PortalShop() {
  const navigate   = useNavigate();
  const hasFetched = useRef(false);

  const [products,    setProducts]    = useState([]);
  const [categories,  setCategories]  = useState([]);
  const [total,       setTotal]       = useState(0);
  const [page,        setPage]        = useState(1);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");
  const [search,      setSearch]      = useState("");
  const [category,    setCategory]    = useState("");
  const [cart,        setCart]        = useState([]);
  const [cartOpen,    setCartOpen]    = useState(false);
  const [checkoutStep, setCheckoutStep] = useState("cart"); // "cart" | "checkout" | "confirm"
  const [placing,     setPlacing]     = useState(false);
  const [toast,       setToast]       = useState(null);

  // Checkout form
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [phone,           setPhone]           = useState("");
  const [notes,           setNotes]           = useState("");

  const LIMIT = 24;

  const fetchProducts = async (p = 1) => {
    setLoading(true);
    try {
      const data = await getPublicProducts({ search, category, page: p, limit: LIMIT });
      setProducts(data.products ?? []);
      setTotal(data.total ?? 0);
      setPage(p);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    getPublicCategories()
      .then(data => setCategories(Array.isArray(data) ? data : []))
      .catch(() => {});

    // Pre-fill customer info from portal storage
    const cached = localStorage.getItem("portalStudent");
    if (cached) {
      try {
        const s = JSON.parse(cached);
        setPhone(s.parentPhone || "");
      } catch {}
    }

    fetchProducts(1);
  }, []);

  // Cart helpers
  const addToCart = (product) => {
    const stock = product.inventoryItem?.quantity ?? 0;
    setCart(prev => {
      const existing = prev.find(i => i._id === product._id);
      if (existing) {
        if (existing.qty >= stock) {
          showToast("error", `Only ${stock} in stock`);
          return prev;
        }
        return prev.map(i => i._id === product._id ? { ...i, qty: i.qty + 1 } : i);
      }
      if (stock <= 0) { showToast("error", "Out of stock"); return prev; }
      return [...prev, { ...product, qty: 1 }];
    });
    showToast("success", `${product.productName} added to cart`);
  };

  const updateQty = (id, delta) => {
    setCart(prev => prev
      .map(i => i._id === id ? { ...i, qty: i.qty + delta } : i)
      .filter(i => i.qty > 0)
    );
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(i => i._id !== id));

  const cartTotal     = cart.reduce((s, i) => s + (i.discountPrice ?? i.price) * i.qty, 0);
  const cartItemCount = cart.reduce((s, i) => s + i.qty, 0);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCheckout = async () => {
    if (!deliveryAddress.trim()) { showToast("error", "Please enter a delivery address"); return; }
    if (!phone.trim())            { showToast("error", "Please enter your phone number"); return; }
    setPlacing(true);

    try {
      const cached    = localStorage.getItem("portalStudent");
      const student   = cached ? JSON.parse(cached) : {};

      const { order } = await placeOrder({
        items: cart.map(i => ({ productId: i._id, quantity: i.qty })),
        deliveryAddress,
        phone,
        notes,
        customerName:  `${student.firstName ?? ""} ${student.lastName ?? ""}`.trim() || "Portal Customer",
        customerEmail: student.parentEmail ?? "",
      });

      // Initialize Paystack payment
      const { authorizationUrl } = await initializePayment(order._id);
      window.location.href = authorizationUrl;
    } catch (e) {
      showToast("error", e.message);
      setPlacing(false);
    }
  };

  const pages = Math.ceil(total / LIMIT);

  return (
    <div className="min-h-screen bg-[#E6EBEE]">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-[#f056f0] h-[60px] flex items-center px-6 gap-4 shadow-md">
        <h1 className="text-white font-bold text-lg flex-1">School Shop</h1>
        <div className="relative">
          <button onClick={() => setCartOpen(true)}
            className="text-white/90 hover:text-white transition-colors relative">
            <FaShoppingCart className="text-xl" />
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-white text-[#f056f0] rounded-full
                               text-[10px] font-bold flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </button>
        </div>
        <button onClick={() => navigate("/portal")}
          className="text-white/80 hover:text-white text-sm font-semibold transition-colors">
          Back to Portal
        </button>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-6">

        {/* Search & filter */}
        <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-wrap gap-3 items-center">
          <div className="relative flex-[2] min-w-[200px]">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 text-xs" />
            <input type="text" placeholder="Search products..." value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === "Enter" && fetchProducts(1)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl font-dm-sans text-sm
                         text-gray-700 focus:outline-none focus:border-[#f056f0] transition-colors" />
          </div>
          <select value={category} onChange={e => { setCategory(e.target.value); }}
            className="flex-1 min-w-[150px] border border-gray-200 rounded-xl px-4 py-2.5 font-dm-sans
                       text-sm text-gray-700 focus:outline-none focus:border-[#f056f0] bg-white">
            <option value="">All Categories</option>
            {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <button onClick={() => fetchProducts(1)}
            className="px-6 py-2.5 bg-[#f056f0] hover:bg-[#525fe1] text-white rounded-xl
                       font-dm-sans text-sm font-semibold transition-colors">
            Search
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-500 px-5 py-3 rounded-2xl font-dm-sans text-sm">
            {error}
          </div>
        )}

        {/* Product grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
                <div className="h-44 bg-gray-100" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                  <div className="h-8 bg-gray-100 rounded-xl mt-3" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-2xl py-20 text-center shadow-sm">
            <FaBoxOpen className="text-4xl text-gray-200 mx-auto mb-3" />
            <p className="font-dm-sans text-sm text-gray-400">No products found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map(p => {
              const stock     = p.inventoryItem?.quantity ?? 0;
              const minStock  = p.inventoryItem?.minimumStock ?? 0;
              const inCart    = cart.find(i => i._id === p._id);
              const outOfStock = stock <= 0;

              return (
                <div key={p._id} className="bg-white rounded-2xl shadow-sm border border-gray-100
                                             hover:shadow-md transition-shadow duration-200 overflow-hidden">
                  {/* Image */}
                  <div className="relative h-44 bg-gray-50">
                    {p.images?.[0] ? (
                      <img src={p.images[0]} alt={p.productName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FaBoxOpen className="text-4xl text-gray-200" />
                      </div>
                    )}
                    {p.isFeatured && (
                      <span className="absolute top-2 left-2 bg-[#f056f0] text-white text-[10px]
                                       font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <FaStar className="text-[8px]" /> Featured
                      </span>
                    )}
                    {p.discountPrice && (
                      <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px]
                                       font-bold px-2 py-0.5 rounded-full">
                        SALE
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <p className="font-dm-sans text-xs text-gray-400 mb-1">{p.category?.name}</p>
                    <p className="font-dm-sans font-semibold text-gray-700 text-sm line-clamp-2 mb-2">
                      {p.productName}
                    </p>

                    <div className="flex items-center gap-2 mb-3">
                      {p.discountPrice ? (
                        <>
                          <span className="font-jost font-bold text-[#f056f0]">{fmt(p.discountPrice)}</span>
                          <span className="font-dm-sans text-xs text-gray-300 line-through">{fmt(p.price)}</span>
                        </>
                      ) : (
                        <span className="font-jost font-bold text-gray-800">{fmt(p.price)}</span>
                      )}
                    </div>

                    <StatusBadge stock={stock} min={minStock} />

                    {inCart ? (
                      <div className="flex items-center gap-2 mt-3">
                        <button onClick={() => updateQty(p._id, -1)}
                          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-[#f056f0]/10 flex items-center
                                     justify-center text-gray-500 hover:text-[#f056f0] transition-colors">
                          <FaMinus className="text-xs" />
                        </button>
                        <span className="font-jost font-bold text-gray-700 flex-1 text-center">{inCart.qty}</span>
                        <button onClick={() => updateQty(p._id, 1)} disabled={inCart.qty >= stock}
                          className="w-8 h-8 rounded-full bg-[#f056f0]/10 hover:bg-[#f056f0]/20 flex items-center
                                     justify-center text-[#f056f0] transition-colors disabled:opacity-40">
                          <FaPlus className="text-xs" />
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => addToCart(p)} disabled={outOfStock}
                        className={`w-full mt-3 py-2 rounded-xl font-dm-sans text-sm font-semibold transition-colors
                          ${outOfStock
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-[#f056f0] hover:bg-[#525fe1] text-white"}`}>
                        {outOfStock ? "Out of Stock" : "Add to Cart"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex justify-center gap-3">
            <button onClick={() => fetchProducts(page - 1)} disabled={page === 1}
              className="px-4 py-2 rounded-xl border border-gray-200 font-dm-sans text-sm
                         hover:border-[#f056f0] disabled:opacity-40 transition-colors bg-white">Prev</button>
            <span className="px-4 py-2 font-dm-sans text-sm text-gray-500">
              Page {page} of {pages}
            </span>
            <button onClick={() => fetchProducts(page + 1)} disabled={page === pages}
              className="px-4 py-2 rounded-xl border border-gray-200 font-dm-sans text-sm
                         hover:border-[#f056f0] disabled:opacity-40 transition-colors bg-white">Next</button>
          </div>
        )}
      </main>

      {/* Cart drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40" onClick={() => setCartOpen(false)} />
          <div className="w-full max-w-md bg-white flex flex-col shadow-2xl">
            {/* Cart header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-jost font-bold text-gray-800 text-lg flex items-center gap-2">
                <FaShoppingCart className="text-[#f056f0]" /> Cart ({cartItemCount})
              </h2>
              <button onClick={() => setCartOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <FaTimes />
              </button>
            </div>

            {/* Cart body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {checkoutStep === "cart" && (
                <>
                  {cart.length === 0 ? (
                    <div className="py-16 text-center">
                      <FaShoppingCart className="text-4xl text-gray-200 mx-auto mb-3" />
                      <p className="font-dm-sans text-sm text-gray-400">Your cart is empty.</p>
                    </div>
                  ) : (
                    cart.map(item => {
                      const price = item.discountPrice ?? item.price;
                      return (
                        <div key={item._id} className="flex gap-3 items-center">
                          {item.images?.[0] ? (
                            <img src={item.images[0]} alt={item.productName}
                              className="w-14 h-14 rounded-xl object-cover border border-gray-100 flex-shrink-0" />
                          ) : (
                            <div className="w-14 h-14 rounded-xl bg-[#f056f0]/10 flex items-center justify-center flex-shrink-0">
                              <FaBoxOpen className="text-[#f056f0]" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-dm-sans font-semibold text-gray-700 text-sm truncate">{item.productName}</p>
                            <p className="font-jost font-bold text-[#f056f0] text-sm">{fmt(price)}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button onClick={() => updateQty(item._id, -1)}
                              className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center
                                         text-gray-500 hover:bg-[#f056f0]/10 hover:text-[#f056f0] transition-colors">
                              <FaMinus className="text-xs" />
                            </button>
                            <span className="font-jost font-bold text-gray-700 w-6 text-center text-sm">{item.qty}</span>
                            <button onClick={() => updateQty(item._id, 1)}
                              className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center
                                         text-gray-500 hover:bg-[#f056f0]/10 hover:text-[#f056f0] transition-colors">
                              <FaPlus className="text-xs" />
                            </button>
                          </div>
                          <div className="text-right flex-shrink-0 min-w-[60px]">
                            <p className="font-jost font-bold text-gray-700 text-sm">{fmt(price * item.qty)}</p>
                          </div>
                          <button onClick={() => removeFromCart(item._id)}
                            className="text-gray-300 hover:text-red-400 transition-colors ml-1">
                            <FaTimes className="text-sm" />
                          </button>
                        </div>
                      );
                    })
                  )}
                </>
              )}

              {checkoutStep === "checkout" && (
                <div className="space-y-4">
                  <h3 className="font-jost font-bold text-gray-800">Delivery Details</h3>
                  <div>
                    <label className="font-dm-sans text-xs text-[#f056f0] font-semibold uppercase tracking-wide mb-1 block">
                      Delivery Address *
                    </label>
                    <textarea rows={3} value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)}
                      placeholder="Enter full delivery address..."
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 font-dm-sans text-sm
                                 focus:outline-none focus:border-[#f056f0] resize-none" />
                  </div>
                  <div>
                    <label className="font-dm-sans text-xs text-[#f056f0] font-semibold uppercase tracking-wide mb-1 block">
                      Phone Number *
                    </label>
                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                      placeholder="e.g. 08012345678"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 font-dm-sans text-sm
                                 focus:outline-none focus:border-[#f056f0]" />
                  </div>
                  <div>
                    <label className="font-dm-sans text-xs text-[#f056f0] font-semibold uppercase tracking-wide mb-1 block">
                      Notes (optional)
                    </label>
                    <textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)}
                      placeholder="Any special instructions..."
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 font-dm-sans text-sm
                                 focus:outline-none focus:border-[#f056f0] resize-none" />
                  </div>

                  {/* Order summary */}
                  <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                    <h4 className="font-dm-sans font-semibold text-gray-700 text-sm mb-3">Order Summary</h4>
                    {cart.map(i => (
                      <div key={i._id} className="flex justify-between font-dm-sans text-xs text-gray-500">
                        <span>{i.productName} × {i.qty}</span>
                        <span>{fmt((i.discountPrice ?? i.price) * i.qty)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between font-jost font-bold text-gray-800 pt-2 border-t border-gray-200">
                      <span>Total</span>
                      <span className="text-[#f056f0]">{fmt(cartTotal)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Cart footer */}
            {cart.length > 0 && (
              <div className="border-t border-gray-100 p-6 space-y-3">
                <div className="flex justify-between font-jost font-bold text-gray-800">
                  <span>Total</span>
                  <span className="text-[#f056f0]">{fmt(cartTotal)}</span>
                </div>

                {checkoutStep === "cart" ? (
                  <button onClick={() => setCheckoutStep("checkout")}
                    className="w-full py-3 bg-[#f056f0] hover:bg-[#525fe1] text-white rounded-xl
                               font-jost font-semibold transition-colors">
                    Proceed to Checkout
                  </button>
                ) : (
                  <div className="flex gap-3">
                    <button onClick={() => setCheckoutStep("cart")}
                      className="flex-1 py-3 border border-gray-300 rounded-xl font-dm-sans text-sm
                                 text-gray-600 hover:border-[#f056f0] hover:text-[#f056f0] transition-colors">
                      Back
                    </button>
                    <button onClick={handleCheckout} disabled={placing}
                      className={`flex-1 py-3 rounded-xl font-jost font-semibold text-white transition-colors
                        ${placing ? "bg-gray-400 cursor-not-allowed" : "bg-[#f056f0] hover:bg-[#525fe1]"}`}>
                      {placing
                        ? <span className="flex items-center justify-center gap-2">
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Processing...
                          </span>
                        : "Pay Now"
                      }
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {toast && (
        <div className={`fixed bottom-6 right-6 z-[60] px-5 py-3.5 rounded-2xl shadow-lg font-dm-sans text-sm font-semibold
                         ${toast.type === "success" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}