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
  function ensureReport() {
    if (!report) {
      throw new Error("Generate a report first.");
    }
  }

  return {
    copyMarkdown: async () => {
      ensureReport();
      await navigator.clipboard.writeText(formatReportAsMarkdown(report));
    },
    downloadMarkdown: () => {
      ensureReport();
      triggerDownload("meeting-report.md", formatReportAsMarkdown(report), "text/markdown");
    },
    downloadJson: () => {
      ensureReport();
      triggerDownload("meeting-report.json", JSON.stringify(report, null, 2), "application/json");
    }
  };
}
