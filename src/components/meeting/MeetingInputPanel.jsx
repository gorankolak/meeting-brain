import { useEffect, useRef } from "react";
import { FileUp, Sparkles, WandSparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ErrorBanner } from "../ui/ErrorBanner";
import { Button } from "../ui/Button";

export function MeetingInputPanel({
  meetingInput,
  onGenerate,
  isGenerating,
  error
}) {
  const { t } = useTranslation(["home", "report"]);
  const textareaRef = useRef(null);
  const {
    inputText,
    fileName,
    transcriptError,
    isTranscriptValid,
    setInputText,
    markTranscriptTouched,
    handleFileUpload,
    loadExample
  } = meetingInput;
  const errorId = "transcript-error";
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
    <section className="rounded-[--radius-panel] border border-white/80 bg-white/92 p-6 shadow-[var(--shadow-card)] backdrop-blur-xl focus-within:ring-2 focus-within:ring-sky-200">
      <div className="flex flex-col gap-4">
        <label className="block">
          <span className="mb-3 block text-xs font-medium uppercase tracking-wider text-gray-600">
            {t("home:fields.transcript")}
          </span>
          <textarea
            aria-describedby={displayError ? errorId : undefined}
            aria-invalid={displayError ? "true" : "false"}
            className={`min-h-[120px] max-h-[300px] w-full resize-none overflow-y-auto rounded-[--radius-panel] border bg-[--color-panel] px-4 py-3 font-mono text-sm leading-6 text-[--color-ink] outline-none transition focus:border-[--color-accent] ${displayError ? "border-red-300" : "border-[--color-border]"}`}
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

        <div className="grid grid-cols-2 gap-3">
          <label className="flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-[--radius-button] border border-[--color-border] bg-white/92 px-4 py-3 text-sm font-semibold text-[--color-ink] transition hover:bg-[--color-panel]">
            <FileUp size={16} />
            {t("home:buttons.uploadFile")}
            <input
              accept=".pdf,.docx,.txt,.md"
              aria-label={t("home:buttons.uploadFile")}
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

        <div className="flex flex-col gap-3">
          {fileName ? (
            <div className="rounded-[--radius-button] bg-[--color-panel] px-3 py-2 text-xs text-[--color-muted]">
              {t("home:helper.loadedFile", { fileName })}
            </div>
          ) : null}

          <p className="px-1 text-xs leading-5 text-gray-500">
            {t("home:helper.supportedFiles")}
          </p>
        </div>

        {displayError ? (
          <ErrorBanner id={errorId}>{displayError}</ErrorBanner>
        ) : null}

        <Button
          aria-label={isGenerating ? t("report:loading.title") : t("home:buttons.generateReport")}
          className="w-full border-[--color-panel-strong] bg-[linear-gradient(135deg,_#17c8e3_0%,_#5ee6f2_100%)] shadow-[0_18px_36px_rgba(23,200,227,0.28)] ring-1 ring-white/70 hover:-translate-y-0.5 hover:shadow-[0_22px_42px_rgba(23,200,227,0.34)]"
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
