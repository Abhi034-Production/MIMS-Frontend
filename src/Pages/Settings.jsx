import React, { useEffect, useState, useContext } from "react";
import AdminLayout from "../Components/AdminLayout";
import { Link, useNavigate } from "react-router-dom";
import { MdOutlineHome } from "react-icons/md";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { ThemeContext } from "../Context/ThemeContext";
import { AuthContext } from "../Context/AuthContext"; 

const Settings = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const { theme, toggleTheme } = useContext(ThemeContext);
  const { user, login } = useContext(AuthContext);

  useEffect(() => {
    if (user && user.email) {
      setName(user.name || "");
    } else {
      toast.error("Unauthorized. Redirecting to login...");
      navigate("/");
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.put(`http://localhost:3001/update-admin`, {
        email: user.email,
        name,
        password: newPassword,
      });

      if (res.data.status === "success") {
        const updatedUser = { ...user, name };
        login(updatedUser);
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
      <div className="text-sm text-gray-600 mb-4 dark:text-white">
        <nav className="flex items-center space-x-2">
          <span className="text-gray-500 dark:text-white">
            <Link to="/home">
              <MdOutlineHome fontSize={20} />
            </Link>
          </span>
          <span className="text-gray-400 dark:text-white">/</span>
          <span className="font-semibold text-gray-800 dark:text-white">Settings</span>
        </nav>
      </div>

      <div className="p-4 md:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Theme</h2>
          <button
            onClick={toggleTheme}
            className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition w-full md:w-auto"
          >
            Switch to {theme === "light" ? "Dark" : "Light"} Mode
          </button>
        </div>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm text-gray-600 dark:text-white">Email</label>
              <input
                type="email"
                className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                value={user?.email || ""}
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-white">Name</label>
              <input
                type="text"
                className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-white">Change Password</label>
              <input
                type="password"
                className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
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