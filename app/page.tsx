"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface UserDataProps {
    email: string;
    name: string;
    imageUrl: string;
}

export default function Home() {
  const [user, setUser] = useState<UserDataProps | null>(null);
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.replace("/login");
  }

  const getUserData = async (token: string) => {
    try {
      const response = await fetch("/api/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setUser(data.user);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }
    getUserData(token);
  }, [router]);

  if (!user) {
    return null; // Component will unmount due to router.replace in useEffect
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
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <Image 
                src={user.imageUrl} 
                alt={user.name} 
                width={40} 
                height={40} 
                className="rounded-full object-cover"
              />
              <div className="text-sm">
                <p className="font-medium text-[#1e1e2f]">{user.name}</p>
                <p className="text-gray-500">{user.email}</p>
              </div>
            </div>
            <button 
              className="bg-[#1e1e2f] text-white px-4 py-2 rounded-md hover:bg-[#1e1e2f]/80 transition-colors" 
              onClick={handleLogout}
            >
              Logout
            </button>
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
                View Family Tree →
              </button>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-[#1e1e2f] mb-2">Profile</h3>
              <p className="text-gray-600 mb-4">Update your personal information</p>
              <button className="text-blue-600 hover:text-blue-800 font-medium">
                Edit Profile →
              </button>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-[#1e1e2f] mb-2">Settings</h3>
              <p className="text-gray-600 mb-4">Customize your experience</p>
              <button className="text-blue-600 hover:text-blue-800 font-medium">
                Open Settings →
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
