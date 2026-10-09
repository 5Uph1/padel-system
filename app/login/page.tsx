import Link from "next/link";
import { login } from "./actions";

export const instant = false;

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-16">
      <Link href="/" className="text-sm font-semibold text-emerald-800">
        Padel Shop
      </Link>
      <h1 className="mt-6 text-3xl font-semibold tracking-tight">Masuk</h1>
      <p className="mt-2 text-sm text-zinc-600">
        Masuk untuk mulai belanja dan menyewa perlengkapan padel.
      </p>
      {params.error && (
        <p className="mt-5 rounded-md bg-red-50 p-3 text-sm text-red-800">
          {params.error === "profile"
            ? "Profil akun tidak dapat dimuat. Hubungi administrator."
            : "Email atau kata sandi tidak valid."}
        </p>
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
            className="mt-2 block w-full rounded-md border border-zinc-300 px-3 py-2.5 font-normal"
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
            className="mt-2 block w-full rounded-md border border-zinc-300 px-3 py-2.5 font-normal"
          />
        </label>
        <button
          type="submit"
          className="w-full rounded-md bg-emerald-800 px-4 py-3 text-sm font-semibold text-white"
        >
          Masuk
        </button>
      </form>
      <p className="mt-6 text-sm text-zinc-600">
        Belum punya akun?{" "}
        <Link href="/register" className="font-semibold text-emerald-800">
          Daftar
        </Link>
      </p>
    </main>
  );
}
