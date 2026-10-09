"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/app/components/ui";
import { cancelCourtBooking } from "./actions";

function CancelButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant="danger" disabled={pending} className="mt-3 w-full">
      {pending ? "Memproses..." : "Batalkan booking"}
    </Button>
  );
}

export function CancelBookingButton({
  bookingId,
  date,
}: {
  bookingId: string;
  date: string;
}) {
  return (
    <form action={cancelCourtBooking}>
      <input type="hidden" name="bookingId" value={bookingId} />
      <input type="hidden" name="date" value={date} />
      <CancelButton />
    </form>
  );
}
