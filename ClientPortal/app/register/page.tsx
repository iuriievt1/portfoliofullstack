import Link from "next/link";
import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/register-form";
import { getSessionUser } from "@/lib/auth";

export default async function RegisterPage() {
  const session = await getSessionUser();

  if (session) {
    redirect("/");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="panel grid w-full max-w-6xl overflow-hidden lg:grid-cols-[1.1fr_0.9fr]">
        <section className="relative hidden min-h-[680px] overflow-hidden bg-slate-950 p-10 text-white lg:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.35),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.28),transparent_28%)]" />
          <div className="relative flex h-full flex-col justify-between">
            <div>
              <h1 className="mt-8 max-w-xl text-5xl font-semibold leading-tight">
                Založte účet a propojte klienty i advokáta v jednom pracovním prostoru.
              </h1>
              <p className="mt-6 max-w-lg text-base text-white/70">
                Po registraci přijde na zadaný e-mail ověřovací kód. Po jeho zadání je účet
                okamžitě připravený k přihlášení a sdílení složek.
              </p>
            </div>
            <div className="text-sm text-white/70">
              Už máte účet?{" "}
              <Link href="/login" className="font-semibold text-white">
                Přihlásit se
              </Link>
            </div>
          </div>
        </section>
        <section className="flex min-h-[680px] items-center bg-white/90 px-6 py-10 sm:px-10">
          <RegisterForm />
        </section>
      </div>
    </main>
  );
}
