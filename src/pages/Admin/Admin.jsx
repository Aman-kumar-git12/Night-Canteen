import React, { useEffect, useMemo, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import supabase from "../../connection/supabase-client";
import { ArrowLeft, Search, RefreshCw, Clock, CheckCircle, XCircle, ChefHat } from "lucide-react";
import ManageItems from "./ManageItems";
import HomePage from "../HomePage";

const Admin = () => {
  const { isLoaded , isSignedIn , user } = useUser();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkedAdmin, setCheckedAdmin] = useState(false);

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState("");


  // UI state enhancements
  const [orderQuery, setOrderQuery] = useState("");
  const [notifCount, setNotifCount] = useState(0);
  const [recentNotifs, setRecentNotifs] = useState([]); // last few new orders
  const [showItems, setShowItems] = useState(false);
  const [activeStatusFilter, setActiveStatusFilter] = useState("all");

  // Check admin role from Supabase
  useEffect(() => {
    async function checkAdminRole() {
      if (!isLoaded || !isSignedIn || !user) {
        setCheckedAdmin(true);
        return;
      }
      
      const { data, error } = await supabase
        .from("profiles")
        .select("isAdmin")
        .eq("id", user.id || user.user_id)
        .single();
      console.log("Admin check - Error:", error);
      
      if (data && data.isAdmin === true) {
        setIsAdmin(true);
      } else {
        console.log("Admin access denied - isAdmin:", data?.isAdmin);
      }
      setCheckedAdmin(true);
    }
    
    checkAdminRole();
  }, [isLoaded, isSignedIn, user]);

  useEffect(() => {
    if (!isSignedIn || !isAdmin) return;
    fetchOrders();
  }, [isSignedIn, isAdmin]);

  // Realtime notifications for new orders
  useEffect(() => {
    if (!isSignedIn || !isAdmin) return;
    const channel = supabase
      .channel("admin-orders-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "userOrders" },
        (payload) => {
          setNotifCount((c) => c + 1);
          setRecentNotifs((prev) => [payload.new, ...prev].slice(0, 5));
          // Optimistically add to list (optional)
          setOrders((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => {
      try { supabase.removeChannel(channel); } catch (error) {
        console.log("Error removing channel:", error);
      }
    };
  }, [isSignedIn, isAdmin]);

  const fetchOrders = async () => {
    setOrdersLoading(true);
    setOrdersError("");
    
    const { data, error } = await supabase
      .from("userOrders")
      .select("user_id, email, items, subtotal, delivery_fee, platform_fee, total, status, orderTime, created_at")
      .order("orderTime", { ascending: true });
    if (error) {
      console.error("Error fetching orders:", error);
      setOrdersError(`Failed to load orders: ${error.message}`);
    } else {
      
      setOrders(data || []);
    }
    setOrdersLoading(false);
  };


  // Update a single order using composite key (user_id + orderTime or created_at fallback)
  const updateOrderStatus = async (order, status) => {
    const prev = orders;
    const time = order.orderTime || order.created_at;
    const timeColumn = order.orderTime ? "orderTime" : "created_at";

    setOrders((o) => o.map((ord) => (
      (ord.user_id === order.user_id && (ord.orderTime || ord.created_at) === time)
        ? { ...ord, status }
        : ord
    )));

    let q = supabase.from("userOrders").update({ status }).eq("user_id", order.user_id);
    q = q.eq(timeColumn, time);

    const { error } = await q;
    if (error) {
      console.error("Error updating order status:", error);
      alert(`Failed to update status: ${error.message}`);
      setOrders(prev);
    } 
  };


  // Filter orders by active status and sort by priority
  const filteredOrders = useMemo(() => {
    let list = orders;
    if (activeStatusFilter !== "all") {
      list = list.filter((o) => (o.status || "").toLowerCase() === activeStatusFilter);
    }
    if (orderQuery) {
      list = list.filter((o) => (o.email || "").toLowerCase().includes(orderQuery.toLowerCase()));
    }
    
    // Sort by status priority: pending → preparing → accepted → completed → cancelled
    const statusPriority = {
      pending: 1,
      preparing: 2,
      accepted: 3,
      completed: 4,
      cancelled: 5
    };
    
    return list.sort((a, b) => {
      const aPriority = statusPriority[a.status] || 999;
      const bPriority = statusPriority[b.status] || 999;
      return aPriority - bPriority;
    });
  }, [orders, activeStatusFilter, orderQuery]);

  // Status filter options
  const statusFilters = [
    { key: "all", label: "All Orders", icon: ArrowLeft, color: "indigo", count: orders.length },
    { key: "pending", label: "Pending", icon: Clock, color: "yellow", count: orders.filter(o => o.status === "pending").length },
    { key: "preparing", label: "Preparing", icon: ChefHat, color: "blue", count: orders.filter(o => o.status === "preparing").length },
    { key: "accepted", label: "Accepted", icon: CheckCircle, color: "green", count: orders.filter(o => o.status === "accepted").length },
    { key: "completed", label: "Completed", icon: CheckCircle, color: "emerald", count: orders.filter(o => o.status === "completed").length },
    { key: "cancelled", label: "Cancelled", icon: XCircle, color: "red", count: orders.filter(o => o.status === "cancelled").length },
  ];

  if (!isLoaded) return <div className="p-6">Loading...</div>;
  if (!isSignedIn) return <div className="p-6">Please sign in</div>;
  if (!checkedAdmin) return <div className="p-6">Checking admin access...</div>;
  if (!isAdmin) return <div className="p-6">Access denied</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Top Bar with Notifications */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => navigate('/home')}
                title="Back to Home"
                className="p-2 rounded-full bg-white border border-gray-200 shadow-sm hover:shadow"
              >
                <ArrowLeft onClick={() => navigate("/")} className="w-5 h-5 text-gray-700" />
              </button>
              {notifCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                  {notifCount}
                </span>
              )}
            </div>
            <button onClick={fetchOrders} className="p-2 rounded-full bg-white border border-gray-200 shadow-sm hover:shadow" title="Refresh">
              <RefreshCw className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>

        {/* Recent Notifications */}
        {recentNotifs.length > 0 && (
          <div className="bg-white rounded-2xl shadow p-4">
            <div className="text-sm font-semibold text-gray-800 mb-2">Recent new orders</div>
            <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1">
              {recentNotifs.map((n, i) => (
                <li key={`${n.user_id}-${n.orderTime || n.created_at || i}`}>
                  {n.email || "Unknown"} • ₹{n.total} • {(n.items || []).length} items
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Status Filter Cards */}
        <section className="bg-white rounded-2xl shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Orders Management</h2>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" />
                <input
                  value={orderQuery}
                  onChange={(e) => setOrderQuery(e.target.value)}
                  placeholder="Search by email"
                  className="pl-8 pr-3 py-2 border rounded-lg text-sm"
                />
              </div>
            </div>
          </div>

          {/* Status Filter Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
            {statusFilters.map((filter) => {
              const Icon = filter.icon;
              const isActive = activeStatusFilter === filter.key;
              const colorClasses = {
                indigo: isActive ? "bg-indigo-500 text-white" : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200",
                yellow: isActive ? "bg-yellow-500 text-white" : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200",
                blue: isActive ? "bg-blue-500 text-white" : "bg-blue-100 text-blue-700 hover:bg-blue-200",
                green: isActive ? "bg-green-500 text-white" : "bg-green-100 text-green-700 hover:bg-green-200",
                emerald: isActive ? "bg-emerald-500 text-white" : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200",
                red: isActive ? "bg-red-500 text-white" : "bg-red-100 text-red-700 hover:bg-red-200",
              };
              
              return (
                <button
                  key={filter.key}
                  onClick={() => setActiveStatusFilter(filter.key)}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${colorClasses[filter.color]} ${
                    isActive ? "border-current shadow-lg" : "border-transparent"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Icon className="w-5 h-5" />
                    <span className="font-semibold">{filter.label}</span>
                    {filter.count > 0 && (
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        isActive ? "bg-white/20" : "bg-current/20"
                      }`}>
                        {filter.count}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Orders List */}
          {ordersLoading ? (
            <div className="text-center py-8">Loading orders...</div>
          ) : ordersError ? (
            <div className="text-red-600 text-center py-8">{ordersError}</div>
          ) : (
            <div className="space-y-3">
              {filteredOrders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {activeStatusFilter === "all" ? "No orders found" : `No ${activeStatusFilter} orders found`}
                </div>
              ) : (
                filteredOrders.map((ord, index) => {
                  const key = `${ord.user_id}-${ord.orderTime || ord.created_at}-${index}`;
                  const statusColors = {
                    pending: "border-yellow-300 bg-yellow-50/50",
                    accepted: "border-green-300 bg-green-50/50",
                    preparing: "border-blue-300 bg-blue-50/50",
                    completed: "border-emerald-300 bg-emerald-50/50",
                    cancelled: "border-red-300 bg-red-50/50",
                  };
                  
                  return (
                    <div key={key} className={`border rounded-xl p-4 ${statusColors[ord.status] || "border-gray-300 bg-gray-50/50"}`}>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500 break-all">User: {ord.user_id}</div>
                        <div className="text-sm text-gray-600">{ord.email}</div>
                      </div>
                      <div className="mt-2 text-sm text-gray-700">
                        <div>Items: {(ord.items || []).map((it) => `${it.name}×${it.quantity}`).join(", ")}</div>
                        <div>Total: ₹{ord.total}</div>
                        <div className="flex items-center gap-3 mt-2">
                          <label className="text-gray-500">Status</label>
                          <select
                            value={ord.status || "pending"}
                            onChange={(e) => updateOrderStatus(ord, e.target.value)}
                            className="border rounded px-2 py-1"
                          >
                            <option value="pending">Pending</option>
                            <option value="accepted">Accepted</option>
                            <option value="preparing">Preparing</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </section>

        {/* Items Management Button */}
        <section className="bg-white rounded-2xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Menu Management</h2>
            <button
              onClick={() => setShowItems((s) => !s)}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
            >
              {showItems ? "Hide Menu Management" : "Manage Menu Items"}
            </button>
          </div>
          
          {showItems && <ManageItems />}
        </section>
      </div>
    </div>
  );
};

export default Admin;
