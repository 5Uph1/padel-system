"use client";

import { useFormStatus } from "react-dom";
import { payOrder } from "@/app/checkout/actions";
import { Button } from "./ui";

function PayButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      className="mt-6 w-full"
    >
      {pending ? "Memproses..." : "Bayar"}
    </Button>
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
