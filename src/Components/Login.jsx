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
  const [useOtp, setUseOtp] = useState(false); 

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.warning("Please fill in all fields!");
      return;
    }

    try {
      if (useOtp) {
        // OTP login flow
        const res = await axios.post(`https://mims-backend-x0i3.onrender.com/login-with-otp`, {
          email,
          password,
        });

        if (res.data.status === "otp-sent") {
          toast.success("OTP sent to your email");
          setStep(2);
        } else {
          toast.error("Invalid email or password");
        }
      } else {
        // Non-OTP login flow
        const res = await axios.post(`https://mims-backend-x0i3.onrender.com/login`, {
          email,
          password,
        });

        if (res.data === "success") {
          // Fetch user data after successful login
          const userRes = await axios.post(`https://mims-backend-x0i3.onrender.com/get-user`, {
            email,
          });
          
          login({ email, name: userRes.data.name });
          toast.success("Login successful");
          navigate("/home");
        } else {
          toast.error(res.data);
        }
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || 
        "Login failed. Please try again."
      );
    }
  };

  // Existing verifyOtp function
  const verifyOtp = async () => {
    if (!otp) {
      toast.warning("Please enter OTP!");
      return;
    }

    try {
      const res = await axios.post(`https://mims-backend-x0i3.onrender.com/verify-login-otp`, {
        email,
        otp,
      });

      if (res.data.status === "success") {
        login({ email, name: res.data.name });
        toast.success("Login successful");
        navigate("/home");
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

        {/* OTP Toggle */}
        <div className="hidden justify-center mb-4">
        <div className="flex  justify-center mb-4">
          <span className="mr-2 text-sm text-gray-600">Use OTP Verification</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={useOtp}
              onChange={() => setUseOtp(!useOtp)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
        </div>


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
              {useOtp ? "Send OTP" : "Login"}
            </button>
          </form>
        ) : (
          useOtp && ( // Only show OTP step if using OTP
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
          )
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
