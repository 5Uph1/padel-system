import Link from "next/link";
import { register } from "./actions";

export const instant = false;

export default async function RegisterPage({
  searchParams,
}: PageProps<"/register">) {
  const params = await searchParams;

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-16">
      <Link href="/" className="text-sm font-semibold text-emerald-800">
        Padel Shop
      </Link>
      <h1 className="mt-6 text-3xl font-semibold tracking-tight">
        Buat akun
      </h1>
      <p className="mt-2 text-sm text-zinc-600">
        Daftar dengan email dan kata sandi.
      </p>
      {params.error && (
        <p className="mt-5 rounded-md bg-red-50 p-3 text-sm text-red-800">
          Pendaftaran gagal. Gunakan email yang valid dan kata sandi minimal 8
          karakter.
        </p>
      )}
      <form action={register} className="mt-8 space-y-5">
        <label className="block text-sm font-medium">
          Email
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            className="mt-2 block w-full rounded-md border border-zinc-300 px-3 py-2.5 font-normal"
          />
        </label>
        <label className="block text-sm font-medium">
          Kata sandi
          <input
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            className="mt-2 block w-full rounded-md border border-zinc-300 px-3 py-2.5 font-normal"
          />
        </label>
        <button
          type="submit"
          className="w-full rounded-md bg-emerald-800 px-4 py-3 text-sm font-semibold text-white"
        >
          Daftar
        </button>
      </form>
      <p className="mt-6 text-sm text-zinc-600">
        Sudah punya akun?{" "}
        <Link href="/login" className="font-semibold text-emerald-800">
          Masuk
        </Link>
      </p>
    </main>
  );
}
