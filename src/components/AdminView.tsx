import React, { useState, useEffect } from "react";
import { Grid, ShoppingBag, ShieldCheck, Tag, Plus, Trash2, Edit, Check, Eye, Users, TrendingUp, DollarSign, Download } from "lucide-react";
import { Product, Order, Coupon, User, OrderStatus, formatINR, formatINRNoDec, downloadJSON } from "../types";

interface AdminViewProps {
  token: string | null;
  onRefreshProducts: () => void;
  products: Product[];
  coupons: Coupon[];
  onRefreshCoupons: () => void;
}

export default function AdminView({
  token,
  onRefreshProducts,
  products,
  coupons,
  onRefreshCoupons
}: AdminViewProps) {
  const [activeTab, setActiveTab] = useState<"dashboard" | "products" | "orders" | "users" | "coupons">("dashboard");
  const [analytics, setAnalytics] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  
  const [loading, setLoading] = useState(false);

  // Form for new product
  const [showAddProd, setShowAddProd] = useState(false);
  const [newProdName, setNewProdName] = useState("");
  const [newProdCategory, setNewProdCategory] = useState("Cotton Bedsheets");
  const [newProdPrice, setNewProdPrice] = useState("");
  const [newProdResellerPrice, setNewProdResellerPrice] = useState("");
  const [newProdStock, setNewProdStock] = useState("");
  const [newProdMaterial, setNewProdMaterial] = useState("Egyptian Cotton");
  const [newProdGSM, setNewProdGSM] = useState("");
  const [newProdThreadCount, setNewProdThreadCount] = useState("");
  const [newProdColor, setNewProdColor] = useState("");
  const [newProdDesc, setNewProdDesc] = useState("");

  // Form for new coupon
  const [showAddCoupon, setShowAddCoupon] = useState(false);
  const [newCpnCode, setNewCpnCode] = useState("");
  const [newCpnType, setNewCpnType] = useState<"percentage" | "fixed">("percentage");
  const [newCpnVal, setNewCpnVal] = useState("");
  const [newCpnMin, setNewCpnMin] = useState("");
  const [newCpnDesc, setNewCpnDesc] = useState("");

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // Fetch Dashboard
      const dashRes = await fetch("/api/admin/dashboard", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const dashData = await dashRes.json();
      if (dashRes.ok) {
        setAnalytics(dashData.analytics);
      }

      // Fetch Orders
      const ordRes = await fetch("/api/admin/orders", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const ordData = await ordRes.json();
      if (ordRes.ok) {
        setOrders(ordData);
      }

      // Fetch Users
      const usrRes = await fetch("/api/admin/users", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const usrData = await usrRes.json();
      if (usrRes.ok) {
        setUsersList(usrData);
      }

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAdminData();
    }
  }, [token]);

  // Handle add product
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: newProdName,
      sku: "SS-" + Math.floor(Math.random() * 10000),
      category: newProdCategory,
      price: Number(newProdPrice),
      resellerPrice: Number(newProdResellerPrice) || Math.round(Number(newProdPrice) * 0.75),
      stock: Number(newProdStock),
      sizes: ["King", "Queen", "Double"],
      material: newProdMaterial,
      gsm: Number(newProdGSM) || 300,
      threadCount: Number(newProdThreadCount) || 400,
      color: newProdColor,
      description: newProdDesc,
      features: ["Premium quality threads", "Organic hypoallergenic dyes", "Elegant seamless design"],
      careInstructions: ["Machine wash warm", "Tumble dry low"]
    };

    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        alert("Product added successfully!");
        setShowAddProd(false);
        // Clear forms
        setNewProdName("");
        setNewProdPrice("");
        setNewProdResellerPrice("");
        setNewProdStock("");
        setNewProdColor("");
        setNewProdDesc("");
        onRefreshProducts();
      } else {
        alert(data.error || "Failed to add product.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle add coupon
  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      code: newCpnCode.toUpperCase(),
      discountType: newCpnType,
      discountValue: Number(newCpnVal),
      minPurchase: Number(newCpnMin) || 0,
      description: newCpnDesc || `Save using promo code ${newCpnCode}`
    };

    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        alert("Coupon promo code generated!");
        setShowAddCoupon(false);
        setNewCpnCode("");
        setNewCpnVal("");
        setNewCpnMin("");
        setNewCpnDesc("");
        onRefreshCoupons();
      } else {
        alert(data.error || "Failed to create coupon.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete product
  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this premium bedsheet from catalog?")) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        alert("Product deleted!");
        onRefreshProducts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Update order status
  const handleUpdateOrderStatus = async (orderId: string, nextStatus: OrderStatus) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: nextStatus, note: `Status updated by warehouse managers to ${nextStatus}.` })
      });
      if (res.ok) {
        alert(`Order status updated to ${nextStatus}!`);
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportActiveTabJSON = () => {
    if (activeTab === "dashboard") {
      const fullBackup = {
        analytics,
        products,
        orders,
        users: usersList,
        coupons,
        exportedAt: new Date().toISOString(),
        system: "StyleSleep India Partner Portal"
      };
      downloadJSON(fullBackup, "stylesleep_full_system_backup.json");
    } else if (activeTab === "products") {
      downloadJSON(products, "stylesleep_products.json");
    } else if (activeTab === "orders") {
      downloadJSON(orders, "stylesleep_orders.json");
    } else if (activeTab === "users") {
      downloadJSON(usersList, "stylesleep_users.json");
    } else if (activeTab === "coupons") {
      downloadJSON(coupons, "stylesleep_coupons.json");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
      
      {/* Admin Title */}
      <div className="border-b border-primary/10 pb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif-luxury text-3xl font-semibold tracking-wide text-luxury-charcoal flex items-center gap-2">
            <ShieldCheck className="h-8 w-8 text-red-600" /> Admin Business Dashboard
          </h1>
          <p className="text-xs text-luxury-charcoal/60 mt-0.5">Control StyleSleep's core inventories, customer orders, reseller wallets, and coupons.</p>
        </div>

        {/* Tab Selector */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-2">
            {["dashboard", "products", "orders", "users", "coupons"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-2 rounded-lg text-xs font-bold capitalize cursor-pointer transition-all ${activeTab === tab ? "bg-primary text-white shadow" : "bg-white text-luxury-charcoal border border-primary/10 hover:bg-primary/5"}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportActiveTabJSON}
            className="px-4 py-2 rounded-lg text-xs font-bold bg-green-700 hover:bg-green-800 text-white cursor-pointer transition-all flex items-center gap-1.5 shadow"
            title="Convert and export current view data to a JSON file"
          >
            <Download className="h-3.5 w-3.5" /> Export to JSON
          </button>
        </div>
      </div>

      {loading && (
        <div className="text-center py-10 text-xs font-semibold text-primary">
          <p>Syncing secure admin ledger entries...</p>
        </div>
      )}

      {/* VIEW: Dashboard Stats */}
      {activeTab === "dashboard" && analytics && (
        <div className="space-y-8">
          
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white border border-primary/10 rounded-2xl p-5 shadow-sm space-y-1.5">
              <span className="text-xxs font-bold text-luxury-charcoal/50 uppercase tracking-widest block">Total Sales Revenue</span>
              <p className="text-xl sm:text-2xl font-bold text-luxury-charcoal">{formatINR(analytics.totalSales)}</p>
            </div>
            <div className="bg-white border border-primary/10 rounded-2xl p-5 shadow-sm space-y-1.5">
              <span className="text-xxs font-bold text-luxury-charcoal/50 uppercase tracking-widest block">Orders Placed</span>
              <p className="text-xl sm:text-2xl font-bold text-luxury-charcoal">{analytics.totalOrders} Shipments</p>
            </div>
            <div className="bg-white border border-primary/10 rounded-2xl p-5 shadow-sm space-y-1.5">
              <span className="text-xxs font-bold text-luxury-charcoal/50 uppercase tracking-widest block">Boutique Resellers</span>
              <p className="text-xl sm:text-2xl font-bold text-amber-700">{analytics.resellersCount} Registered</p>
            </div>
            <div className="bg-white border border-primary/10 rounded-2xl p-5 shadow-sm space-y-1.5">
              <span className="text-xxs font-bold text-luxury-charcoal/50 uppercase tracking-widest block">Total Platform Users</span>
              <p className="text-xl sm:text-2xl font-bold text-luxury-charcoal">{analytics.totalUsers} Profiles</p>
            </div>
          </div>

          {/* Quick lists summaries */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Recent Orders card */}
            <div className="bg-white border border-primary/10 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-primary/80">Pending/Active Client Orders</h3>
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto">
                {orders.slice(0, 5).map((o) => (
                  <div key={o.id} className="flex items-center justify-between p-3 rounded-xl bg-luxury-cream/40 border border-primary/5 text-xxs">
                    <div>
                      <p className="font-bold text-luxury-charcoal">{o.id}</p>
                      <p className="text-luxury-charcoal/60 mt-0.5">{o.customerName} • {o.items.length} Items</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">{formatINR(o.finalTotal)}</p>
                      <span className="inline-block px-2 py-0.5 rounded bg-primary/10 text-primary capitalize mt-0.5">{o.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Inventory alert board */}
            <div className="bg-white border border-primary/10 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-primary/80">Critical Inventory Stock Alerts</h3>
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto">
                {products.map((p) => {
                  const isLow = p.stock < 15;
                  return (
                    <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-luxury-cream/40 border border-primary/5 text-xxs">
                      <div>
                        <p className="font-bold text-luxury-charcoal">{p.name.slice(0, 32)}...</p>
                        <p className="text-luxury-charcoal/40 mt-0.5">SKU: {p.sku}</p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-2.5 py-1 rounded font-bold ${isLow ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
                          {p.stock} Left
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* VIEW: Products Management */}
      {activeTab === "products" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-primary/80">Bedsheets Catalog Management</h2>
            <button
              onClick={() => setShowAddProd(!showAddProd)}
              className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary-dark cursor-pointer flex items-center gap-1 shadow"
            >
              <Plus className="h-4 w-4" /> Add Bedding Set
            </button>
          </div>

          {/* Add product form */}
          {showAddProd && (
            <form onSubmit={handleAddProduct} className="bg-white border border-primary/10 rounded-2xl p-5 shadow-md grid grid-cols-1 sm:grid-cols-12 gap-4 animate-fade-in">
              <div className="sm:col-span-12 border-b border-primary/5 pb-2">
                <h3 className="text-xs font-bold text-primary uppercase tracking-wide">Enter Bedding Specifications</h3>
              </div>

              <div className="sm:col-span-6">
                <label className="block text-xxs font-bold text-luxury-charcoal/60 uppercase mb-1">Product Name</label>
                <input type="text" required value={newProdName} onChange={(e) => setNewProdName(e.target.value)} placeholder="e.g. Premium Mulberry Silk Set" className="w-full text-xs rounded-lg border border-primary/15 bg-white p-2" />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xxs font-bold text-luxury-charcoal/60 uppercase mb-1">Category</label>
                <select value={newProdCategory} onChange={(e) => setNewProdCategory(e.target.value)} className="w-full text-xs rounded-lg border border-primary/15 bg-white p-2">
                  <option value="Cotton Bedsheets">Cotton Bedsheets</option>
                  <option value="Premium Bedsheets">Premium Bedsheets</option>
                  <option value="Luxury Bedsheets">Luxury Bedsheets</option>
                  <option value="Hotel Collection">Hotel Collection</option>
                  <option value="Kids Collection">Kids Collection</option>
                </select>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xxs font-bold text-luxury-charcoal/60 uppercase mb-1">Material</label>
                <input type="text" required value={newProdMaterial} onChange={(e) => setNewProdMaterial(e.target.value)} placeholder="e.g. Belgian Flax Linen" className="w-full text-xs rounded-lg border border-primary/15 bg-white p-2" />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xxs font-bold text-luxury-charcoal/60 uppercase mb-1">Retail Price (₹)</label>
                <input type="number" required value={newProdPrice} onChange={(e) => setNewProdPrice(e.target.value)} placeholder="e.g. 12000" className="w-full text-xs rounded-lg border border-primary/15 bg-white p-2" />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xxs font-bold text-luxury-charcoal/60 uppercase mb-1">Wholesale Reseller Price (₹)</label>
                <input type="number" value={newProdResellerPrice} onChange={(e) => setNewProdResellerPrice(e.target.value)} placeholder="e.g. 8000" className="w-full text-xs rounded-lg border border-primary/15 bg-white p-2" />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xxs font-bold text-luxury-charcoal/60 uppercase mb-1">Inventory Stock</label>
                <input type="number" required value={newProdStock} onChange={(e) => setNewProdStock(e.target.value)} placeholder="e.g. 50" className="w-full text-xs rounded-lg border border-primary/15 bg-white p-2" />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xxs font-bold text-luxury-charcoal/60 uppercase mb-1">Sheet Thread Count</label>
                <input type="number" value={newProdThreadCount} onChange={(e) => setNewProdThreadCount(e.target.value)} placeholder="e.g. 800" className="w-full text-xs rounded-lg border border-primary/15 bg-white p-2" />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xxs font-bold text-luxury-charcoal/60 uppercase mb-1">GSM Weight</label>
                <input type="number" value={newProdGSM} onChange={(e) => setNewProdGSM(e.target.value)} placeholder="e.g. 350" className="w-full text-xs rounded-lg border border-primary/15 bg-white p-2" />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xxs font-bold text-luxury-charcoal/60 uppercase mb-1">Color Palette Name</label>
                <input type="text" value={newProdColor} onChange={(e) => setNewProdColor(e.target.value)} placeholder="e.g. Sage Mint Green" className="w-full text-xs rounded-lg border border-primary/15 bg-white p-2" />
              </div>

              <div className="sm:col-span-6">
                <label className="block text-xxs font-bold text-luxury-charcoal/60 uppercase mb-1">Detailed Description</label>
                <textarea rows={2} value={newProdDesc} onChange={(e) => setNewProdDesc(e.target.value)} placeholder="Describe fibers softness and weaves elegance..." className="w-full text-xs rounded-lg border border-primary/15 bg-white p-2 sm:col-span-6" />
              </div>

              <div className="sm:col-span-12 pt-2 border-t border-primary/5 flex justify-end gap-2">
                <button type="button" onClick={() => setShowAddProd(false)} className="px-4 py-2 border border-primary/10 text-xs font-semibold rounded-lg">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-primary text-white text-xs font-bold rounded-lg shadow">Confirm Add Product</button>
              </div>
            </form>
          )}

          {/* Catalog items table */}
          <div className="bg-white border border-primary/10 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-luxury-beige/40 text-xxs font-bold uppercase tracking-wider text-primary border-b border-primary/10">
                    <th className="p-4">SKU & Product</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Retail / Reseller</th>
                    <th className="p-4">Material Details</th>
                    <th className="p-4">Stock</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-xxs sm:text-xs divide-y divide-primary/5">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-luxury-cream/10">
                      <td className="p-4">
                        <div className="flex items-center gap-2.5">
                          <img src={p.images[0]} alt="" className="w-8 h-8 rounded-lg object-cover" />
                          <div>
                            <p className="font-bold text-luxury-charcoal">{p.name}</p>
                            <span className="text-xxs text-luxury-charcoal/40 font-semibold">{p.sku}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-luxury-charcoal/70 font-semibold">{p.category}</td>
                      <td className="p-4 font-bold">
                        <p className="text-luxury-charcoal">{formatINRNoDec(p.price)} <span className="text-xxs text-green-600">(-{p.discount}%)</span></p>
                        <p className="text-amber-800 text-xxs font-semibold">Reseller: {formatINR(p.resellerPrice)}</p>
                      </td>
                      <td className="p-4 text-luxury-charcoal/60 font-medium">
                        <p>{p.material}</p>
                        <p className="text-xxs">{p.threadCount} TC • {p.gsm} GSM</p>
                      </td>
                      <td className="p-4">
                        <span className={`inline-block px-2 py-0.5 rounded font-bold ${p.stock < 15 ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
                          {p.stock} Pcs
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-1.5 rounded-full hover:bg-red-50 text-red-600 transition-colors cursor-pointer"
                          title="Delete bedsheet"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: Orders Management */}
      {activeTab === "orders" && (
        <div className="space-y-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-primary/80">Incoming Client Orders Ledger</h2>
          
          <div className="bg-white border border-primary/10 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-luxury-beige/40 text-xxs font-bold uppercase tracking-wider text-primary border-b border-primary/10">
                    <th className="p-4">Order ID & Date</th>
                    <th className="p-4">Customer Info</th>
                    <th className="p-4">Products Sold</th>
                    <th className="p-4">Total & earnings</th>
                    <th className="p-4">Current Status</th>
                    <th className="p-4">Update Routing</th>
                  </tr>
                </thead>
                <tbody className="text-xxs sm:text-xs divide-y divide-primary/5">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-luxury-cream/10">
                      <td className="p-4">
                        <p className="font-bold text-luxury-charcoal">{o.id}</p>
                        <p className="text-xxs text-luxury-charcoal/40 mt-0.5">{new Date(o.createdAt).toLocaleString()}</p>
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-luxury-charcoal capitalize">{o.customerName}</p>
                        <p className="text-xxs text-luxury-charcoal/50">{o.email} • {o.phone}</p>
                        <span className="inline-block px-1.5 py-0.5 rounded text-xxs bg-primary/10 text-primary capitalize font-medium">{o.userRole} Checkout</span>
                      </td>
                      <td className="p-4 space-y-1">
                        {o.items.map((item, index) => (
                          <div key={index} className="text-xxs font-semibold text-luxury-charcoal/80 flex items-center gap-1">
                            <span className="text-primary">[{item.quantity}x]</span> {item.name.slice(0, 24)}... ({item.size})
                          </div>
                        ))}
                      </td>
                      <td className="p-4 font-bold">
                        <p className="text-luxury-charcoal">{formatINR(o.finalTotal)} <span className="text-xxs font-medium text-luxury-charcoal/40">({o.paymentMethod})</span></p>
                        {o.resellerEarnings > 0 && (
                          <p className="text-xxs text-amber-800 font-bold">Reseller Earn: +{formatINR(o.resellerEarnings)}</p>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xxs font-semibold uppercase tracking-wider bg-primary/10 text-primary capitalize">
                          {o.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <select
                          value={o.status}
                          onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value as any)}
                          className="text-xxs rounded-lg border border-primary/20 bg-white p-1.5 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer font-bold"
                        >
                          <option value={OrderStatus.CONFIRMED}>Confirmed</option>
                          <option value={OrderStatus.PROCESSING}>Processing</option>
                          <option value={OrderStatus.PACKED}>Packed & Boxed</option>
                          <option value={OrderStatus.SHIPPED}>Shipped</option>
                          <option value={OrderStatus.OUT_FOR_DELIVERY}>Out For Delivery</option>
                          <option value={OrderStatus.DELIVERED}>Delivered</option>
                          <option value={OrderStatus.CANCELLED}>Cancelled</option>
                          <option value={OrderStatus.RETURNED}>Returned</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: Users Ledger */}
      {activeTab === "users" && (
        <div className="space-y-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-primary/80">Registered Customers & Resellers Ledger</h2>
          
          <div className="bg-white border border-primary/10 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-luxury-beige/40 text-xxs font-bold uppercase tracking-wider text-primary border-b border-primary/10">
                    <th className="p-4">User Details</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Account Type</th>
                    <th className="p-4">Wallet balance</th>
                    <th className="p-4">Referral Code</th>
                    <th className="p-4">Join Date</th>
                  </tr>
                </thead>
                <tbody className="text-xxs sm:text-xs divide-y divide-primary/5">
                  {usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-luxury-cream/10">
                      <td className="p-4 font-bold text-luxury-charcoal">{u.name}</td>
                      <td className="p-4 text-luxury-charcoal/70">{u.email}</td>
                      <td className="p-4 capitalize">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xxs font-semibold ${u.role === "admin" ? "bg-red-50 text-red-700" : u.role === "reseller" ? "bg-amber-50 text-amber-700" : "bg-blue-50 text-blue-700"}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-luxury-charcoal">
                        {formatINR(u.walletBalance || 0)}
                      </td>
                      <td className="p-4 font-semibold text-primary">
                        {u.referralCode || "N/A"}
                      </td>
                      <td className="p-4 text-luxury-charcoal/40 text-xxs">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: Coupons and promos */}
      {activeTab === "coupons" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-primary/80">Coupon Campaign Promos</h2>
            <button
              onClick={() => setShowAddCoupon(!showAddCoupon)}
              className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary-dark cursor-pointer flex items-center gap-1 shadow"
            >
              <Plus className="h-4 w-4" /> Create Coupon Promo
            </button>
          </div>

          {/* Create coupon form */}
          {showAddCoupon && (
            <form onSubmit={handleAddCoupon} className="bg-white border border-primary/10 rounded-2xl p-5 shadow-md grid grid-cols-1 sm:grid-cols-12 gap-4 animate-fade-in">
              <div className="sm:col-span-12 border-b border-primary/5 pb-2">
                <h3 className="text-xs font-bold text-primary uppercase tracking-wide">Enter Campaign Details</h3>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xxs font-bold text-luxury-charcoal/60 uppercase mb-1">Promo Code</label>
                <input type="text" required value={newCpnCode} onChange={(e) => setNewCpnCode(e.target.value)} placeholder="e.g. SLUMBER50" className="w-full text-xs rounded-lg border border-primary/15 bg-white p-2 focus:outline-none uppercase" />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xxs font-bold text-luxury-charcoal/60 uppercase mb-1">Discount Type</label>
                <select value={newCpnType} onChange={(e: any) => setNewCpnType(e.target.value)} className="w-full text-xs rounded-lg border border-primary/15 bg-white p-2">
                  <option value="percentage">Percentage Discount (%)</option>
                  <option value="fixed">Fixed Cash Discount (₹)</option>
                </select>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xxs font-bold text-luxury-charcoal/60 uppercase mb-1">Discount Value</label>
                <input type="number" required value={newCpnVal} onChange={(e) => setNewCpnVal(e.target.value)} placeholder="e.g. 15" className="w-full text-xs rounded-lg border border-primary/15 bg-white p-2" />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xxs font-bold text-luxury-charcoal/60 uppercase mb-1">Min Order Purchase (₹)</label>
                <input type="number" value={newCpnMin} onChange={(e) => setNewCpnMin(e.target.value)} placeholder="e.g. 8000" className="w-full text-xs rounded-lg border border-primary/15 bg-white p-2" />
              </div>

              <div className="sm:col-span-12">
                <label className="block text-xxs font-bold text-luxury-charcoal/60 uppercase mb-1">Description Campaign Message</label>
                <input type="text" value={newCpnDesc} onChange={(e) => setNewCpnDesc(e.target.value)} placeholder="e.g. Save ₹4000 off flat on order purchase over ₹20000." className="w-full text-xs rounded-lg border border-primary/15 bg-white p-2" />
              </div>

              <div className="sm:col-span-12 pt-2 border-t border-primary/5 flex justify-end gap-2">
                <button type="button" onClick={() => setShowAddCoupon(false)} className="px-4 py-2 border border-primary/10 text-xs font-semibold rounded-lg">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-primary text-white text-xs font-bold rounded-lg shadow">Create Campaign Code</button>
              </div>
            </form>
          )}

          {/* List Coupons */}
          <div className="bg-white border border-primary/10 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-luxury-beige/40 text-xxs font-bold uppercase tracking-wider text-primary border-b border-primary/10">
                    <th className="p-4">Campaign Promo Code</th>
                    <th className="p-4">Type & Value</th>
                    <th className="p-4">Minimum Purchase Threshold</th>
                    <th className="p-4">Campaign Description Message</th>
                    <th className="p-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="text-xxs sm:text-xs divide-y divide-primary/5">
                  {coupons.map((c) => (
                    <tr key={c.code} className="hover:bg-luxury-cream/10">
                      <td className="p-4 font-bold text-primary">{c.code}</td>
                      <td className="p-4 capitalize font-semibold">
                        {c.discountType === "percentage" ? `${c.discountValue}% Off` : `${formatINR(c.discountValue)} Off Flat`}
                      </td>
                      <td className="p-4 font-semibold text-luxury-charcoal">
                        Min spend of {formatINR(c.minPurchase)}
                      </td>
                      <td className="p-4 text-luxury-charcoal/60 font-medium">
                        {c.description}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xxs font-semibold ${c.active ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                          {c.active ? "Active Campaign" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
