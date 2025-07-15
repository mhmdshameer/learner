"use client";

import Link from "next/link";
import { useState } from "react";
import { TbEye, TbEyeOff } from "react-icons/tb";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function Register() {
  const router = useRouter();
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async(e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await axios.post("/api/signUp", data);
      const token = response.data.token;
      localStorage.setItem("token", token);
      router.push("/");
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f6fa]">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-center mb-6 text-[#1e1e2f]">
          Register
        </h1>
        <p className="text-sm text-center text-gray-400 mb-6">
          If you already have an account, please{" "}
          <Link href="/login" className="text-blue-500">
            login
          </Link>
        </p>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <label htmlFor="name" className="font-bold text-sm text-gray-400">
            Name
          </label>
          <input
            type="text"
            id="name"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e1e2f]"
            placeholder="Enter your name"
            value={data.name}
            onChange={(e) => setData({ ...data, name: e.target.value })}
            required
          />
          <label htmlFor="email" className="font-bold text-sm text-gray-400">
            Email
          </label>
          <input
            type="email"
            id="email"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e1e2f]"
            placeholder="Enter your email"
            value={data.email}
            onChange={(e) => setData({ ...data, email: e.target.value })}
            required
          />
          <label htmlFor="password" className="font-bold text-sm text-gray-400">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e1e2f]"
              placeholder="Enter your password"
              value={data.password}
              onChange={(e) => setData({ ...data, password: e.target.value })}
              required
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <TbEye className="w-5 h-5" />
              ) : (
                <TbEyeOff className="w-5 h-5" />
              )}
            </button>
          </div>
          <button
            type="submit"
            className="w-full py-2 rounded-lg bg-[#1e1e2f] text-white font-medium hover:bg-[#1e1e2f]/80 transition-all duration-300"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
}
