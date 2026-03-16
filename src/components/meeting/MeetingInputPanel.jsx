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
  const generateButtonRef = useRef(null);
  const typingRevealTimeoutRef = useRef(0);
  const lastRevealKeyRef = useRef("");
  const pendingPasteRevealRef = useRef(false);
  const previousInputLengthRef = useRef(0);
  const {
    activeExampleId,
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

  function revealGenerateButton(revealKey) {
    if (!revealKey || lastRevealKeyRef.current === revealKey) {
      return;
    }

    const buttonContainer = generateButtonRef.current;
    if (!buttonContainer || typeof window === "undefined") {
      return;
    }

    const rect = buttonContainer.getBoundingClientRect();
    if (rect.bottom <= window.innerHeight - 24) {
      return;
    }

    lastRevealKeyRef.current = revealKey;
    buttonContainer.scrollIntoView({
      behavior: "smooth",
      block: "nearest"
    });
  }

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

  useEffect(() => {
    if (!activeExampleId || !inputText.trim()) {
      return undefined;
    }

    const frame = requestAnimationFrame(() => revealGenerateButton(`example:${activeExampleId}`));
    return () => cancelAnimationFrame(frame);
  }, [activeExampleId, inputText]);

  useEffect(() => {
    if (!fileName || !inputText.trim()) {
      return undefined;
    }

    const frame = requestAnimationFrame(() => revealGenerateButton(`file:${fileName}:${inputText.length}`));
    return () => cancelAnimationFrame(frame);
  }, [fileName, inputText]);

  useEffect(() => {
    const previousLength = previousInputLengthRef.current;
    const nextLength = inputText.length;

    if (pendingPasteRevealRef.current && nextLength > previousLength) {
      pendingPasteRevealRef.current = false;
      const frame = requestAnimationFrame(() => revealGenerateButton(`paste:${nextLength}`));
      previousInputLengthRef.current = nextLength;
      return () => cancelAnimationFrame(frame);
    }

    if (previousLength <= 120 && nextLength > 120) {
      window.clearTimeout(typingRevealTimeoutRef.current);
      typingRevealTimeoutRef.current = window.setTimeout(() => {
        revealGenerateButton(`typed-threshold:${nextLength}`);
      }, 180);
    }

    previousInputLengthRef.current = nextLength;

    return () => {
      window.clearTimeout(typingRevealTimeoutRef.current);
    };
  }, [inputText]);

  return (
    <section className="rounded-lg border border-[--color-border] bg-[--color-surface] p-6 shadow-sm focus-within:ring-2 focus-within:ring-[color-mix(in_srgb,var(--color-primary)_30%,white)]">
      <div className="flex flex-col gap-4">
        <label className="block">
          <span className="mb-3 block text-xs font-medium uppercase tracking-wider text-[--color-text-muted]">
            {t("home:fields.transcript")}
          </span>
          <textarea
            aria-describedby={displayError ? errorId : undefined}
            aria-invalid={displayError ? "true" : "false"}
            className={`min-h-[120px] max-h-[300px] w-full resize-none overflow-y-auto rounded-md border bg-[--color-surface-alt] px-4 py-3 font-mono text-sm leading-6 text-[--color-text] outline-none transition duration-150 ease-out focus:border-[--color-primary] focus:bg-[--color-surface-alt] focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--color-primary)_28%,white)] ${displayError ? "border-red-300" : "border-[--color-border]"}`}
            id="meeting-transcript"
            onBlur={markTranscriptTouched}
            onChange={(event) => setInputText(event.target.value)}
            onInput={() => requestAnimationFrame(autoResizeTextarea)}
            onPaste={() => {
              pendingPasteRevealRef.current = true;
            }}
            placeholder={t("home:placeholders.transcript")}
            ref={textareaRef}
            rows={1}
            value={inputText}
          />
        </label>

        <div className="flex items-center justify-between px-1 text-xs text-[--color-text-muted]">
          <span>{t("home:helper.characterCount", { count: inputText.length })}</span>
          <span>{t("home:helper.supportedFiles")}</span>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2">
            <label className="flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-[--color-border] bg-[--color-surface] px-4 py-3 text-sm font-semibold text-[--color-text] transition duration-150 ease-out hover:bg-[color-mix(in_srgb,var(--color-surface)_92%,black_8%)] active:scale-[0.99] focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-[--color-primary] sm:w-auto">
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
              className="w-full sm:w-auto"
              onClick={loadExample}
              tone="secondary"
            >
              <Sparkles size={16} />
              {t("home:buttons.loadExample")}
            </Button>
          </div>

          <div
            className="w-full sm:w-auto"
            ref={generateButtonRef}
          >
            <Button
              aria-label={isGenerating ? t("home:buttons.generatingReport") : t("home:buttons.generateReport")}
              className="w-full sm:w-auto"
              disabled={isGenerateDisabled}
              onClick={onGenerate}
            >
              {isGenerating ? <Loader2 className="animate-spin" size={16} /> : <WandSparkles size={16} />}
              {isGenerating ? t("home:buttons.generatingReport") : t("home:buttons.generateReport")}
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {fileName ? (
            <div className="flex items-center justify-between gap-3 rounded-md border border-[--color-border] bg-[--color-surface] px-4 py-3 text-sm text-[--color-text]">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-[color-mix(in_srgb,var(--color-primary)_28%,white)] text-[--color-primary-dark]">
                  <FileText size={18} />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold">{fileName}</p>
                  <p className="text-xs text-[--color-text-muted]">{formatFileSize(fileSize)}</p>
                </div>
              </div>
              <button
                aria-label={t("home:buttons.removeFile")}
                className="inline-flex size-8 items-center justify-center rounded-md text-[--color-text-muted] hover:bg-[color-mix(in_srgb,var(--color-surface)_92%,black_8%)] hover:text-[--color-text]"
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
      </div>
    </section>
  );
}
