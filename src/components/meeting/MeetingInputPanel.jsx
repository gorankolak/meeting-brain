import { useEffect, useRef } from "react";
import { FileText, FileUp, Loader2, Sparkles, WandSparkles, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ErrorBanner } from "../ui/ErrorBanner";
import { Button } from "../ui/Button";

function formatFileSize(bytes) {
  if (!bytes) {
    return "";
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

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
    fileSize,
    transcriptError,
    isTranscriptValid,
    setInputText,
    markTranscriptTouched,
    handleFileUpload,
    removeUploadedFile,
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
            className={`min-h-[120px] max-h-[300px] w-full resize-none overflow-y-auto rounded-[--radius-panel] border bg-[--color-panel] px-4 py-3 font-mono text-sm leading-6 text-[--color-ink] outline-none transition duration-150 ease-out focus:border-[--color-accent] focus:bg-white focus:shadow-[0_0_0_4px_rgba(23,200,227,0.12)] ${displayError ? "border-red-300" : "border-[--color-border]"}`}
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

        <div className="flex items-center justify-between px-1 text-xs text-gray-500">
          <span>{t("home:helper.characterCount", { count: inputText.length })}</span>
          <span>{t("home:helper.supportedFiles")}</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-[--radius-button] border border-[--color-border] bg-white/92 px-4 py-3 text-sm font-semibold text-[--color-ink] shadow-[0_10px_24px_rgba(15,23,42,0.04)] transition duration-150 ease-out hover:-translate-y-0.5 hover:border-sky-200 hover:bg-[--color-panel] hover:shadow-[0_16px_32px_rgba(15,23,42,0.08)] active:translate-y-0 active:bg-white active:shadow-[0_8px_18px_rgba(15,23,42,0.05)] focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-[--color-accent]">
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
            tone="secondary"
          >
            <Sparkles size={16} />
            {t("home:buttons.loadExample")}
          </Button>
        </div>

        <div className="flex flex-col gap-3">
          {fileName ? (
            <div className="flex items-center justify-between gap-3 rounded-[--radius-button] border border-[--color-border] bg-surface-100 px-4 py-3 text-sm text-[--color-ink]">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-cyan-100 text-cyan-700">
                  <FileText size={18} />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold">{fileName}</p>
                  <p className="text-xs text-[--color-muted]">{formatFileSize(fileSize)}</p>
                </div>
              </div>
              <button
                aria-label={t("home:buttons.removeFile")}
                className="inline-flex size-8 items-center justify-center rounded-full text-[--color-muted] hover:bg-white hover:text-[--color-ink]"
                onClick={removeUploadedFile}
                type="button"
              >
                <X size={16} />
              </button>
            </div>
          ) : null}
        </div>

        {displayError ? (
          <ErrorBanner id={errorId}>{displayError}</ErrorBanner>
        ) : null}

        <Button
          aria-label={isGenerating ? t("home:buttons.generatingReport") : t("home:buttons.generateReport")}
          className="w-full"
          disabled={isGenerateDisabled}
          onClick={onGenerate}
        >
          {isGenerating ? <Loader2 className="animate-spin" size={16} /> : <WandSparkles size={16} />}
          {isGenerating ? t("home:buttons.generatingReport") : t("home:buttons.generateReport")}
        </Button>
      </div>
    </section>
  );
}
