import { BrainCircuit, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { NavLink, Outlet } from "react-router-dom";
import { LanguageSwitcher } from "../LanguageSwitcher";

export function AppShell() {
  const { t } = useTranslation("common");

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(38,202,229,0.24),_transparent_30%),linear-gradient(180deg,_#f6fbff_0%,_#eef4f8_40%,_#f5efe9_100%)] text-[--color-ink]">
      <header className="border-b border-white/60 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-[--color-panel-strong] text-[--color-accent] shadow-[var(--shadow-soft)]">
              <BrainCircuit size={22} />
            </div>
            <div>
              <p className="font-display text-2xl font-semibold leading-none">{t("appTitle")}</p>
              <p className="text-xs uppercase tracking-[0.18em] text-[--color-muted]">
                {t("appTagline")}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-start gap-3 self-stretch sm:flex-row sm:items-center sm:justify-end">
            <nav className="flex items-center gap-5 text-sm text-[--color-muted]">
              <NavLink to="/">{t("nav.workspace")}</NavLink>
              <NavLink to="/privacy">{t("nav.privacy")}</NavLink>
              <NavLink to="/terms">{t("nav.terms")}</NavLink>
            </nav>
            <LanguageSwitcher />
          </div>
        </div>
      </header>
      <Outlet />
      <footer className="border-t border-white/50 bg-white/70">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-4 py-5 text-xs text-[--color-muted] lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <p>{t("footer.disclaimer")}</p>
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} />
            <span>{t("footer.security")}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
