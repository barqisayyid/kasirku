// components/ui/BottomNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/kasir", label: "Kasir", icon: "point_of_sale" },
  { href: "/produk", label: "Produk", icon: "inventory_2" },
  { href: "/utang", label: "Utang", icon: "history_edu" },
  { href: "/laporan", label: "Laporan", icon: "analytics" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center h-16 bg-white border-t border-gray-200 shadow-[0_-1px_3px_0_rgba(0,0,0,0.05)]">
      {navItems.map((item) => {
        const isActive = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center gap-0.5 px-4 transition-colors ${
              isActive
                ? "text-emerald-600"
                : "text-gray-400 hover:text-emerald-500"
            }`}
          >
            <span
              className="material-symbols-outlined text-[24px]"
              style={{
                fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
              }}
            >
              {item.icon}
            </span>
            <span className="text-[11px] font-semibold">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
