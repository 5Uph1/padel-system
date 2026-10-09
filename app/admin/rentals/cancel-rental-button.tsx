"use client";

import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/app/components/ui";
import { cancelRental } from "./actions";

function CancelButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant="danger" disabled={pending}>
      {pending ? "Memproses..." : "Batalkan sewa"}
    </Button>
  );
}

export function CancelRentalButton({
  itemId,
  rentedUntil,
}: {
  itemId: string;
  rentedUntil: string | null;
}) {
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (!rentedUntil) return;
    const remaining = Date.parse(rentedUntil) - Date.now();
    if (remaining <= 0) {
      setExpired(true);
      return;
    }
    const timeout = window.setTimeout(() => setExpired(true), remaining);
    return () => window.clearTimeout(timeout);
  }, [rentedUntil]);

  if (expired) return <span className="text-sm text-zinc-500">Sewa selesai</span>;

  return (
    <form action={cancelRental}>
      <input type="hidden" name="itemId" value={itemId} />
      <CancelButton />
    </form>
  );
}
