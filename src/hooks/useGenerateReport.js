import { useState } from "react";
import { useTranslation } from "react-i18next";
import { validateTranscript } from "../lib/transcriptInput";
import { generateReport } from "../services/generateReport";

export function useGenerateReport() {
  const { t, i18n } = useTranslation("common");
  const [status, setStatus] = useState("idle");
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");
  const [meta, setMeta] = useState(null);
  const [hasStartedGeneration, setHasStartedGeneration] = useState(false);

  async function generate(data) {
    const transcriptError = validateTranscript(data.transcript);
    if (transcriptError) {
      setStatus("error");
      setError(t(transcriptError));
      return;
    }

    setHasStartedGeneration(true);
    setStatus("loading");
    setError("");

    try {
      const response = await generateReport({
        ...data,
        language: i18n.resolvedLanguage || i18n.language
      });
      setReport(response.report);
      setMeta({
        mode: response.mode,
        generatedAt: response.report.generated_at
      });
      setStatus("success");
    } catch (requestError) {
      setStatus("error");
      setError(
        requestError.message && requestError.message !== "REPORT_GENERATION_FAILED"
          ? requestError.message
          : t("errors.reportFailed")
      );
    }
  }

  return {
    status,
    report,
    error,
    meta,
    hasStartedGeneration,
    generateReport: generate
  };
}
