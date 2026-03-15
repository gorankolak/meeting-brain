import { useTranslation } from "react-i18next";

const LANGUAGES = ["hr", "en"];

export function LanguageSwitcher() {
  const { t, i18n } = useTranslation("common");
  const activeLanguage = i18n.resolvedLanguage || i18n.language;

  return (
    <div
      aria-label={t("language.switcherLabel")}
      className="flex h-9 items-center gap-1 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-1"
      role="group"
    >
      {LANGUAGES.map((language) => {
        const isActive = activeLanguage === language;

        return (
          <button
            aria-label={t(`language.options.${language}`)}
            aria-pressed={isActive}
            className={`h-7 cursor-pointer rounded-md border px-3 text-sm transition duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface)] ${
              isActive
                ? "border-transparent bg-[var(--color-primary)] font-semibold text-[var(--color-primary-dark)] shadow-sm"
                : "border-transparent text-[var(--color-text-muted)] hover:border-[var(--color-border)] hover:bg-[var(--color-panel)] hover:text-[var(--color-text)]"
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
