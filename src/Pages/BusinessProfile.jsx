import React, { useState } from "react";

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
  "Other",
];

const BusinessProfile = ({ onSubmit, initialData }) => {
  const [form, setForm] = useState(initialData || initialState);
  const [logoPreview, setLogoPreview] = useState(null);
  const [stampPreview, setStampPreview] = useState(null);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) onSubmit(form);
  };

  return (
    <div className="max-w-xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-lg shadow mt-10">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white text-center">Business Profile</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 dark:text-white mb-1">Business Name</label>
          <input
            type="text"
            name="businessName"
            value={form.businessName}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none dark:bg-gray-900 dark:text-white"
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
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none dark:bg-gray-900 dark:text-white"
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
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none dark:bg-gray-900 dark:text-white"
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
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none dark:bg-gray-900 dark:text-white"
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
          {logoPreview && <img src={logoPreview} alt="Logo Preview" className="h-16 mt-2 rounded" />}
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
          {stampPreview && <img src={stampPreview} alt="Stamp Preview" className="h-16 mt-2 rounded" />}
        </div>
        <div>
          <label className="block text-gray-700 dark:text-white mb-1">Business Category</label>
          <select
            name="businessCategory"
            value={form.businessCategory}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none dark:bg-gray-900 dark:text-white"
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        {/* Add more fields as needed */}
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition-colors"
        >
          Save Business Profile
        </button>
      </form>
    </div>
  );
};

export default BusinessProfile;
