import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import hrCommon from "../locales/hr/common.json";
import hrHome from "../locales/hr/home.json";
import hrReport from "../locales/hr/report.json";
import hrExport from "../locales/hr/export.json";
import hrExample from "../locales/hr/example.json";
import enCommon from "../locales/en/common.json";
import enHome from "../locales/en/home.json";
import enReport from "../locales/en/report.json";
import enExport from "../locales/en/export.json";
import enExample from "../locales/en/example.json";

export const LANGUAGE_STORAGE_KEY = "meeting-brain-language";
export const DEFAULT_LANGUAGE = "hr";

const SUPPORTED_LANGUAGES = ["hr", "en"];

function getInitialLanguage() {
  if (typeof window === "undefined") {
    return DEFAULT_LANGUAGE;
  }

  const savedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return SUPPORTED_LANGUAGES.includes(savedLanguage) ? savedLanguage : DEFAULT_LANGUAGE;
}

function updateDocumentLanguage(language) {
  if (typeof document !== "undefined") {
    document.documentElement.lang = language;
  }
}

export function normalizeLanguage(language) {
  return SUPPORTED_LANGUAGES.includes(language) ? language : DEFAULT_LANGUAGE;
}

export function getLocaleForLanguage(language) {
  return normalizeLanguage(language) === "hr" ? "hr-HR" : "en";
}

const resources = {
  hr: {
    common: hrCommon,
    home: hrHome,
    report: hrReport,
    export: hrExport,
    example: hrExample
  },
  en: {
    common: enCommon,
    home: enHome,
    report: enReport,
    export: enExport,
    example: enExample
  }
};

i18n.use(initReactI18next).init({
  resources,
  lng: getInitialLanguage(),
  fallbackLng: DEFAULT_LANGUAGE,
  defaultNS: "common",
  ns: ["common", "home", "report", "export", "example"],
  interpolation: {
    escapeValue: false
  }
});

updateDocumentLanguage(i18n.resolvedLanguage || i18n.language);

i18n.on("languageChanged", (language) => {
  const normalizedLanguage = normalizeLanguage(language);

  if (typeof window !== "undefined") {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, normalizedLanguage);
  }

  updateDocumentLanguage(normalizedLanguage);
});

export default i18n;
