import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { formatReportAsText, formatSectionAsText } from "../lib/formatters";
import { exportJiraTasksCsv } from "../services/export";

function triggerBlobDownload(filename, blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function triggerDownload(filename, content, type) {
  triggerBlobDownload(filename, new Blob([content], { type }));
}

export function useReportActions(report) {
  const { t, i18n } = useTranslation(["common", "export", "report"]);
  const [feedback, setFeedback] = useState(null);
  const [busyAction, setBusyAction] = useState("");
  const [completedAction, setCompletedAction] = useState("");

  function ensureReport() {
    if (!report) {
      throw new Error(t("common:errors.reportRequired"));
    }
  }

  const exportLanguage = i18n.resolvedLanguage || i18n.language;
  const baseFilename = t("export:fileBaseName");

  useEffect(() => {
    if (!feedback) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setFeedback(null), 2800);
    return () => window.clearTimeout(timeoutId);
  }, [feedback]);

  useEffect(() => {
    if (!completedAction) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setCompletedAction(""), 1800);
    return () => window.clearTimeout(timeoutId);
  }, [completedAction]);

  async function runAction(actionId, callback) {
    ensureReport();
    setBusyAction(actionId);

    try {
      const result = await callback();
      setCompletedAction(actionId);
      if (result?.message) {
        setFeedback({ tone: "success", message: result.message });
      }
    } catch (error) {
      setFeedback({
        tone: "error",
        message: error.message || t("export:messages.actionFailed")
      });
    } finally {
      setBusyAction("");
    }
  }

  return {
    feedback,
    completedAction,
    isBusy: (actionId) => busyAction === actionId,
    copyReport: () =>
      runAction("copy", async () => {
        await navigator.clipboard.writeText(formatReportAsText(report, t, exportLanguage));
        return { message: t("export:messages.copySuccess") };
      }),
    downloadPdf: () =>
      runAction("pdf", async () => {
        const { exportPdf } = await import("../services/export/exportPdf");
        const blob = await exportPdf(report, { t, language: exportLanguage });
        triggerBlobDownload(`${baseFilename}.pdf`, blob);
        return { message: t("export:messages.downloadReady", { format: "PDF" }) };
      }),
    exportForJira: () =>
      runAction("jira", async () => {
        triggerDownload(
          `${baseFilename}-jira-tasks.csv`,
          exportJiraTasksCsv(report, { t }),
          "text/csv;charset=utf-8"
        );
        return { message: t("export:messages.jiraReady") };
      }),
    copySection: (sectionId) =>
      runAction(`section-${sectionId}`, async () => {
        await navigator.clipboard.writeText(formatSectionAsText(sectionId, report, t, exportLanguage));
        return { message: t("export:messages.sectionCopySuccess", { section: t(`report:sections.${sectionId}`) }) };
      })
  };
}
