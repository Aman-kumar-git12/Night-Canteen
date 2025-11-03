import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import supabase from "../connection/supabase-client";
import { Receipt, Clock } from "lucide-react";

const statusBadge = (status) => {
  const base = "px-2 py-0.5 rounded-full text-xs font-semibold";
  switch ((status || "").toLowerCase()) {
    case "pending":
      return <span className={`${base} bg-yellow-100 text-yellow-700`}>Pending</span>;
    case "accepted":
      return <span className={`${base} bg-green-100 text-green-700`}>Accepted</span>;
    case "completed":
      return <span className={`${base} bg-emerald-100 text-emerald-700`}>Completed</span>;
    case "cancelled":
      return <span className={`${base} bg-red-100 text-red-700`}>Cancelled</span>;
    default:
      return <span className={`${base} bg-gray-100 text-gray-700`}>{status || "Unknown"}</span>;
  }
};

const MyOrder = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchOrders() {
      if (!user) return;
      setLoading(true);
      setError("");
      const { data, error } = await supabase
        .from("userOrders")
        .select("user_id, email, items, subtotal, delivery_fee, platform_fee, total, status, orderTime")
        .eq("user_id", user.id)
        .order("orderTime", { ascending: false });
      if (error) {
        
        setError("Failed to load orders.");
      } else {
        setOrders(data || []);
      }
      setLoading(false);
    }
    if (isSignedIn) fetchOrders();
  }, [user, isSignedIn]);

  if (!isLoaded) return <div className="p-6">Loading...</div>;
  if (!isSignedIn) return <div className="p-6">Please sign in to view orders.</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        {/* 🔙 Back Button */}
        <button
          onClick={() => navigate("/home")}
          className="flex items-center gap-2 mb-6 px-4 py-2 bg-white border border-gray-200 rounded-full 
                     shadow-sm hover:shadow-md hover:bg-yellow-50 transition-all duration-200 text-gray-700 font-medium"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Receipt className="w-6 h-6 text-orange-600" />
          <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
        </div>

        {/* Loading / Error / Empty States */}
        {loading && (
          <div className="bg-white p-6 rounded-xl shadow-sm">Loading your orders...</div>
        )}

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl shadow-sm mb-4">{error}</div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="bg-white p-6 rounded-xl shadow-sm text-gray-600">No orders yet.</div>
        )}

        {/* Orders */}
        <div className="space-y-4">
          {orders.map((order, index) => {
            const time = order.orderTime || order.created_at;
            const dateStr = time ? new Date(time).toLocaleString() : "";
            return (
              <div
                key={`${order.user_id}-${index}`}
                className="bg-white rounded-xl shadow hover:shadow-md transition-shadow p-5 border border-gray-100"
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">Order ID: {order.user_id}</div>
                  {statusBadge(order.status)}
                </div>
                <div className="mt-2 flex items-center gap-2 text-gray-700">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">{dateStr}</span>
                </div>

                <div className="mt-4">
                  <div className="font-semibold text-gray-800 mb-1">Items</div>
                  <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1">
                    {(order.items || []).map((it, idx) => (
                      <li key={idx}>
                        {it.name} × {it.quantity} — ₹{it.price}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-gray-500">Subtotal</div>
                    <div className="font-semibold">₹{order.subtotal}</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-gray-500">Delivery</div>
                    <div className="font-semibold">₹{order.delivery_fee}</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-gray-500">Platform</div>
                    <div className="font-semibold">₹{order.platform_fee}</div>
                  </div>
                  <div className="bg-purple-600 p-3 rounded-lg">
                    <div className="text-white">Total</div>
                    <div className="font-semibold text-white">₹{order.total}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MyOrder;
