import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { MeetingInputPanel } from "../components/meeting/MeetingInputPanel";
import { ReportWorkspace } from "../components/report/ReportWorkspace";
import { useMeetingInput } from "../hooks/useMeetingInput";
import { useGenerateReport } from "../hooks/useGenerateReport";
import { useReportActions } from "../hooks/useReportActions";

export function HomePage() {
  const { t } = useTranslation(["home", "example", "report"]);
  const meetingInput = useMeetingInput();
  const reportGeneration = useGenerateReport();
  const [originalReport, setOriginalReport] = useState(null);
  const [editableReport, setEditableReport] = useState(null);
  const [reviewStatus, setReviewStatus] = useState("draft");
  const reportActions = useReportActions(editableReport);
  const resultsRef = useRef(null);
  const hasScrolledToResultsRef = useRef(false);
  const hasUnsavedChanges =
    Boolean(originalReport && editableReport) &&
    JSON.stringify(originalReport) !== JSON.stringify(editableReport);

  useEffect(() => {
    if (!reportGeneration.report) {
      return;
    }

    setOriginalReport(reportGeneration.report);
    setEditableReport(reportGeneration.report);
    setReviewStatus("draft");
  }, [reportGeneration.report]);

  async function handleGenerate() {
    setOriginalReport(null);
    setEditableReport(null);
    setReviewStatus("draft");
    hasScrolledToResultsRef.current = false;
    await reportGeneration.generateReport({
      meetingTitle: meetingInput.meetingTitle.trim(),
      transcript: meetingInput.inputText.trim(),
      sourceType: meetingInput.sourceType
    });
  }

  const generationAnnouncement = {
    generating: t("report:announcements.generationStarted"),
    success: t("report:announcements.generationComplete"),
    error: reportGeneration.error || t("report:announcements.generationFailed")
  }[reportGeneration.status] || "";

  useEffect(() => {
    if (
      reportGeneration.hasStartedGeneration &&
      !hasScrolledToResultsRef.current &&
      (reportGeneration.status === "generating" || reportGeneration.status === "success") &&
      resultsRef.current
    ) {
      hasScrolledToResultsRef.current = true;
      const frameId = window.requestAnimationFrame(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });

      return () => window.cancelAnimationFrame(frameId);
    }
  }, [reportGeneration.hasStartedGeneration, reportGeneration.status]);

  useEffect(() => {
    if (
      reportGeneration.status === "success" &&
      reportGeneration.report &&
      resultsRef.current
    ) {
      const frameId = window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          const focusTarget = resultsRef.current?.querySelector("[data-report-heading]");
          if (focusTarget instanceof HTMLElement) {
            focusTarget.focus({ preventScroll: true });
          }
        });
      });

      return () => window.cancelAnimationFrame(frameId);
    }
  }, [reportGeneration.report, reportGeneration.status]);

  return (
    <main className="mx-auto flex w-full max-w-[1440px] flex-col gap-5 px-6 pb-12 pt-6 lg:gap-6">
      <div aria-atomic="true" aria-live="polite" className="sr-only">
        {generationAnnouncement}
      </div>

      <section className="mx-auto flex w-full max-w-[900px] flex-col items-center gap-3 text-center lg:gap-4">
        <h1 className="max-w-3xl whitespace-pre-line font-display text-4xl font-semibold leading-tight text-[--color-ink] sm:text-5xl lg:text-6xl">
          {t("home:hero.title")}
        </h1>
        <p className="max-w-2xl text-base leading-7 text-[--color-muted] sm:text-lg sm:leading-8">
          {t("home:hero.subtitle")}
        </p>
        <button
          className="mt-1 cursor-pointer text-sm font-semibold text-gray-700 underline decoration-teal-500 decoration-2 underline-offset-4 transition duration-150 ease-out hover:text-teal-700 hover:decoration-[3px] active:text-gray-700"
          onClick={meetingInput.loadExample}
          type="button"
        >
          {t("example:loadExampleMeeting")}
        </button>
      </section>

      <section className="mx-auto w-full max-w-[860px]">
        <MeetingInputPanel
          meetingInput={meetingInput}
          onGenerate={handleGenerate}
          isGenerating={reportGeneration.status === "generating"}
          error={reportGeneration.error || meetingInput.error}
        />
      </section>

      {reportGeneration.hasStartedGeneration ? (
        <section className="mx-auto w-full max-w-[1180px]" ref={resultsRef}>
          <ReportWorkspace
            report={editableReport}
            status={reportGeneration.status}
            generationMeta={reportGeneration.meta}
            generationProgress={reportGeneration.progress}
            generationError={reportGeneration.error}
            onRetryGeneration={reportGeneration.retryGeneration}
            exportActions={reportActions}
            hasUnsavedChanges={hasUnsavedChanges}
            reviewStatus={reviewStatus}
            onMarkReviewed={(nextStatus) => setReviewStatus(nextStatus)}
            onReportChange={setEditableReport}
          />
        </section>
      ) : null}
    </main>
  );
}
