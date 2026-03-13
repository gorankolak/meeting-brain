import { useState } from "react";
import { useTranslation } from "react-i18next";
import { MeetingInputPanel } from "../components/meeting/MeetingInputPanel";
import { ReportWorkspace } from "../components/report/ReportWorkspace";
import { useMeetingInput } from "../hooks/useMeetingInput";
import { useGenerateReport } from "../hooks/useGenerateReport";
import { useReportActions } from "../hooks/useReportActions";

export function HomePage() {
  const { t } = useTranslation(["home", "example"]);
  const meetingInput = useMeetingInput();
  const reportGeneration = useGenerateReport();
  const reportActions = useReportActions(reportGeneration.report);
  const [emailFeedback, setEmailFeedback] = useState(null);

  async function handleGenerate() {
    setEmailFeedback(null);
    await reportGeneration.generateReport({
      meetingTitle: meetingInput.meetingTitle.trim(),
      transcript: meetingInput.inputText.trim(),
      sourceType: meetingInput.sourceType
    });
  }

  return (
    <main className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-4 pb-12 pt-6 lg:px-8 lg:pt-8">
      <section className="mx-auto flex w-full max-w-[860px] flex-col items-center text-center">
        <h1 className="max-w-3xl whitespace-pre-line font-display text-4xl font-semibold leading-tight text-[--color-ink] sm:text-5xl lg:text-6xl">
          {t("home:hero.title")}
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-8 text-[--color-muted] sm:text-lg">
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
        <section className="mx-auto w-full max-w-5xl">
          <ReportWorkspace
            report={reportGeneration.report}
            status={reportGeneration.status}
            generationMeta={reportGeneration.meta}
            generationProgress={reportGeneration.progress}
            generationError={reportGeneration.error}
            onRetryGeneration={reportGeneration.retryGeneration}
            isRegenerating={reportGeneration.isGenerating}
            exportActions={reportActions}
            emailFeedback={emailFeedback}
            setEmailFeedback={setEmailFeedback}
          />
        </section>
      ) : null}
    </main>
  );
}
