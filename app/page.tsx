"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface UserDataProps {
    email: string;
    name: string;
    imageUrl: string;
}

type ErrorPayload = { message?: string };
const isErrorPayload = (val: unknown): val is ErrorPayload => {
  return typeof val === "object" && val !== null && "message" in val;
};

export default function Home() {
  const [user, setUser] = useState<UserDataProps | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const getUserData = async (token: string) => {
    try {
      const response = await fetch("/api/user", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          router.replace("/login");
          return;
        }
        let message = "Failed to load user";
        try {
          const errData: unknown = await response.json();
          if (isErrorPayload(errData) && typeof errData.message === "string") {
            message = errData.message;
          }
        } catch {}
        setError(message);
        return;
      }
      const data = await response.json();
      setUser(data.user);
    } catch (e) {
      console.log(e);
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let isMounted = true;
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      setLoading(false);
      return;
    }
    (async () => {
      if (!isMounted) return;
      await getUserData(token);
    })();
    return () => { isMounted = false; };
  }, [router]);

  if (loading) {
    return <div className="flex h-dvh items-center justify-center text-gray-600">Loading...</div>;
  }
  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }
  if (!user) {
    return null; // Safety: if no user after loading, render nothing.
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1e1e2f]">Welcome back, {user.name}!</h1>
            <p className="text-gray-600">Dashboard</p>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Dashboard cards */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-[#1e1e2f] mb-2">Family Tree</h3>
              <p className="text-gray-600 mb-4">Manage your family connections</p>
              <button className="text-blue-600 hover:text-blue-800 font-medium">
                View Family Tree
              </button>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-[#1e1e2f] mb-2">Profile</h3>
              <p className="text-gray-600 mb-4">Update your personal information</p>
              <button className="text-blue-600 hover:text-blue-800 font-medium">
                Edit Profile
              </button>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-[#1e1e2f] mb-2">Settings</h3>
              <p className="text-gray-600 mb-4">Customize your experience</p>
              <button className="text-blue-600 hover:text-blue-800 font-medium">
                Open Settings
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
