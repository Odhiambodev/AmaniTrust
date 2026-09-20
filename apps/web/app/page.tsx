export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-20">
        <header className="flex items-center justify-between border-b border-slate-800 pb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-400">AmaniTrust</p>
            <h1 className="mt-2 text-4xl font-bold">Digital trust for the informal economy</h1>
          </div>
          <button className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-medium text-slate-950">
            Get started
          </button>
        </header>

        <section className="grid gap-8 md:grid-cols-2">
          <div className="space-y-6">
            <p className="max-w-xl text-lg text-slate-300">
              AmaniTrust helps Chama groups, informal workers, and fundraisers build verifiable
              trust using identity checks, payment history, and community reputation.
            </p>
            <div className="flex gap-4">
              <span className="rounded-full border border-emerald-400/50 bg-emerald-500/10 px-3 py-1 text-sm text-emerald-300">
                KYC verified
              </span>
              <span className="rounded-full border border-cyan-400/50 bg-cyan-500/10 px-3 py-1 text-sm text-cyan-300">
                M-Pesa linked
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl shadow-emerald-950/40">
            <p className="text-sm text-slate-400">Current trust score</p>
            <div className="mt-4 flex items-end gap-3">
              <span className="text-5xl font-bold text-emerald-400">872</span>
              <span className="text-sm uppercase tracking-widest text-slate-400">/1000</span>
            </div>
            <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-800">
              <div className="h-full w-[87%] rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400" />
            </div>
            <p className="mt-4 text-sm text-slate-300">High trust — verified identity and contribution history</p>
          </div>
        </section>
      </div>
    </main>
  );
}
