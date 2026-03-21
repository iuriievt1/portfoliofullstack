import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-4 py-16">
      <div className="max-w-3xl">
        <div className="mb-6 inline-flex rounded-full bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-slate-600 shadow-soft">
          Prague launch city
        </div>
        <h1 className="text-5xl font-black leading-tight md:text-7xl">
          The live social layer for the real world.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
          VYBE helps people discover places through real-time posts, atmosphere signals, and local energy across Prague.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link href="/register" className="rounded-full bg-ink px-6 py-4 text-sm font-semibold text-white">
            Create account
          </Link>
          <Link href="/login" className="rounded-full border border-slate-300 bg-white px-6 py-4 text-sm font-semibold text-slate-700">
            Sign in
          </Link>
        </div>
      </div>
      <section className="mt-16 grid gap-4 md:grid-cols-3">
        {[
          "Live feeds attached to real places",
          "City discovery with atmosphere signals",
          "Fast post creation with image + vibe data"
        ].map((item) => (
          <div key={item} className="rounded-[28px] bg-white/80 p-6 shadow-soft">
            <p className="text-lg font-semibold">{item}</p>
          </div>
        ))}
      </section>
    </main>
  );
}

