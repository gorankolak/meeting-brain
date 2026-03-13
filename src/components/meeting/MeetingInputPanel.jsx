import { useEffect, useRef } from "react";
import { AlertCircle, FileUp, Sparkles, WandSparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "../ui/Button";

export function MeetingInputPanel({
  meetingInput,
  onGenerate,
  isGenerating,
  error
}) {
  const { t } = useTranslation(["home", "common", "example"]);
  const textareaRef = useRef(null);
  const {
    inputText,
    fileName,
    setInputText,
    handleFileUpload,
    loadExample
  } = meetingInput;

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
            className="min-h-[120px] max-h-[300px] w-full resize-none overflow-y-auto rounded-[--radius-panel] border border-[--color-border] bg-[--color-panel] px-4 py-4 font-mono text-sm leading-6 text-[--color-ink] outline-none transition focus:border-[--color-accent]"
            onChange={(event) => setInputText(event.target.value)}
            onInput={() => requestAnimationFrame(autoResizeTextarea)}
            placeholder={t("home:placeholders.transcript")}
            ref={textareaRef}
            rows={1}
            value={inputText}
          />
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-[--radius-button] border border-[--color-border] bg-white px-4 py-3 text-sm font-semibold text-[--color-ink] transition hover:bg-[--color-panel]">
            <FileUp size={16} />
            {t("home:buttons.uploadFile")}
            <input
              accept=".pdf,.doc,.docx,.txt,.md"
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

        {fileName ? (
          <div className="rounded-[--radius-button] bg-[--color-panel] px-3 py-2 text-xs text-[--color-muted]">
            {t("home:helper.loadedFile", { fileName })}
          </div>
        ) : (
          <p className="px-1 text-xs leading-5 text-[--color-muted]">
            {t("home:helper.supportedFiles")}
          </p>
        )}

        {error ? (
          <div className="flex items-start gap-2 rounded-[--radius-button] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="mt-0.5 shrink-0" size={16} />
            <span>{error}</span>
          </div>
        ) : null}

        <Button
          className="w-full"
          disabled={isGenerating || !inputText.trim()}
          onClick={onGenerate}
        >
          <WandSparkles size={16} />
          {isGenerating ? t("report:loading.title") : t("home:buttons.generateReport")}
        </Button>
      </div>
    </section>
  );
}
