import React, { useEffect, useState } from "react";
import supabase from "../../connection/supabase-client";
import { Plus, Edit, Trash2, Save, X, RefreshCw } from "lucide-react";

const ManageItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    price: "",
    originalPrice: "",
    category: "",
    image: "",
    description: "",
  });

  // Fetch items from Supabase
  const fetchItems = async () => {
    setLoading(true);
    setError("");
    const { data, error } = await supabase
      .from("allItems")
      .select("*")
      .order("id", { ascending: true });
    
    if (error) {
      setError(`Failed to load items: ${error.message}`);
    } else {
      setItems((data || []).map((it) => ({ ...it, _edit: false })));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Toggle edit mode for an item
  const toggleEditItem = (id, on) => {
    setItems((arr) => arr.map((it) => (it.id === id ? { ...it, _edit: on } : it)));
  };

  // Update item field
  const changeItemField = (id, field, value) => {
    setItems((arr) => arr.map((it) => (it.id === id ? { ...it, [field]: value } : it)));
  };

  // Save item changes
  const saveItem = async (item) => {
    setSaving(true);
    const { id, name,price , originalPrice, category, image, description } = item;
    
    const { error } = await supabase
      .from("allItems")
      .update({ name, price : Number(price)  , originalPrice: Number(originalPrice), category, image, description })
      .eq("id", id);
    
    setSaving(false);
    if (error) {
      alert(`Failed to save item: ${error.message}`);
    } else {
      toggleEditItem(id, false);
      await fetchItems();
    }
  };

  // Delete item
  const deleteItem = async (id) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    
    const { error } = await supabase
      .from("allItems")
      .delete()
      .eq("id", id);
    
    if (error) {
      alert(`Failed to delete item: ${error.message}`);
    } else {
      setItems((arr) => arr.filter((it) => it.id !== id));
    }
  };

  // Add new item
  const addItem = async (e) => {
    e.preventDefault();
    const { name, price, originalPrice, category, image, description } = newItem;
    
    if (!name || !price || !originalPrice) {
      alert("Name, price and original price are required");
      return;
    }
    
    setSaving(true);
    const itemData = {
      name,
      price: Number(price),
      originalPrice: Number(originalPrice),
      category: category || "Other",
      image: image || "",
      description: description || "",
    };
    
    const { error } = await supabase
      .from("allItems")
      .insert([itemData]);
    
    setSaving(false);
    if (error) {
      alert(`Failed to add item: ${error.message}`);
    } else {
      setNewItem({
        name: "",
        price: "",
        originalPrice: "",
        category: "",
        image: "",
        description: "",
      });
      setShowAddForm(false);
      await fetchItems();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-2 text-gray-600">Loading items...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={fetchItems}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Menu Items ({items.length})</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchItems}
            className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            {showAddForm ? "Cancel" : "Add Item"}
          </button>
        </div>
      </div>

      {/* Add New Item Form */}
      {showAddForm && (
        <div className="bg-gray-50 rounded-xl p-6 border-2 border-dashed border-gray-300">
          <h4 className="text-md font-semibold text-gray-800 mb-4">Add New Menu Item</h4>
          <form onSubmit={addItem} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                placeholder="Item name"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
              <input
                type="number"
                value={newItem.price}
                onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                placeholder="Price"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">OriginalPrice *</label>
              <input
                type="number"
                value={newItem.originalPrice}
                onChange={(e) => setNewItem({ ...newItem, originalPrice: e.target.value })}
                placeholder="Price"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <input
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                placeholder="Category"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
              <input
                value={newItem.image}
                onChange={(e) => setNewItem({ ...newItem, image: e.target.value })}
                placeholder="Image URL"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                placeholder="Description"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={saving}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? "Adding..." : "Add Item"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Items List */}
      <div className="space-y-4">
        {items.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No menu items found. Add your first item!
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="bg-white border rounded-xl p-4 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                {/* Name */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
                  <input
                    className={`w-full border rounded-lg px-3 py-2 ${
                      item._edit ? "bg-white border-indigo-300" : "bg-gray-50 border-gray-200"
                    }`}
                    disabled={!item._edit}
                    value={item.name || ""}
                    onChange={(e) => changeItemField(item.id, "name", e.target.value)}
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Price</label>
                  <input
                    type="number"
                    className={`w-full border rounded-lg px-3 py-2 ${
                      item._edit ? "bg-white border-indigo-300" : "bg-gray-50 border-gray-200"
                    }`}
                    disabled={!item._edit}
                    value={item.price || ""}
                    onChange={(e) => changeItemField(item.id, "price", e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Original Price</label>
                  <input
                    type="number"
                    className={`w-full border rounded-lg px-3 py-2 ${
                      item._edit ? "bg-white border-indigo-300" : "bg-gray-50 border-gray-200"
                    }`}
                    disabled={!item._edit}
                    value={item.originalPrice || ""}
                    onChange={(e) => changeItemField(item.id, "originalPrice", e.target.value)}
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
                  <input
                    className={`w-full border rounded-lg px-3 py-2 ${
                      item._edit ? "bg-white border-indigo-300" : "bg-gray-50 border-gray-200"
                    }`}
                    disabled={!item._edit}
                    value={item.category || ""}
                    onChange={(e) => changeItemField(item.id, "category", e.target.value)}
                  />
                </div>

                {/* Image */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Image URL</label>
                  <input
                    className={`w-full border rounded-lg px-3 py-2 ${
                      item._edit ? "bg-white border-indigo-300" : "bg-gray-50 border-gray-200"
                    }`}
                    disabled={!item._edit}
                    value={item.image || ""}
                    onChange={(e) => changeItemField(item.id, "image", e.target.value)}
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                  <input
                    className={`w-full border rounded-lg px-3 py-2 ${
                      item._edit ? "bg-white border-indigo-300" : "bg-gray-50 border-gray-200"
                    }`}
                    disabled={!item._edit}
                    value={item.description || ""}
                    onChange={(e) => changeItemField(item.id, "description", e.target.value)}
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {item._edit ? (
                    <>
                      <button
                        onClick={() => saveItem(item)}
                        disabled={saving}
                        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
                        title="Save"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleEditItem(item.id, false)}
                        className="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                        title="Cancel"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => toggleEditItem(item.id, true)}
                        className="p-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ManageItems;
