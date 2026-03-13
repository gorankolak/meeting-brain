import { useTranslation } from "react-i18next";

const LANGUAGES = ["hr", "en"];

export function LanguageSwitcher() {
  const { t, i18n } = useTranslation("common");
  const activeLanguage = i18n.resolvedLanguage || i18n.language;

  return (
    <div
      aria-label={t("language.switcherLabel")}
      className="inline-flex rounded-full border border-[--color-border] bg-[--color-panel] p-1"
      role="group"
    >
      {LANGUAGES.map((language) => {
        const isActive = activeLanguage === language;

        return (
          <button
            aria-label={t(`language.options.${language}`)}
            aria-pressed={isActive}
            className={`cursor-pointer rounded-full px-3 py-1.5 text-xs font-semibold tracking-[0.08em] transition duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-accent] focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
              isActive
                ? "bg-[--color-panel-strong] text-white shadow-[var(--shadow-soft)] hover:brightness-110 active:brightness-95"
                : "text-[--color-muted] hover:bg-white hover:text-[--color-ink] hover:shadow-[0_8px_18px_rgba(15,23,42,0.08)] active:bg-white/80"
            }`}
            key={language}
            onClick={() => i18n.changeLanguage(language)}
            type="button"
          >
            {t(`language.short.${language}`)}
          </button>
        );
      })}
    </div>
  );
}
