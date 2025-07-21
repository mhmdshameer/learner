"use client"

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { TbEye, TbEyeOff } from "react-icons/tb";

export default function Login() {
  const [show, setShow] = useState(false)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/signIn", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({email, password}),
      });
      const data = await response.json();
      if(response.ok){
        localStorage.setItem("token", data.token);
        router.replace("/");
      }else{}
      setError(data.message);
    } catch (error) {
      console.log(error);
    }
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f6fa]">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-center mb-6 text-[#1e1e2f]">
          Login
        </h1>
        <p className="text-sm text-center text-gray-400 mb-6">If you don't have an account, please <Link href="/register" className="text-blue-500">register</Link></p>
        <form className="space-y-4" onSubmit={handleLogin}>
          <label htmlFor="email" className="font-bold text-sm text-gray-400">
            Email
          </label>
          <input
            type="email"
            id="email"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e1e2f]"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <label htmlFor="password" className="font-bold text-sm text-gray-400">
            Password
          </label>
          <div className="relative">

          <input
            type={show? "text" : "password"}
            id="password"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e1e2f]"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            />
            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" onClick={() => setShow(!show)}>
              {show ? <TbEye className="w-5 h-5" /> : <TbEyeOff className="w-5 h-5" />}
            </button>
            </div>
          <button type="submit" className="w-full py-2 rounded-lg bg-[#1e1e2f] cursor-pointer text-white font-medium">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
