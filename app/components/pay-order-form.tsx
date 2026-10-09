"use client";

import { useFormStatus } from "react-dom";
import { payOrder } from "@/app/checkout/actions";

function PayButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-8 w-full rounded-md bg-emerald-800 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
    >
      {pending ? "Memproses..." : "Bayar"}
    </button>
  );
}

export function PayOrderForm({ orderId }: { orderId: string }) {
  return (
    <form action={payOrder}>
      <input type="hidden" name="orderId" value={orderId} />
      <PayButton />
    </form>
  );
}
