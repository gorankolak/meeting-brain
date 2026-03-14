import { BrainCircuit } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Outlet } from "react-router-dom";
import { LanguageSwitcher } from "../LanguageSwitcher";

export function AppShell() {
  const { t } = useTranslation("common");
  const githubUrl = t("footer.githubUrl");

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-[--color-ink]">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-3 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-[--radius-button] bg-[--color-panel-strong] text-[--color-accent] shadow-[var(--shadow-soft)]">
              <BrainCircuit size={22} />
            </div>
            <div>
              <p className="font-display text-2xl font-semibold leading-none">{t("appTitle")}</p>
            </div>
          </div>
          <LanguageSwitcher />
        </div>
      </header>
      <div className="flex flex-1 flex-col">
        <Outlet />
      </div>
      <footer className="mt-16 border-t border-slate-200 pt-8">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center gap-3 px-4 pb-10 text-center text-sm text-[--color-muted] lg:px-8">
          <p className="max-w-2xl font-medium text-[--color-ink]">{t("footer.title")}</p>
          <p className="max-w-2xl whitespace-pre-line">{t("footer.description")}</p>
          <p>{t("footer.stack")}</p>
          {githubUrl ? (
            <a
              className="text-cyan-600 transition hover:underline"
              href={githubUrl}
              rel="noreferrer"
              target="_blank"
            >
              {t("footer.github")}
            </a>
          ) : null}
        </div>
      </footer>
    </div>
  );
}
