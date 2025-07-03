import React, { useEffect, useState } from "react";
import AdminLayout from "../Components/AdminLayout";
import { Link, useNavigate } from "react-router-dom";
import { MdOutlineHome } from "react-icons/md";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

const Settings = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    const storedAdmin = JSON.parse(localStorage.getItem("adminInfo"));
    if (storedAdmin) {
      setEmail(storedAdmin.email);
    } else {
      toast.error("Unauthorized. Redirecting to login...");
      navigate("/login");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.put(`https://mims-backend-x0i3.onrender.com/update-admin`, {
        email,
        name,
        password: newPassword,
      });

      if (res.data.status === "success") {
        localStorage.setItem("adminInfo", JSON.stringify({ email, name }));
        toast.success("Profile updated successfully!");
      } else {
        toast.error("Update failed.");
      }
    } catch (err) {
      toast.error("Server error");
    }
  };


  return (
    <AdminLayout>
      <div className="text-sm text-gray-600 mb-4">
        <nav className="flex items-center space-x-2">
          <span className="text-gray-500">
            <Link to="/home">
              <MdOutlineHome fontSize={20} />
            </Link>
          </span>
          <span className="text-gray-400">/</span>
          <span className="font-semibold text-gray-800">Settings</span>
        </nav>
      </div>

      <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
        <div className="bg-white shadow rounded-lg p-6">
        

          <form className="space-y-4" onSubmit={handleSubmit}>
         

            <div>
              <label className="block text-sm text-gray-600">Email</label>
              <input
                type="email"
                className="w-full border border-gray-300 rounded px-3 py-2"
                value={email}
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600">Change Password</label>
              <input
                type="password"
                className="w-full border border-gray-300 rounded px-3 py-2"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New Password"
              />
            </div>

            <button
              type="submit"
              className="bg-[#5990d7] text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Save Changes
            </button>
          </form>
        </div>
        <ToastContainer />
      </div>
    </AdminLayout>
  );
};

export default Settings;
