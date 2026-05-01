// app/(dashboard)/layout.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import BottomNav from "@/components/ui/BottomNav";
import LogoutButton from "@/components/ui/LogoutButton";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-[#f9f9ff]">
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 h-14 bg-white border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-emerald-600">
            storefront
          </span>
          <h1 className="font-bold text-lg text-emerald-600">Kedai Harian</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 hidden sm:block">
            {user.email}
          </span>
          <LogoutButton />
        </div>
      </header>

      <main className="pt-14 pb-20">{children}</main>

      <BottomNav />
    </div>
  );
}
