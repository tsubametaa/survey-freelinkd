"use client";

import React, { useState } from "react";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/auth/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Save user data to localStorage
        localStorage.setItem(
          "adminUser",
          JSON.stringify({ email: data.user.email })
        );
        alert("Login successful!");
        // Redirect to dashboard
        window.location.href = "/site/admin";
      } else {
        alert(data.error || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("An error occurred during login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-100 to-blue-200">
      <div className="p-8 rounded-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-(--foreground)">
          Admin Login
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-(--secondary) mb-2"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-(--secondary) rounded-md focus:outline-none focus:ring-2 focus:ring-(--btn) focus:border-transparent"
              required
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-(--secondary) mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-(--secondary) rounded-md focus:outline-none focus:ring-2 focus:ring-(--btn) focus:border-transparent"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-(--btn) text-white py-2 px-4 rounded-md hover:bg-(--hit) focus:outline-none focus:ring-2 focus:ring-(--btn) focus:ring-opacity-50 transition duration-200"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
