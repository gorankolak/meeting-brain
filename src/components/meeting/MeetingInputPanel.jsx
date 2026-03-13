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
  const {
    meetingTitle,
    inputText,
    sourceType,
    fileName,
    setMeetingTitle,
    setInputText,
    handleFileUpload,
    loadExample
  } = meetingInput;

  return (
    <section className="rounded-[--radius-panel] border border-white/80 bg-white/90 p-5 shadow-[var(--shadow-card)] backdrop-blur-xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[--color-accent]">
            {t("home:eyebrow")}
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold leading-tight text-[--color-ink]">
            {t("home:title")}
          </h1>
        </div>
        <span className="self-start rounded-full bg-[--color-panel] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[--color-muted] sm:shrink-0">
          {t(`home:sourceTypes.${sourceType}`)}
        </span>
      </div>

      <div className="mt-6 space-y-4">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-[--color-ink]">{t("home:fields.meetingTitle")}</span>
          <input
            className="w-full rounded-[--radius-button] border border-[--color-border] bg-[--color-panel] px-4 py-3 text-sm outline-none transition focus:border-[--color-accent]"
            onChange={(event) => setMeetingTitle(event.target.value)}
            placeholder={t("home:placeholders.meetingTitle")}
            value={meetingTitle}
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-[--color-ink]">{t("home:fields.transcript")}</span>
          <textarea
            className="min-h-[340px] w-full rounded-[--radius-panel] border border-[--color-border] bg-[--color-panel] px-4 py-4 font-mono text-sm leading-6 text-[--color-ink] outline-none transition focus:border-[--color-accent]"
            onChange={(event) => setInputText(event.target.value)}
            placeholder={t("home:placeholders.transcript")}
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
            {t("example:loadExampleMeeting")}
          </Button>
        </div>

        <div className="rounded-[--radius-button] border border-dashed border-[--color-border] bg-[--color-panel] px-4 py-3 text-xs uppercase tracking-[0.16em] text-[--color-muted]">
          {fileName ? t("home:helper.loadedFile", { fileName }) : t("home:helper.supportedFiles")}
        </div>

        <p className="text-xs leading-6 text-[--color-muted]">{t("example:helperText")}</p>

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
