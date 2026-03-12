import { useState } from "react";
import { MeetingInputPanel } from "../components/meeting/MeetingInputPanel";
import { ReportWorkspace } from "../components/report/ReportWorkspace";
import { useMeetingInput } from "../hooks/useMeetingInput";
import { useGenerateReport } from "../hooks/useGenerateReport";
import { useReportActions } from "../hooks/useReportActions";

export function HomePage() {
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
    <main className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-4 pb-10 pt-6 lg:px-8">
      <section className="grid gap-6 lg:grid-cols-[420px_minmax(0,1fr)]">
        <MeetingInputPanel
          meetingInput={meetingInput}
          onGenerate={handleGenerate}
          isGenerating={reportGeneration.status === "loading"}
          error={reportGeneration.error || meetingInput.error}
        />
        <ReportWorkspace
          report={reportGeneration.report}
          status={reportGeneration.status}
          generationMeta={reportGeneration.meta}
          exportActions={reportActions}
          emailFeedback={emailFeedback}
          setEmailFeedback={setEmailFeedback}
        />
      </section>
    </main>
  );
}
