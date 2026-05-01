// app/(auth)/login/page.tsx
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Email atau password salah. Silakan coba lagi.");
      setLoading(false);
      return;
    }

    router.push("/kasir");
    router.refresh();
  }

  return (
    <div className="bg-[#f9f9ff] min-h-screen flex flex-col items-center justify-center px-4 py-8">
      {/* Background blur decorations */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -right-[10%] w-[50%] h-[50%] bg-emerald-100/40 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[10%] -left-[10%] w-[50%] h-[50%] bg-emerald-50/40 blur-[120px] rounded-full" />
      </div>

      <div className="w-full max-w-md bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
        {/* Logo & Title */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-emerald-500 rounded-xl flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-white text-4xl">
              storefront
            </span>
          </div>
          <h1 className="font-bold text-2xl text-emerald-600 tracking-tight">
            Kedai Digital
          </h1>
          <p className="text-sm text-gray-500 mt-1 text-center">
            Kelola tokomu dengan lebih efisien dan modern.
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label
              className="block text-xs font-semibold text-gray-500 mb-2 ml-1"
              htmlFor="email"
            >
              Email Pemilik Kedai
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">
                mail
              </span>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                required
                className="w-full h-14 pl-12 pr-4 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2 px-1">
              <label
                className="text-xs font-semibold text-gray-500"
                htmlFor="password"
              >
                Kata Sandi
              </label>
              <a href="#" className="text-xs text-emerald-600 hover:underline">
                Lupa Password?
              </a>
            </div>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">
                lock
              </span>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full h-14 pl-12 pr-12 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-emerald-600 text-white font-semibold text-base rounded-lg hover:bg-emerald-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined animate-spin text-[20px]">
                  progress_activity
                </span>
                Memproses...
              </>
            ) : (
              <>
                <span>Masuk</span>
                <span className="material-symbols-outlined text-[20px]">
                  arrow_forward
                </span>
              </>
            )}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-500">
            Belum punya akun kedai?{" "}
            <a href="#" className="text-emerald-600 font-semibold ml-1">
              Daftar Sekarang
            </a>
          </p>
        </div>
      </div>

      <div className="mt-8 text-center text-gray-400">
        <p className="text-xs">v1.0.0 • KasirKu Aman &amp; Terpercaya</p>
      </div>
    </div>
  );
}
