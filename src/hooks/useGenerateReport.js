import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { validateTranscript } from "../lib/transcriptInput";
import { generateReport, isReportGenerationError } from "../services/report";

const PROGRESS_STAGES = [
  { id: "queued", value: 10 },
  { id: "analyzing", value: 34 },
  { id: "decisions", value: 52 },
  { id: "actionItems", value: 69 },
  { id: "risks", value: 83 },
  { id: "validating", value: 92 }
];

export function useGenerateReport() {
  const { t, i18n } = useTranslation("common");
  const [status, setStatus] = useState("idle");
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");
  const [meta, setMeta] = useState(null);
  const [progress, setProgress] = useState({
    currentStage: PROGRESS_STAGES[0].id,
    percent: 0
  });
  const [hasStartedGeneration, setHasStartedGeneration] = useState(false);
  const latestPayloadRef = useRef(null);
  const inFlightRef = useRef(false);

  useEffect(() => {
    if (status !== "generating") {
      return undefined;
    }

    setProgress({
      currentStage: PROGRESS_STAGES[0].id,
      percent: PROGRESS_STAGES[0].value
    });

    let stageIndex = 0;
    const intervalId = window.setInterval(() => {
      stageIndex = Math.min(stageIndex + 1, PROGRESS_STAGES.length - 1);
      setProgress({
        currentStage: PROGRESS_STAGES[stageIndex].id,
        percent: PROGRESS_STAGES[stageIndex].value
      });
    }, 1500);

    return () => window.clearInterval(intervalId);
  }, [status]);

  function mapGenerationError(requestError) {
    if (!isReportGenerationError(requestError)) {
      return requestError.message || t("errors.reportFailed");
    }

    if (requestError.message === "REPORT_GENERATION_FAILED") {
      return t("errors.reportFailed");
    }

    const translationKey = {
      TIMEOUT: "errors.reportTimeout",
      NETWORK: "errors.reportNetwork",
      INVALID_RESPONSE: "errors.reportInvalidResponse",
      SCHEMA_INVALID: "errors.reportSchemaInvalid"
    }[requestError.code];

    if (translationKey) {
      return t(translationKey);
    }

    return requestError.message || t("errors.reportFailed");
  }

  async function generate(data) {
    if (inFlightRef.current) {
      return;
    }

    const transcriptError = validateTranscript(data.transcript);
    if (transcriptError) {
      setStatus("error");
      setError(t(transcriptError));
      return;
    }

    latestPayloadRef.current = data;
    setHasStartedGeneration(true);
    setStatus("generating");
    setReport(null);
    setError("");
    setMeta(null);
    setProgress({
      currentStage: PROGRESS_STAGES[0].id,
      percent: 0
    });
    inFlightRef.current = true;

    try {
      const response = await generateReport({
        ...data,
        language: i18n.resolvedLanguage || i18n.language
      }, {
        onProgress: (nextProgress) => setProgress(nextProgress)
      });
      setReport(response.report);
      setMeta({
        mode: response.mode,
        provider: response.provider,
        fallbackReason: response.fallbackReason,
        generatedAt: response.report.generated_at,
        attempts: response.attempts,
        sourceType: data.sourceType
      });
      setProgress({
        currentStage: "complete",
        percent: 100
      });
      setStatus("success");
    } catch (requestError) {
      setStatus("error");
      setError(mapGenerationError(requestError));
    } finally {
      inFlightRef.current = false;
    }
  }

  async function retryGeneration() {
    if (!latestPayloadRef.current || status === "generating") {
      return;
    }

    await generate(latestPayloadRef.current);
  }

  return {
    status,
    report,
    error,
    meta,
    progress,
    hasStartedGeneration,
    isGenerating: status === "generating",
    generateReport: generate,
    retryGeneration
  };
}
