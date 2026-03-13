import { useTranslation } from "react-i18next";

export function LegalPage({ titleKey, bodyKey }) {
  const { t } = useTranslation("common");

  return (
    <main className="mx-auto flex min-h-full w-full max-w-4xl px-4 py-12 lg:px-8">
      <div className="rounded-[--radius-panel] border border-white/70 bg-white/90 p-8 shadow-[var(--shadow-card)]">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[--color-accent]">
          {t("appTitle")}
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-[--color-ink]">{t(titleKey)}</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-[--color-muted]">{t(bodyKey)}</p>
      </div>
    </main>
  );
}
