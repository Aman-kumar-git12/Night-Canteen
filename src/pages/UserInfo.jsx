import React, { useState } from "react";
import supabase from "../connection/supabase-client";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

const UserInfoForm = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    age: "",
    gender: "",
    phone: "",
    year: "",
    roomNo: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (!user) {
      alert("User not authenticated");
      setLoading(false);
      return;
    }
    const { fullName, age, gender, phone, year, roomNo } = formData;
    const { error } = await supabase.from("profiles").insert([
      {
        id: user.id,
        full_name: fullName,
        age: age ? parseInt(age) : null,
        gender,
        phone,
        email: user.primaryEmailAddress?.emailAddress || user.emailAddresses[0]?.emailAddress || "",
        year,
        room_no: roomNo,
      },
    ]);
    setLoading(false);
    if (error) {
      
      alert("❌ Failed to save information.");
    } else {
      alert("✅ Information submitted successfully!");
      setFormData({
        fullName: "",
        age: "",
        gender: "",
        phone: "",
        year: "",
        roomNo: "",
      });
      navigate("/", { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-lg">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
          User Information Form
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-gray-700">Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
              className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring focus:ring-indigo-300"
              required
            />
          </div>
          {/* Age */}
          <div>
            <label className="block text-gray-700">Age</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              placeholder="Enter your age"
              className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring focus:ring-indigo-300"
              required
            />
          </div>
          {/* Gender */}
          <div>
            <label className="block text-gray-700">Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring focus:ring-indigo-300"
              required
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          {/* Phone Number */}
          <div>
            <label className="block text-gray-700">Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
              className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring focus:ring-indigo-300"
              required
            />
          </div>
          {/* Year */}
          <div>
            <label className="block text-gray-700">Year</label>
            <select
              name="year"
              value={formData.year}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring focus:ring-indigo-300"
              required
            >
              <option value="">Select year</option>
              <option value="1st">1st Year</option>
              <option value="2nd">2nd Year</option>
              <option value="3rd">3rd Year</option>
              <option value="4th">4th Year</option>
            </select>
          </div>
          {/* Room Number */}
          <div>
            <label className="block text-gray-700">Room Number</label>
            <input
              type="text"
              name="roomNo"
              value={formData.roomNo}
              onChange={handleChange}
              placeholder="Enter your room number"
              className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring focus:ring-indigo-300"
              required
            />
          </div>
          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition"
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserInfoForm;
