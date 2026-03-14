import { useTranslation } from "react-i18next";

const LANGUAGES = ["hr", "en"];

export function LanguageSwitcher() {
  const { t, i18n } = useTranslation("common");
  const activeLanguage = i18n.resolvedLanguage || i18n.language;

  return (
    <div
      aria-label={t("language.switcherLabel")}
      className="flex gap-1 rounded-full bg-surface-100 p-1"
      role="group"
    >
      {LANGUAGES.map((language) => {
        const isActive = activeLanguage === language;

        return (
          <button
            aria-label={t(`language.options.${language}`)}
            aria-pressed={isActive}
            className={`min-h-9 cursor-pointer rounded-full px-3 text-sm transition duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-accent] focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
              isActive
                ? "bg-white font-medium text-[--color-ink] shadow-sm"
                : "text-surface-500 hover:text-surface-900"
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
