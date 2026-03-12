export function LegalPage({ title, body }) {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 lg:px-8">
      <div className="rounded-[--radius-panel] border border-white/70 bg-white/90 p-8 shadow-[var(--shadow-card)]">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[--color-accent]">
          Meeting Brain
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-[--color-ink]">{title}</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-[--color-muted]">{body}</p>
      </div>
    </main>
  );
}
