import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { formatReportAsMarkdown, formatReportAsText } from "../lib/formatters";

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
  const [copyFeedback, setCopyFeedback] = useState("");

  function ensureReport() {
    if (!report) {
      throw new Error(t("common:errors.reportRequired"));
    }
  }

  const exportLanguage = i18n.resolvedLanguage || i18n.language;
  const baseFilename = t("export:fileBaseName");

  useEffect(() => {
    if (!copyFeedback) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setCopyFeedback(""), 2500);
    return () => window.clearTimeout(timeoutId);
  }, [copyFeedback]);

  return {
    copyFeedback,
    copyReport: async () => {
      ensureReport();
      await navigator.clipboard.writeText(formatReportAsText(report, t, exportLanguage));
      setCopyFeedback(t("export:messages.copySuccess"));
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
    },
    downloadText: () => {
      ensureReport();
      triggerDownload(
        `${baseFilename}.txt`,
        formatReportAsText(report, t, exportLanguage),
        "text/plain"
      );
    }
  };
}
