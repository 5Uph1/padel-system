import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "danger";

const buttonStyles: Record<Variant, string> = {
  primary: "bg-padel-blue text-white hover:bg-blue-700",
  secondary: "border border-zinc-300 bg-white text-padel-navy hover:bg-zinc-50",
  danger: "bg-red-600 text-white hover:bg-red-700",
};

export function Button({ variant = "primary", className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button {...props} className={`inline-flex min-h-10 items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-padel-blue focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${buttonStyles[variant]} ${className}`} />;
}

export function LinkButton({ href, variant = "primary", className = "", children }: { href: string; variant?: Variant; className?: string; children: ReactNode }) {
  return <Link href={href} className={`inline-flex min-h-10 items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-padel-blue focus-visible:ring-offset-2 ${buttonStyles[variant]} ${className}`}>{children}</Link>;
}

const badgeStyles = {
  success: "bg-green-50 text-green-800",
  neutral: "bg-zinc-100 text-zinc-700",
  warning: "bg-amber-50 text-amber-800",
  info: "bg-blue-50 text-blue-800",
};

export function Badge({ variant = "neutral", children, className = "" }: { variant?: keyof typeof badgeStyles; children: ReactNode; className?: string }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${badgeStyles[variant]} ${className}`}>{children}</span>;
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-zinc-200 bg-white shadow-sm ${className}`}>{children}</div>;
}

export function PageHeader({ eyebrow, title, description }: { eyebrow?: string; title: string; description?: string }) {
  return <header className="mb-8 space-y-2">{eyebrow && <p className="text-sm font-semibold text-padel-blue">{eyebrow}</p>}<h1 className="text-3xl font-semibold tracking-tight text-padel-navy sm:text-4xl">{title}</h1>{description && <p className="max-w-2xl text-zinc-600">{description}</p>}</header>;
}

export function EmptyState({ title, description, children }: { title: string; description?: string; children?: ReactNode }) {
  return <Card className="p-6 text-center"><h2 className="font-semibold text-padel-navy">{title}</h2>{description && <p className="mt-2 text-sm text-zinc-600">{description}</p>}{children && <div className="mt-4">{children}</div>}</Card>;
}

export function Alert({ variant, children }: { variant: "error" | "info" | "success"; children: ReactNode }) {
  const styles = { error: "border-red-200 bg-red-50 text-red-800", info: "border-blue-200 bg-blue-50 text-blue-800", success: "border-green-200 bg-green-50 text-green-800" };
  return <div role={variant === "error" ? "alert" : "status"} className={`rounded-xl border p-4 text-sm ${styles[variant]}`}>{children}</div>;
}

export function CheckoutSteps({ current }: { current: 1 | 2 | 3 }) {
  const steps = ["Keranjang", "Checkout", "Bayar"];
  return <ol className="mb-8 grid grid-cols-3 gap-2">{steps.map((step, index) => { const number = index + 1; return <li key={step} className={`rounded-xl border px-3 py-2 text-center text-xs font-semibold sm:text-sm ${number === current ? "border-padel-blue bg-blue-50 text-padel-blue" : number < current ? "border-zinc-200 bg-white text-padel-navy" : "border-zinc-200 bg-zinc-50 text-zinc-500"}`}><span className="mr-1.5">{number}.</span>{step}</li>; })}</ol>;
}
