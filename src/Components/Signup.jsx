import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";


const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post(`https://mims-backend-x0i3.onrender.com/register`, { name, email, password })
      .then(() => navigate("/login"))
      .catch((err) => console.error(err));
  };


  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-green-200 via-blue-100 to-purple-200 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-2xl border border-gray-300">
        <h1 className="text-center text-3xl sm:text-4xl font-extrabold text-gray-800 mb-6">
          Signup
        </h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-4 focus:ring-blue-400"
              placeholder="Enter your name..."
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-4 focus:ring-blue-400"
              placeholder="Enter your email..."
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full h-12 px-4 pr-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-4 focus:ring-blue-400"
                placeholder="Enter password..."
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500 hover:text-gray-800"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full h-12 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 hover:scale-105 transition duration-300"
          >
            Signup
          </button>
        </form>

        <div className="text-center mt-6 text-sm text-gray-600">
          <p>
            Already have an account?
            <Link
              to="/"
              className="ml-2 text-blue-600 font-semibold hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
