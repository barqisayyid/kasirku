// components/ui/LogoutButton.tsx
"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
      title="Keluar"
    >
      <span className="material-symbols-outlined text-gray-500">
        account_circle
      </span>
    </button>
  );
}
