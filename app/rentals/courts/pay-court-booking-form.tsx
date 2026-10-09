"use client";

import { useFormStatus } from "react-dom";
import { payCourtBooking } from "./actions";
import { Button } from "@/app/components/ui";

function PayCourtBookingButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Memproses pembayaran..." : "Bayar booking"}
    </Button>
  );
}

export function PayCourtBookingForm({ bookingId }: { bookingId: string }) {
  return (
    <form action={payCourtBooking}>
      <input type="hidden" name="bookingId" value={bookingId} />
      <PayCourtBookingButton />
    </form>
  );
}
