import Link from "next/link";

export default function Register() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f6fa]">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-center mb-6 text-[#1e1e2f]">
          Register
        </h1>
        <p className="text-sm text-center text-gray-400 mb-6">If you already have an account, please <Link href="/login" className="text-blue-500">login</Link></p>
        <form className="space-y-4">
          <label htmlFor="name" className="font-bold text-sm text-gray-400">
            Name
          </label>
          <input
            type="text"
            id="name"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e1e2f]"
            placeholder="Enter your name"
          />
          <label htmlFor="email" className="font-bold text-sm text-gray-400">
            Email
          </label>
          <input
            type="email"
            id="email"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e1e2f]"
            placeholder="Enter your email"
          />
          <label htmlFor="password" className="font-bold text-sm text-gray-400">
            Password
          </label>
          <input
            type="password"
            id="password"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e1e2f]"
            placeholder="Enter your password"
          />
          <button type="submit" className="w-full py-2 rounded-lg bg-[#1e1e2f] text-white font-medium">
            Register
          </button>
        </form>
      </div>
    </div>
  );
}
