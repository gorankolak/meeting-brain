import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export function NotFoundPage() {
  const { t } = useTranslation("common");

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-3xl items-center px-4 py-12 lg:px-8">
      <div className="rounded-lg border border-[--color-border] bg-[--color-surface] p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[--color-warning]">
          404
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-[--color-text]">{t("notFound.title")}</h1>
        <p className="mt-3 text-sm leading-7 text-[--color-text-muted]">
          {t("notFound.body")}
        </p>
        <Link className="mt-6 inline-flex text-sm font-semibold text-[--color-primary-dark]" to="/">
          {t("actions.returnToWorkspace")}
        </Link>
      </div>
    </main>
  );
}
