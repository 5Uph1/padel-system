import Link from "next/link";
import { CartPage } from "@/app/components/cart-page";
import { SiteHeader } from "@/app/components/site-header";

export const instant = false;

export default function ShoppingCartPage() {
  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10 sm:px-8">
      <SiteHeader />
      <Link href="/products" className="mt-5 inline-block text-sm text-emerald-800">
        Lanjut belanja
      </Link>
      <CartPage />
    </main>
  );
}
