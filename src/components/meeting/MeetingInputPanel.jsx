import { AlertCircle, FileUp, Sparkles, WandSparkles } from "lucide-react";
import { Button } from "../ui/Button";

export function MeetingInputPanel({
  meetingInput,
  onGenerate,
  isGenerating,
  error
}) {
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
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[--color-accent]">
            Input transcript
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold leading-tight text-[--color-ink]">
            Build a project-ready report from raw meeting notes
          </h1>
        </div>
        <span className="rounded-full bg-[--color-panel] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[--color-muted]">
          {sourceType.replace("_", " ")}
        </span>
      </div>

      <div className="mt-6 space-y-4">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-[--color-ink]">Meeting title</span>
          <input
            className="w-full rounded-[--radius-button] border border-[--color-border] bg-[--color-panel] px-4 py-3 text-sm outline-none transition focus:border-[--color-accent]"
            onChange={(event) => setMeetingTitle(event.target.value)}
            placeholder="Sprint review, rollout sync, vendor coordination..."
            value={meetingTitle}
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-[--color-ink]">Transcript or notes</span>
          <textarea
            className="min-h-[340px] w-full rounded-[--radius-panel] border border-[--color-border] bg-[--color-panel] px-4 py-4 font-mono text-sm leading-6 text-[--color-ink] outline-none transition focus:border-[--color-accent]"
            onChange={(event) => setInputText(event.target.value)}
            placeholder="[10:00] Alice: Welcome everyone. Today we are discussing..."
            value={inputText}
          />
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-[--radius-button] border border-[--color-border] bg-white px-4 py-3 text-sm font-semibold text-[--color-ink] transition hover:bg-[--color-panel]">
            <FileUp size={16} />
            Upload file
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
            Load example
          </Button>
        </div>

        <div className="rounded-[--radius-button] border border-dashed border-[--color-border] bg-[--color-panel] px-4 py-3 text-xs uppercase tracking-[0.16em] text-[--color-muted]">
          {fileName ? `Loaded file: ${fileName}` : "Supports PDF, DOCX, TXT, MD up to 5MB"}
        </div>

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
          {isGenerating ? "Generating report..." : "Generate structured report"}
        </Button>
      </div>
    </section>
  );
}
