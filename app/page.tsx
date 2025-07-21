"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import jwt from "jsonwebtoken";

export default function Home() {
  const [user, setUser] = useState<{ email: string } | null>(null);
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.replace("/login");
  }

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }
    try {
      const userData = jwt.decode(token) as { email: string };
      setUser(userData);
    } catch {
      router.replace("/login");
    }
  }, [router]);

  if (!user) return null; // or a loading spinner

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f6fa]">
      <h1 className="text-2xl font-bold text-center mb-6 text-[#1e1e2f]">Home of {user.email}</h1>
      <button className="bg-[#1e1e2f] text-white px-4 py-2 rounded-md" onClick={handleLogout}>Logout</button>
    </div>
  );
}
