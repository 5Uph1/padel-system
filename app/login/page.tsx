import Link from "next/link";
import { login } from "./actions";
import { Alert, Button, Card } from "@/app/components/ui";

export const instant = false;

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-16">
      <Card className="p-7 sm:p-8">
      <Link href="/" className="text-sm font-semibold text-padel-blue">
        Padel Shop
      </Link>
      <h1 className="mt-6 text-3xl font-semibold tracking-tight text-padel-navy">Masuk</h1>
      <p className="mt-2 text-sm text-zinc-600">
        Masuk untuk mulai belanja dan menyewa perlengkapan padel.
      </p>
      {params.error && (
        <div className="mt-5"><Alert variant="error">
          {params.error === "profile"
            ? "Profil akun tidak dapat dimuat. Hubungi administrator."
            : "Email atau kata sandi tidak valid."}
        </Alert></div>
      )}
      <form action={login} className="mt-8 space-y-5">
        <input
          type="hidden"
          name="next"
          value={typeof params.next === "string" ? params.next : ""}
        />
        <label className="block text-sm font-medium">
          Email
          <input
            name="email"
            type="email"
            autoComplete="email"
            placeholder="example@example.com | example@admin.com"
            required
            className="mt-2 block min-h-11 w-full rounded-lg border border-zinc-300 px-3 py-2.5 font-normal focus:border-padel-blue focus:outline-none focus:ring-2 focus:ring-padel-blue/20"
          />
        </label>
        <label className="block text-sm font-medium">
          Kata sandi
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="example123"
            required
            className="mt-2 block min-h-11 w-full rounded-lg border border-zinc-300 px-3 py-2.5 font-normal focus:border-padel-blue focus:outline-none focus:ring-2 focus:ring-padel-blue/20"
          />
        </label>
        <Button
          type="submit"
          className="w-full"
        >
          Masuk
        </Button>
      </form>
      <p className="mt-6 text-sm text-zinc-600">
        Belum punya akun?{" "}
        <Link href="/register" className="font-semibold text-padel-blue">
          Daftar
        </Link>
      </p>
      </Card>
    </main>
  );
}
