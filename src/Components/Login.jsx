

import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { AuthContext } from "../Context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.warning("Please fill in all fields!");
      return;
    }

    try {
      const res = await axios.post(`https://mobile-inventory-management-system.vercel.app/login-with-otp`, {
        email,
        password,
      });

      if (res.data.status === "otp-sent") {
        toast.success("OTP sent to your email");
        setStep(2);
      } else {
        toast.error("Invalid email or password");
      }
    } catch (err) {
      toast.error("Login failed. Please try again.");
    }
  };

  const verifyOtp = async () => {
    if (!otp) {
      toast.warning("Please enter OTP!");
      return;
    }

    try {
      const res = await axios.post(`https://mobile-inventory-management-system.vercel.app/verify-login-otp`, {
        email,
        otp,
      });

      if (res.data.status === "success") {
        login({ email, name: res.data.name }); // ✅ Save to context + localStorage
        toast.success("Login successful");
        navigate("/home"); // ✅ Redirect to home
      } else {
        toast.error(res.data.message || "OTP verification failed");
      }
    } catch (err) {
      toast.error("OTP verification failed");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-green-200 via-blue-100 to-purple-200 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-2xl border border-gray-300">
        <h1 className="text-center text-3xl sm:text-4xl font-extrabold text-gray-800 mb-6">
          Login
        </h1>

        {step === 1 ? (
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                placeholder="Enter email"
                className="w-full h-12 px-4 border rounded-lg"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  className="w-full h-12 px-4 pr-12 border rounded-lg"
                  value={password}
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
              className="w-full h-12 bg-blue-600 hover:scale-105 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Send OTP
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Enter OTP sent to <b>{email}</b>
            </label>
            <input
              type="text"
              placeholder="Enter OTP"
              className="w-full h-12 px-4 border rounded-lg"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
            <button
              onClick={verifyOtp}
              className="w-full h-12 hover:scale-105 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Verify OTP
            </button>
          </div>
        )}

        <div className="text-center mt-6 text-sm text-gray-600">
          <p>
            Don't have an account?
            <Link
              to="/signup"
              className="ml-2 text-blue-600 font-semibold hover:underline"
            >
              Signup
            </Link>
          </p>
        </div>

        <ToastContainer />
      </div>
    </div>
  );
};

export default Login;
