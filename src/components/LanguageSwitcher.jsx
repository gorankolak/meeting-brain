import { useTranslation } from "react-i18next";

const LANGUAGES = ["hr", "en"];

export function LanguageSwitcher() {
  const { t, i18n } = useTranslation("common");
  const activeLanguage = i18n.resolvedLanguage || i18n.language;

  return (
    <div
      aria-label={t("language.switcherLabel")}
      className="flex h-9 items-center gap-1 rounded-md border border-gray-200 bg-white p-1"
      role="group"
    >
      {LANGUAGES.map((language) => {
        const isActive = activeLanguage === language;

        return (
          <button
            aria-label={t(`language.options.${language}`)}
            aria-pressed={isActive}
            className={`h-7 cursor-pointer rounded-md px-3 text-sm transition duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-accent] focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
              isActive
                ? "bg-gray-50 font-semibold text-gray-900"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
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
