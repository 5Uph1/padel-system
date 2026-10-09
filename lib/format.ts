export function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatTanggal(
  value: string | Date,
  style: "short" | "medium" | "long" | "datetime" = "medium",
) {
  const date = value instanceof Date ? value : new Date(value);
  const options: Intl.DateTimeFormatOptions =
    style === "datetime"
      ? { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" }
      : style === "long"
        ? { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }
        : style === "short"
          ? { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" }
          : { dateStyle: "medium", timeZone: "UTC" };
  return new Intl.DateTimeFormat("id-ID", options).format(date);
}
