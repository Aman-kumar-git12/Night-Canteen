import React, { useState, useEffect } from "react";
import {
  Menu,
  X,
  ShoppingCart,
  Search,
  User,
  Star,
  Clock,
  MapPin,
  Filter,
  Heart,
  Loader2,
  Plus,
  Minus,
  Trash2,
  Receipt,
} from "lucide-react";
import ShimmerPage from "./shimmering";
import supabase from "../connection/supabase-client";
import { SignOutButton, useUser } from "@clerk/clerk-react";
import { Profile } from "./Profile";
import { useNavigate, Link } from "react-router-dom";

const HomePage = () => {
  const { user } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkedAdmin, setCheckedAdmin] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartItems, setCartItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cart, setCart] = useState([]);
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const [showCart, setshowCart] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderMsg, setOrderMsg] = useState("");
  const navigate = useNavigate();

  const [allItems, setAllItems] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAllItems = async () => {
    try {
      const { data, error } = await supabase.from("allItems").select();
      if (error) throw error;
      setAllItems(data || []);
      const uniqueCategories = [
        "All",
        ...new Set((data || []).map((item) => item.category)),
      ];
      setCategories(uniqueCategories);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load menu items. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllItems();
  }, []);

  useEffect(() => {
    async function checkAdminRole() {
      if (!user) {
        setCheckedAdmin(true);
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("isAdmin")
        .eq("id", user.id)
        .single();
      if (data && data.isAdmin === true) {
        setIsAdmin(true);
      }
      setCheckedAdmin(true);
    }
    checkAdminRole();
  }, [user]);

  useEffect(() => {
    setShowOrderSummary(cartItems > 0);
  }, [cartItems]);

  // Prevent body scroll when cart is open
  useEffect(() => {
    if (showCart) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showCart]);

  const filteredItems =
    selectedCategory === "All"
      ? allItems
      : allItems.filter((item) => item.category === selectedCategory);
  const searchedItems = filteredItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToCart = (item) => {
    setCart((prev) => {
      const existingItem = prev.find((cartItem) => cartItem.id === item.id);
      if (existingItem) {
        return prev.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    setCartItems((prev) => prev + 1);
  };

  const removeFromCart = (item) => {
    setCart((prev) => {
      const existingItem = prev.find((cartItem) => cartItem.id === item.id);
      if (existingItem && existingItem.quantity > 1) {
        return prev.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity - 1 }
            : cartItem
        );
      }
      return prev.filter((cartItem) => cartItem.id !== item.id);
    });
    setCartItems((prev) => prev - 1);
  };

  const removeItemCompletely = (item) => {
    const itemQuantity = getItemQuantity(item.id);
    setCart((prev) => prev.filter((cartItem) => cartItem.id !== item.id));
    setCartItems((prev) => prev - itemQuantity);
  };

  const getItemQuantity = (itemId) => {
    const item = cart.find((cartItem) => cartItem.id === itemId);
    return item ? item.quantity : 0;
  };

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const deliveryFee = cartItems > 0 ? 20 : 0;
  const platformFee = cartItems > 0 ? 5 : 0;
  const subtotal = calculateSubtotal();
  const totalAmount = subtotal + deliveryFee + platformFee;

  const handleOrderNow = async () => {
    if (!user) {
      setOrderMsg("You must be logged in to order.");
      return;
    }
    if (cart.length === 0) {
      setOrderMsg("Your cart is empty.");
      return;
    }
    setOrderLoading(true);
    setOrderMsg("");
    const order = {
      user_id: user.id,
      email:
        user.primaryEmailAddress?.emailAddress ||
        user.emailAddresses[0]?.emailAddress ||
        "",
      items: cart.map(({ id, name, price, quantity }) => ({
        id,
        name,
        price,
        quantity,
      })),
      subtotal,
      delivery_fee: deliveryFee,
      platform_fee: platformFee,
      total: totalAmount,
      orderTime: new Date(),
      status: "pending",
    };
    const { error } = await supabase.from("userOrders").insert([order]);
    setOrderLoading(false);
    if (error) {
      setOrderMsg("❌ Failed to place order. Please try again.");
    } else {
      setOrderMsg(
        "Thank you! Your order was placed. Please wait for the seller's response."
      );
      setCart([]);
      setCartItems(0);
      setshowCart(false);
      setTimeout(() => setOrderMsg(""), 5000);
    }
  };

  if (loading) {
    return <ShimmerPage />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-6xl mb-4">😔</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => {
              setError(null);
              setLoading(true);
              fetchAllItems();
            }}
            className="px-6 py-3 bg-rose-600 text-white font-medium rounded-lg hover:bg-rose-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {checkedAdmin && isAdmin && (
        <div className="bg-blue-50 border-b border-blue-200 text-blue-900 text-sm px-4 py-2.5 flex items-center justify-center gap-4">
          <span className="font-medium">Admin mode enabled</span>
          <Link
            to="/admin"
            className="underline hover:text-blue-700 transition-colors"
          >
            Admin Dashboard
          </Link>
          <Link
            to="/my-orders"
            className="underline hover:text-blue-700 transition-colors"
          >
            My Orders
          </Link>
        </div>
      )}

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/home" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-rose-600 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div>
                <span className="text-xl font-bold text-gray-900">
                  Night Canteen
                </span>
                <div className="text-xs text-gray-500">Fast Delivery</div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link
                to="/home"
                className="text-gray-900 font-medium hover:text-rose-600 transition-colors"
              >
                Home
              </Link>
              <Link
                to="/my-orders"
                className="text-gray-600 font-medium hover:text-rose-600 transition-colors"
              >
                My Orders
              </Link>
              {checkedAdmin && isAdmin && (
                <Link
                  to="/admin"
                  className="text-blue-600 font-medium hover:text-blue-700 transition-colors"
                >
                  Admin
                </Link>
              )}
              <button
                onClick={() => setShowProfile(true)}
                className="flex items-center gap-2 text-gray-600 font-medium hover:text-rose-600 transition-colors"
              >
                <User className="w-5 h-5" />
                Profile
              </button>
            </div>

            {/* Desktop Cart */}
            <div className="hidden md:flex items-center">
              <button
                onClick={() => {
                  if (!cartItems || cartItems.length === 0) {
                    alert("Please add items to the cart first!");
                    return;
                  }
                  setshowCart(!showCart);
                }}
                className="relative p-2.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ShoppingCart className="w-6 h-6 text-gray-700" />
                {cartItems?.length > 0 && (
                  <div className="absolute -top-1 -right-1 bg-rose-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                    {cartItems.length}
                  </div>
                )}
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-2">
              <button
                onClick={() => {
                  if (!cartItems || cartItems.length === 0) {
                    alert("Please add items to the cart first!");
                    return;
                  }
                  setshowCart(!showCart);
                }}
                className="relative p-2"
              >
                <ShoppingCart className="w-6 h-6 text-gray-700" />
                {cartItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                    {cartItems}
                  </span>
                )}
              </button>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden pb-4 border-t border-gray-200">
              <div className="pt-4 space-y-2">
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search for food..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-600 focus:border-transparent"
                  />
                </div>
                <Link
                  to="/home"
                  className="block px-3 py-2.5 text-gray-900 font-medium rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Home
                </Link>
                <Link
                  to="/my-orders"
                  className="block px-3 py-2.5 text-gray-600 font-medium rounded-lg hover:bg-gray-100 transition-colors"
                >
                  My Orders
                </Link>
                <button
                  onClick={() => {
                    setShowProfile(true);
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2.5 text-gray-600 font-medium rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Profile
                </button>
                {checkedAdmin && isAdmin && (
                  <Link
                    to="/admin"
                    className="block px-3 py-2.5 text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    Admin Dashboard
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Profile Modal */}
      {showProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              onClick={() => setShowProfile(false)}
            >
              <X className="w-6 h-6" />
            </button>
            <Profile />
            <div className="mt-6">
              <SignOutButton
                signOutCallback={() => navigate("/signup", { replace: true })}
              >
                <button className="w-full bg-rose-600 hover:bg-rose-700 text-white font-medium py-3 rounded-lg transition-colors">
                  Logout
                </button>
              </SignOutButton>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-rose-600 to-pink-600 text-white px-4 py-16">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Midnight Cravings?
            <br className="md:hidden" /> We've Got You!
          </h1>
          <p className="text-lg md:text-xl mb-8 opacity-95">
            Order your favorite comfort food • Delivered in 15-20 mins •
            Available 24/7
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <div className="flex items-center space-x-2 bg-white bg-opacity-20 backdrop-blur-sm px-5 py-2.5 rounded-full">
              <Clock className="w-5 h-5" />
              <span className="font-medium">15-20 min delivery</span>
            </div>
            <div className="flex items-center space-x-2 bg-white bg-opacity-20 backdrop-blur-sm px-5 py-2.5 rounded-full">
              <Star className="w-5 h-5 fill-current" />
              <span className="font-medium">4.8 (2.1k+ reviews)</span>
            </div>
            <div className="flex items-center space-x-2 bg-white bg-opacity-20 backdrop-blur-sm px-5 py-2.5 rounded-full">
              <MapPin className="w-5 h-5" />
              <span className="font-medium">Panipat Area</span>
            </div>
          </div>
        </div>
      </section>

      {/* Search Bar - Desktop Only */}
      <div className="hidden md:block bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for dishes, cuisines..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-600 focus:border-transparent text-base"
            />
          </div>
        </div>
      </div>

      {/* Categories Filter */}
      <section className="bg-white px-4 py-4 border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto">
          <div className="flex space-x-2 overflow-x-auto scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-5 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === category
                    ? "bg-rose-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {category}
                {category !== "All" && (
                  <span className="ml-1.5 text-xs opacity-75">
                    (
                    {
                      allItems.filter((item) => item.category === category)
                        .length
                    }
                    )
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {selectedCategory === "All" ? "All Items" : selectedCategory}
            </h2>
            <p className="text-gray-600 mt-1">
              {searchedItems.length} items available
            </p>
          </div>
        </div>

        {/* Food Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {searchedItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-200 overflow-hidden"
            >
              {/* Image Section */}
              <div className="relative h-48">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
                <button className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors">
                  <Heart className="w-5 h-5 text-gray-600" />
                </button>
                {item.tag && (
                  <div className="absolute top-3 left-3 px-3 py-1 bg-rose-600 text-white text-xs font-semibold rounded-full">
                    {item.tag}
                  </div>
                )}
                {item.time && (
                  <div className="absolute bottom-3 left-3 flex items-center space-x-1 bg-white px-3 py-1 rounded-full shadow-sm">
                    <Clock className="w-4 h-4 text-green-600" />
                    <span className="text-xs font-medium text-gray-900">
                      {item.time}
                    </span>
                  </div>
                )}
              </div>

              {/* Content Section */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 leading-tight flex-1">
                    {item.name}
                  </h3>
                  <div className="flex items-center space-x-1 text-sm ml-2">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="font-semibold text-gray-900">
                      {item.rating}
                    </span>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {item.description}
                </p>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl font-bold text-gray-900">
                      ₹{item.price}
                    </span>
                    {item.originalPrice && item.originalPrice > item.price && (
                      <>
                        <span className="text-sm text-gray-500 line-through">
                          ₹{item.originalPrice}
                        </span>
                        <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-semibold rounded">
                          {Math.round(
                            ((item.originalPrice - item.price) /
                              item.originalPrice) *
                              100
                          )}
                          % OFF
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Add to Cart Section */}
                {getItemQuantity(item.id) === 0 ? (
                  <button
                    onClick={() => addToCart(item)}
                    className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Add to Cart
                  </button>
                ) : (
                  <div className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                    <button
                      onClick={() => removeFromCart(item)}
                      className="w-9 h-9 bg-rose-600 hover:bg-rose-700 text-white rounded-lg flex items-center justify-center font-bold transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-base font-semibold text-gray-900 px-3">
                      {getItemQuantity(item.id)}
                    </span>
                    <button
                      onClick={() => addToCart(item)}
                      className="w-9 h-9 bg-rose-600 hover:bg-rose-700 text-white rounded-lg flex items-center justify-center font-bold transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {searchedItems.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              No items found
            </h3>
            <p className="text-gray-600 mb-6">
              Try searching with different keywords or check other categories
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
              }}
              className="px-6 py-3 bg-rose-600 text-white font-medium rounded-lg hover:bg-rose-700 transition-colors"
            >
              Browse All Items
            </button>
          </div>
        )}
      </main>

      {/* Cart Summary - Fixed at Bottom */}
      {showOrderSummary && (
        <>
          {/* Overlay */}
          {showCart && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
              onClick={() => setshowCart(false)}
            />
          )}

          {/* Cart Button - Always Visible */}
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
            <div className="bg-rose-600 text-white px-4 py-3">
              <div className="max-w-7xl mx-auto flex items-center justify-between">
                <button
                  onClick={() => setshowCart(!showCart)}
                  className="flex items-center space-x-3"
                >
                  <Receipt className="w-5 h-5" />
                  <span className="font-semibold">
                    Your Cart ({cartItems} {cartItems === 1 ? "item" : "items"})
                  </span>
                </button>
                <div className="flex items-center space-x-3">
                  <span className="text-xl font-bold">₹{totalAmount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Slide Up Cart Panel */}
          <div
            className={`fixed inset-0 z-50 bg-white transform transition-transform duration-300 ease-in-out ${
              showCart ? "translate-y-0" : "translate-y-full"
            }`}
            style={{ top: 0, height: "100vh" }}
          >
            {/* Close Button */}
            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={() => setshowCart(false)}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Two Column Layout */}
            <div className="h-full flex flex-col md:flex-row overflow-hidden">
              {/* Left Side - Cart Items */}
              <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
                <div className="max-w-3xl mx-auto">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Your Items
                  </h2>

                  {cart.length === 0 ? (
                    <div className="text-center py-16">
                      <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Your cart is empty
                      </h3>
                      <p className="text-gray-600">
                        Add some delicious items to get started!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {cart.map((item) => (
                        <div
                          key={item.id}
                          className="bg-white rounded-xl p-4 shadow-sm border border-gray-200"
                        >
                          <div className="flex gap-4">
                            {/* Item Image */}
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                            />

                            {/* Item Details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-900 text-lg">
                                    {item.name}
                                  </h4>
                                  <p className="text-gray-600 text-sm">
                                    {item.description}
                                  </p>
                                </div>
                                <button
                                  onClick={() => removeItemCompletely(item)}
                                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors ml-2"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </div>

                              <div className="flex items-center justify-between mt-3">
                                <p className="text-lg font-bold text-gray-900">
                                  ₹{item.price} each
                                </p>

                                {/* Quantity Controls */}
                                <div className="flex items-center space-x-3 bg-gray-100 rounded-lg p-2">
                                  <button
                                    onClick={() => removeFromCart(item)}
                                    className="w-8 h-8 bg-rose-600 hover:bg-rose-700 text-white rounded-lg flex items-center justify-center transition-colors"
                                  >
                                    <Minus className="w-4 h-4" />
                                  </button>
                                  <span className="text-base font-semibold text-gray-900 px-3 min-w-[2rem] text-center">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() => addToCart(item)}
                                    className="w-8 h-8 bg-rose-600 hover:bg-rose-700 text-white rounded-lg flex items-center justify-center transition-colors"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>

                              <div className="mt-2 text-right">
                                <p className="text-sm text-gray-600">
                                  Item Total:{" "}
                                  <span className="font-bold text-gray-900">
                                    ₹{item.price * item.quantity}
                                  </span>
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Side - Bill Summary */}
              <div className="w-full md:w-96 bg-white border-l border-gray-200 p-6 flex flex-col">
                <div className="flex-1 overflow-y-auto">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Bill Summary
                  </h2>

                  {/* Bill Details */}
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-base">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-semibold text-gray-900">
                        ₹{subtotal}
                      </span>
                    </div>

                    <div className="flex justify-between text-base">
                      <span className="text-gray-600">Delivery Fee</span>
                      <span className="font-semibold text-gray-900">
                        ₹{deliveryFee}
                      </span>
                    </div>

                    <div className="flex justify-between text-base">
                      <span className="text-gray-600">Platform Fee</span>
                      <span className="font-semibold text-gray-900">
                        ₹{platformFee}
                      </span>
                    </div>

                    <div className="border-t-2 border-gray-200 pt-4 mt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-gray-900">
                          Total Amount
                        </span>
                        <span className="text-2xl font-bold text-rose-600">
                          ₹{totalAmount}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Order Message */}
                  {orderMsg && (
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm font-medium text-green-800 mb-2">
                        {orderMsg}
                      </p>
                      <Link
                        to="/my-orders"
                        className="text-sm text-green-700 underline hover:text-green-800 font-medium"
                      >
                        View My Orders →
                      </Link>
                    </div>
                  )}
                </div>

                {/* Action Buttons - Sticky at Bottom */}
                <div className="space-y-3 pt-6 border-t border-gray-200">
                  <button
                    onClick={handleOrderNow}
                    disabled={orderLoading || cart.length === 0}
                    className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                  >
                    {orderLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Placing Order...</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5" />
                        <span>Place Order</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setCart([]);
                      setCartItems(0);
                    }}
                    disabled={cart.length === 0}
                    className="w-full py-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default HomePage;
