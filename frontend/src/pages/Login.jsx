import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import loginimage from "../assets/loginImage.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/users/login", {
        email: email,
        password: password
      });
      localStorage.setItem("token", res.data.token);
      alert("Login successful!");
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex flex-col lg:flex-row min-h-screen px-6 md:px-10 py-1">
        {/* LEFT SIDE (Image) */}
        <div className="lg:w-1/2 w-full flex items-center justify-center bg-white mb-10 lg:mb-0">
          <img
            className="h-auto w-3/4 md:w-2/3 lg:w-full"
            src={loginimage}
            alt="Login Visual"
          />
        </div>

        {/* RIGHT SIDE (Form) */}
        <div className="lg:w-1/2 w-full flex items-center justify-center">
          <div className="bg-white/40 backdrop-blur-xl w-full max-w-sm p-8 rounded-2xl shadow-2xl border border-white/50">
            <h2 className="text-3xl font-semibold text-center text-green-900 mb-6 drop-shadow-sm">
              Welcome Back
            </h2>

            <form className="flex flex-col space-y-4" onSubmit={handleLogin}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-white/60 focus:bg-white outline-none border border-green-500 shadow-sm transition"
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-white/60 focus:bg-white outline-none border border-green-500 shadow-sm transition"
              />

              <button
                type="submit"
                className="w-full py-2 rounded-xl text-white font-medium shadow-lg transition bg-gradient-to-r from-green-500 to-yellow-400 hover:from-green-600 hover:to-yellow-500"
              >
                Login
              </button>
            </form>

            <p className="text-center text-green-900 mt-4 text-sm drop-shadow-sm">
              Don't have an account?{" "}
              <a href="/signup" className="font-semibold text-green-700">
                Sign Up
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
