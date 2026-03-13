import { useTranslation } from "react-i18next";
import { formatReportAsMarkdown } from "../lib/formatters";

function triggerDownload(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function useReportActions(report) {
  const { t, i18n } = useTranslation(["common", "export"]);

  function ensureReport() {
    if (!report) {
      throw new Error(t("common:errors.reportRequired"));
    }
  }

  const exportLanguage = i18n.resolvedLanguage || i18n.language;
  const baseFilename = t("export:fileBaseName");

  return {
    copyMarkdown: async () => {
      ensureReport();
      await navigator.clipboard.writeText(formatReportAsMarkdown(report, t, exportLanguage));
    },
    downloadMarkdown: () => {
      ensureReport();
      triggerDownload(
        `${baseFilename}.md`,
        formatReportAsMarkdown(report, t, exportLanguage),
        "text/markdown"
      );
    },
    downloadJson: () => {
      ensureReport();
      triggerDownload(`${baseFilename}.json`, JSON.stringify(report, null, 2), "application/json");
    }
  };
}
