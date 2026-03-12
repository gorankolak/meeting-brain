import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-3xl items-center px-4 py-12 lg:px-8">
      <div className="rounded-[--radius-panel] border border-white/70 bg-white/90 p-8 shadow-[var(--shadow-card)]">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[--color-warning]">
          404
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-[--color-ink]">Page not found</h1>
        <p className="mt-3 text-sm leading-7 text-[--color-muted]">
          The route does not exist in this MVP. Core functionality lives on the main workspace.
        </p>
        <Link className="mt-6 inline-flex text-sm font-semibold text-[--color-accent]" to="/">
          Return to workspace
        </Link>
      </div>
    </main>
  );
}
