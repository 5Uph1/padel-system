"use client";

import { useEffect, useState } from "react";
import { Badge } from "./ui";

export function RentalStatusBadge({
  status,
  rentedUntil,
}: {
  status: "available" | "rented";
  rentedUntil: string | null;
}) {
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (status !== "rented" || !rentedUntil) {
      setExpired(false);
      return;
    }

    const remaining = Date.parse(rentedUntil) - Date.now();
    if (remaining <= 0) {
      setExpired(true);
      return;
    }

    setExpired(false);
    const timeout = window.setTimeout(() => setExpired(true), remaining);
    return () => window.clearTimeout(timeout);
  }, [rentedUntil, status]);

  const available = status === "available" || expired;
  return <Badge variant={available ? "success" : "neutral"}>{available ? "Tersedia" : "Disewa"}</Badge>;
}
