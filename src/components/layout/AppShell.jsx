import { BrainCircuit, Github } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Outlet } from "react-router-dom";
import { LanguageSwitcher } from "../LanguageSwitcher";

export function AppShell() {
  const { t } = useTranslation("common");
  const githubUrl = t("footer.githubUrl");
  const sourceCodeUrl = "https://github.com/gorankolak/meeting-brain";

  return (
    <div className="flex min-h-screen flex-col bg-[--color-bg] text-[--color-text]">
      <header className="border-b border-[--color-border] bg-[--color-bg]">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-6 py-3">
          <div className="flex items-center gap-3">
            <BrainCircuit className="text-[--color-primary-dark]" size={22} />
            <p className="font-display text-2xl font-semibold leading-none text-[--color-text]">{t("appTitle")}</p>
          </div>
          <div className="flex items-center gap-3">
            <a
              aria-label="View Meeting Brain source code on GitHub"
              className="inline-flex items-center justify-center text-[--color-text-muted] transition-colors hover:text-[--color-text]"
              href={sourceCodeUrl}
              rel="noopener noreferrer"
              target="_blank"
              title="View source on GitHub"
            >
              <Github size={18} />
            </a>
            <LanguageSwitcher />
          </div>
        </div>
      </header>
      <div className="flex flex-1 flex-col">
        <Outlet />
      </div>
      <footer className="mt-14 border-t border-[--color-border] pt-6">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-6 px-6 pb-8 text-center text-sm text-[--color-text-muted] md:flex-row md:items-start md:justify-between md:text-left">
          <div className="flex flex-col gap-2 md:max-w-sm">
            <p className="font-medium text-[--color-text]">{t("footer.title")}</p>
            <p className="whitespace-pre-line">{t("footer.description")}</p>
          </div>
          <div className="flex flex-col gap-2 md:max-w-md">
            <p>{t("footer.stack")}</p>
            {githubUrl ? (
              <a
                className="text-[--color-text-muted] transition-colors hover:text-[--color-text]"
                href={githubUrl}
                rel="noreferrer"
                target="_blank"
              >
                {t("footer.github")}
              </a>
            ) : null}
          </div>
        </div>
      </footer>
    </div>
  );
}
