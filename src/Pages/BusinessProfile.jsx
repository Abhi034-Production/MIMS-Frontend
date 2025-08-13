import React, { useState, useContext } from "react";
import { AuthContext } from "../Context/AuthContext";
import { useNavigate } from "react-router-dom";

const initialState = {
  businessName: "",
  businessMobile: "",
  businessAddress: "",
  businessEmail: "",
  businessLogo: null,
  businessStamp: null,
  businessCategory: "",
};

const categories = [
  "Retail Shop",
  "Wholesale Shop",
  "Service",
  "Agriculture Shop",
  "Share Market Trade Management",
  "Manufacturing",
  "Transport",
  "Food and Beverage",
  "Healthcare",
  "Education",
  "Real Estate",
  "IT Services",
  "Finance",
  "Consulting",
  "Entertainment",
  "Travel and Tourism",
  "Construction",
  "Automotive",
  "Logistics",
  "Other",
];

const BusinessProfile = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState(initialState);
  const [logoPreview, setLogoPreview] = useState(null);
  const [stampPreview, setStampPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setForm({ ...form, [name]: files[0] });
      if (name === "businessLogo") setLogoPreview(URL.createObjectURL(files[0]));
      if (name === "businessStamp") setStampPreview(URL.createObjectURL(files[0]));
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user || !user.email) {
      alert("User not logged in");
      return;
    }

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      formData.append(key, value);
    });
    formData.append("userEmail", user.email);

    try {
      setLoading(true);
      setMessage("");

      const response = await fetch("http://localhost:3001/business-profile", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      setLoading(false);

      // console.log("Response from backend:", result);

      if (result.status === "success") {
        setMessage("✅ Business profile saved successfully!");
        // Store the selected business category in localStorage
        if (form.businessCategory) {
          localStorage.setItem("businessCategory", form.businessCategory);
        }
        setForm(initialState);
        setLogoPreview(null);
        setStampPreview(null);
        setTimeout(() => navigate("/home"), 1000);
      } else {
        setMessage(`❌ ${result.message || "Something went wrong!"}`);
      }
    } catch (error) {
      setLoading(false);
      // console.error("Error submitting business profile:", error);
      setMessage("❌ Failed to connect to server.");
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-lg shadow mt-10">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white text-center">
        Business Profile
      </h2>

      {message && (
        <p className={`mb-4 text-center ${message.includes("✅") ? "text-green-600" : "text-red-600"}`}>
          {message}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
        <div>
          <label className="block text-gray-700 dark:text-white mb-1">Business Name</label>
          <input
            type="text"
            name="businessName"
            value={form.businessName}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-gray-700 dark:text-white mb-1">Business Mobile Number</label>
          <input
            type="tel"
            name="businessMobile"
            value={form.businessMobile}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-gray-700 dark:text-white mb-1">Business Address</label>
          <input
            type="text"
            name="businessAddress"
            value={form.businessAddress}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-gray-700 dark:text-white mb-1">Business Email</label>
          <input
            type="email"
            name="businessEmail"
            value={form.businessEmail}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-gray-700 dark:text-white mb-1">Business Logo</label>
          <input
            type="file"
            name="businessLogo"
            accept="image/*"
            onChange={handleChange}
            className="w-full text-gray-700 dark:text-white"
          />
          {logoPreview && (
            <img src={logoPreview} alt="Logo Preview" className="h-16 mt-2 rounded" />
          )}
        </div>

        <div>
          <label className="block text-gray-700 dark:text-white mb-1">Business Stamp/Sign</label>
          <input
            type="file"
            name="businessStamp"
            accept="image/*"
            onChange={handleChange}
            className="w-full text-gray-700 dark:text-white"
          />
          {stampPreview && (
            <img src={stampPreview} alt="Stamp Preview" className="h-16 mt-2 rounded" />
          )}
        </div>

        <div>
          <label className="block text-gray-700 dark:text-white mb-1">Business Category</label>
          <select
            name="businessCategory"
            value={form.businessCategory}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-900 dark:text-white"
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full ${
            loading ? "bg-blue-300" : "bg-blue-600 hover:bg-blue-700"
          } text-white font-semibold py-2 rounded transition-colors`}
        >
          {loading ? "Saving..." : "Save Business Profile"}
        </button>
      </form>
    </div>
  );
};

export default BusinessProfile;