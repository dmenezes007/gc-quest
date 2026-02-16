export default function TeamMapPage() {
  return (
    <section className="space-y-5">
      <header>
        <h1 className="kq-heading text-4xl font-extrabold text-slate-100">Team Intelligence</h1>
        <p className="mt-1 text-sm text-slate-400">Real-time analysis of team knowledge distribution and gaps.</p>
      </header>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        {[
          { title: 'Total members', value: '12', note: 'Active players' },
          { title: 'Critical gap', value: '24%', note: '4 areas missing' },
          { title: 'Validation rate', value: '94%', note: '+12% this month' },
          { title: 'XP velocity', value: '12k', note: 'Team XP / Month' },
        ].map((item) => (
          <article key={item.title} className="kq-panel p-4">
            <p className="kq-heading text-[10px] text-slate-500">{item.title}</p>
            <p className="mt-2 text-4xl font-bold text-slate-100">{item.value}</p>
            <p className="mt-1 text-xs text-slate-500">{item.note}</p>
          </article>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <section className="kq-panel p-5">
          <h2 className="kq-heading text-xl text-cyan-300">Knowledge Coverage %</h2>
          <div className="mt-4 grid h-56 grid-cols-5 items-end gap-4">
            {[74, 43, 80, 55, 68].map((height, index) => (
              <div key={index} className="space-y-2 text-center text-[10px] text-slate-500">
                <div className="mx-auto w-8 rounded-t bg-cyan-400/80" style={{ height: `${height}%` }} />
                <p>{['Tecnologia', 'Vendas', 'Compliance', 'Processos', 'Soft'][index]}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="kq-panel p-5">
          <h2 className="kq-heading text-xl text-fuchsia-300">Skill Overlay</h2>
          <div className="mt-4 flex h-56 items-center justify-center rounded-xl border border-slate-700 bg-[#0a122b]">
            <div className="h-40 w-40 rotate-45 border border-fuchsia-400/30" />
          </div>
        </section>
      </div>
    </section>
  );
}
