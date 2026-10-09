"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/app/components/ui";

export function BookingSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Memproses..." : "Lanjut ke pembayaran"}
    </Button>
  );
}
