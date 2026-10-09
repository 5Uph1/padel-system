"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  ["Pesanan", "/admin/orders"],
  ["Stok", "/admin/stock"],
  ["Sewa", "/admin/rentals"],
  ["Lapangan", "/admin/courts"],
  ["Jadwal", "/admin/schedule"],
] as const;

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Navigasi admin" className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
      {links.map(([label, href]) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`min-h-10 shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${active ? "bg-padel-navy text-white" : "text-zinc-600 hover:bg-zinc-100 hover:text-padel-navy"}`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
