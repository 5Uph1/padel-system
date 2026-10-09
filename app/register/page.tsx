import Link from "next/link";
import { register } from "./actions";
import { Alert, Button, Card } from "@/app/components/ui";

export const instant = false;

export default async function RegisterPage({
  searchParams,
}: PageProps<"/register">) {
  const params = await searchParams;

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-16">
      <Card className="p-7 sm:p-8">
      <Link href="/" className="text-sm font-semibold text-padel-blue">
        Padel Shop
      </Link>
      <h1 className="mt-6 text-3xl font-semibold tracking-tight text-padel-navy">
        Buat akun
      </h1>
      <p className="mt-2 text-sm text-zinc-600">
        Daftar dengan email dan kata sandi.
      </p>
      {params.error && (
        <div className="mt-5"><Alert variant="error">
          Pendaftaran gagal. Gunakan email yang valid dan kata sandi minimal 8
          karakter.
        </Alert></div>
      )}
      <form action={register} className="mt-8 space-y-5">
        <label className="block text-sm font-medium">
          Email
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            className="mt-2 block min-h-11 w-full rounded-lg border border-zinc-300 px-3 py-2.5 font-normal focus:border-padel-blue focus:outline-none focus:ring-2 focus:ring-padel-blue/20"
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
            className="mt-2 block min-h-11 w-full rounded-lg border border-zinc-300 px-3 py-2.5 font-normal focus:border-padel-blue focus:outline-none focus:ring-2 focus:ring-padel-blue/20"
          />
        </label>
        <Button
          type="submit"
          className="w-full"
        >
          Daftar
        </Button>
      </form>
      <p className="mt-6 text-sm text-zinc-600">
        Sudah punya akun?{" "}
        <Link href="/login" className="font-semibold text-padel-blue">
          Masuk
        </Link>
      </p>
      </Card>
    </main>
  );
}
