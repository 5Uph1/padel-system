import Link from "next/link";
import { CartPage } from "@/app/components/cart-page";
import { SiteHeader } from "@/app/components/site-header";

export const instant = false;

export default function ShoppingCartPage() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-8">
      <SiteHeader />
      <Link href="/products" className="mb-5 inline-block text-sm font-semibold text-padel-blue hover:text-padel-navy">
        Lanjut belanja
      </Link>
      <CartPage />
    </main>
  );
}
