import { useEffect, useRef } from "react";
import { AlertCircle, FileUp, Sparkles, WandSparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  MAX_TRANSCRIPT_LENGTH,
  MIN_TRANSCRIPT_LENGTH
} from "../../lib/transcriptInput";
import { Button } from "../ui/Button";

export function MeetingInputPanel({
  meetingInput,
  onGenerate,
  isGenerating,
  error
}) {
  const { t } = useTranslation(["home", "common", "example", "report"]);
  const textareaRef = useRef(null);
  const {
    inputText,
    fileName,
    transcriptError,
    isTranscriptValid,
    exampleMeetings,
    activeExampleId,
    setInputText,
    markTranscriptTouched,
    handleFileUpload,
    loadExample
  } = meetingInput;
  const helperId = "transcript-helper";
  const errorId = "transcript-error";
  const currentLength = inputText.trim().length;
  const isGenerateDisabled = isGenerating || !isTranscriptValid;
  const displayError = transcriptError || error;

  function autoResizeTextarea() {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height = `${Math.max(120, Math.min(textarea.scrollHeight, 300))}px`;
  }

  useEffect(() => {
    const frame = requestAnimationFrame(autoResizeTextarea);
    return () => cancelAnimationFrame(frame);
  }, [inputText]);

  return (
    <section className="rounded-[--radius-panel] border border-white/80 bg-white/92 p-4 shadow-[var(--shadow-card)] backdrop-blur-xl sm:p-5">
      <div className="space-y-3">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-[--color-ink]">{t("home:fields.transcript")}</span>
          <textarea
            aria-describedby={displayError ? `${helperId} ${errorId}` : helperId}
            aria-invalid={displayError ? "true" : "false"}
            className={`min-h-[120px] max-h-[300px] w-full resize-none overflow-y-auto rounded-[--radius-panel] border bg-[--color-panel] px-4 py-4 font-mono text-sm leading-6 text-[--color-ink] outline-none transition focus:border-[--color-accent] ${displayError ? "border-red-300" : "border-[--color-border]"}`}
            id="meeting-transcript"
            onBlur={markTranscriptTouched}
            onChange={(event) => setInputText(event.target.value)}
            onInput={() => requestAnimationFrame(autoResizeTextarea)}
            placeholder={t("home:placeholders.transcript")}
            ref={textareaRef}
            rows={1}
            value={inputText}
          />
        </label>

        <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs leading-5 text-[--color-muted]">
          <p id={helperId}>{t("home:helper.transcriptFormats")}</p>
          <p>
            {t("home:helper.transcriptLength", {
              current: currentLength,
              min: MIN_TRANSCRIPT_LENGTH,
              max: MAX_TRANSCRIPT_LENGTH
            })}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-[--radius-button] border border-[--color-border] bg-white px-4 py-3 text-sm font-semibold text-[--color-ink] transition hover:bg-[--color-panel]">
            <FileUp size={16} />
            {t("home:buttons.uploadFile")}
            <input
              accept=".pdf,.docx,.txt,.md"
              className="hidden"
              onChange={(event) => handleFileUpload(event.target.files?.[0])}
              type="file"
            />
          </label>
          <Button
            className="w-full"
            onClick={loadExample}
            tone="ghost"
          >
            <Sparkles size={16} />
            {t("home:buttons.loadExample")}
          </Button>
        </div>

        <div className="space-y-2">
          <p className="px-1 text-xs font-medium uppercase tracking-[0.18em] text-[--color-muted]">
            {t("example:scenarioLabel")}
          </p>
          <div className="grid gap-2 sm:grid-cols-3">
            {exampleMeetings.map((meeting) => (
              <Button
                className={`w-full justify-start text-left ${activeExampleId === meeting.id ? "border-[--color-accent] bg-[--color-panel]" : ""}`}
                key={meeting.id}
                onClick={() => loadExample(meeting.id)}
                tone="ghost"
              >
                <Sparkles size={16} />
                {meeting.title}
              </Button>
            ))}
          </div>
        </div>

        {fileName ? (
          <div className="rounded-[--radius-button] bg-[--color-panel] px-3 py-2 text-xs text-[--color-muted]">
            {t("home:helper.loadedFile", { fileName })}
          </div>
        ) : null}

        <p className="px-1 text-xs leading-5 text-[--color-muted]">
          {t("home:helper.supportedFiles")}
        </p>

        {displayError ? (
          <div
            className="flex items-start gap-2 rounded-[--radius-button] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            id={errorId}
          >
            <AlertCircle className="mt-0.5 shrink-0" size={16} />
            <span>{displayError}</span>
          </div>
        ) : null}

        <Button
          className="w-full"
          disabled={isGenerateDisabled}
          onClick={onGenerate}
        >
          <WandSparkles size={16} />
          {isGenerating ? t("report:loading.title") : t("home:buttons.generateReport")}
        </Button>
      </div>
    </section>
  );
}
