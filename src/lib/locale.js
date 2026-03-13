import { getLocaleForLanguage, normalizeLanguage } from "../i18n";

export function formatDateTime(value, language) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat(getLocaleForLanguage(language), {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export function getReportLanguage(language) {
  return normalizeLanguage(language);
}
