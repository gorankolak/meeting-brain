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
  const reportActions = useReportActions(reportGeneration.report);

  async function handleGenerate() {
    await reportGeneration.generateReport({
      meetingTitle: meetingInput.meetingTitle.trim(),
      transcript: meetingInput.inputText.trim(),
      sourceType: meetingInput.sourceType
    });
  }

  const generationAnnouncement = {
    loading: t("report:announcements.generationStarted"),
    success: t("report:announcements.generationComplete"),
    error: reportGeneration.error || t("report:announcements.generationFailed")
  }[reportGeneration.status] || "";

  return (
    <main className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-4 pb-12 pt-6 lg:gap-8 lg:px-8">
      <div aria-atomic="true" aria-live="polite" className="sr-only">
        {generationAnnouncement}
      </div>

      <section className="mx-auto flex w-full max-w-[900px] flex-col items-center gap-4 text-center lg:gap-6">
        <h1 className="max-w-3xl whitespace-pre-line font-display text-4xl font-semibold leading-tight text-[--color-ink] sm:text-5xl lg:text-6xl">
          {t("home:hero.title")}
        </h1>
        <p className="max-w-2xl text-base leading-7 text-[--color-muted] sm:text-lg sm:leading-8">
          {t("home:hero.subtitle")}
        </p>
        <button
          className="mt-3 text-sm font-semibold text-[--color-panel-strong] underline decoration-[--color-accent] decoration-2 underline-offset-4 transition hover:text-[--color-accent]"
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
          isGenerating={reportGeneration.status === "loading"}
          error={reportGeneration.error || meetingInput.error}
        />
      </section>

      {reportGeneration.hasStartedGeneration ? (
        <section className="mx-auto w-full max-w-[860px]">
          <ReportWorkspace
            report={reportGeneration.report}
            status={reportGeneration.status}
            generationMeta={reportGeneration.meta}
            generationProgress={reportGeneration.progress}
            generationError={reportGeneration.error}
            onRetryGeneration={reportGeneration.retryGeneration}
            isRegenerating={reportGeneration.isGenerating}
            exportActions={reportActions}
          />
        </section>
      ) : null}
    </main>
  );
}
