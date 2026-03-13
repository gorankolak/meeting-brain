import { useState } from "react";
import {
  TriangleAlert,
  CheckCircle2,
  ChevronDown,
  FileText,
  Copy,
  RotateCcw
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "../ui/Button";
import { ErrorBanner } from "../ui/ErrorBanner";
import { ReportExportToolbar } from "./ReportExportToolbar";
import { formatDateTime } from "../../lib/locale";

function LoadingState({ title, body, progress, t }) {
  return (
    <div className="rounded-[--radius-panel] border border-[--color-border] bg-[linear-gradient(180deg,_rgba(255,255,255,0.96),_rgba(240,247,250,0.9))] p-6 sm:p-8">
      <div className="max-w-2xl">
        <h2 className="font-display text-3xl font-semibold text-[--color-ink] sm:text-4xl">{title}</h2>
        <p className="mt-3 max-w-xl text-sm leading-7 text-[--color-muted]">{body}</p>
        <div className="mt-5 rounded-[--radius-button] border border-[--color-border] bg-white/80 p-4">
          <div className="flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-[--color-muted]">
            <span>{t(`report:progress.${progress.currentStage}`)}</span>
            <span>{progress.percent}%</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-[--color-panel]">
            <div
              className="h-full rounded-full bg-[--color-accent] transition-[width] duration-500"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-8 space-y-6">
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-3 rounded-[--radius-panel] border border-[--color-border] bg-white/80 p-5">
            <div className="h-3 w-32 animate-pulse rounded-full bg-[--color-border]" />
            <div className="h-4 w-full animate-pulse rounded-full bg-[--color-panel]" />
            <div className="h-4 w-11/12 animate-pulse rounded-full bg-[--color-panel]" />
            <div className="h-4 w-3/4 animate-pulse rounded-full bg-[--color-panel]" />
          </div>
          <div className="space-y-3 rounded-[--radius-panel] border border-[--color-border] bg-white/80 p-5">
            <div className="h-3 w-28 animate-pulse rounded-full bg-[--color-border]" />
            <div className="h-16 w-full animate-pulse rounded-[--radius-button] bg-[--color-panel]" />
            <div className="h-16 w-full animate-pulse rounded-[--radius-button] bg-[--color-panel]" />
          </div>
        </div>

        <div className="space-y-3 rounded-[--radius-panel] border border-[--color-border] bg-white/80 p-5">
          <div className="h-3 w-36 animate-pulse rounded-full bg-[--color-border]" />
          <div className="h-20 w-full animate-pulse rounded-[--radius-button] bg-[--color-panel]" />
          <div className="h-20 w-full animate-pulse rounded-[--radius-button] bg-[--color-panel]" />
          <div className="h-20 w-5/6 animate-pulse rounded-[--radius-button] bg-[--color-panel]" />
        </div>
      </div>
    </div>
  );
}

function PlaceholderState({ icon: Icon, title, body, actions = null }) {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center rounded-[--radius-panel] border border-dashed border-[--color-border] bg-[linear-gradient(180deg,_rgba(255,255,255,0.96),_rgba(240,247,250,0.9))] px-6 py-10 text-center sm:min-h-[520px] sm:px-8">
      <div className="flex size-18 items-center justify-center rounded-full bg-[--color-panel] text-[--color-accent]">
        <Icon size={28} />
      </div>
      <h2 className="mt-6 font-display text-3xl font-semibold text-[--color-ink] sm:text-4xl">{title}</h2>
      <p className="mt-3 max-w-md text-sm leading-7 text-[--color-muted]">{body}</p>
      {actions ? <div className="mt-6 flex flex-wrap justify-center gap-3">{actions}</div> : null}
    </div>
  );
}

function ReportSection({
  title,
  children,
  tone = "secondary",
  collapsible = false,
  defaultOpen = true,
  badge = null,
  onCopy = null,
  isCopied = false
}) {
  const { t } = useTranslation("report");
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const tones = {
    primary: "bg-white shadow-[0_10px_24px_rgba(15,23,42,0.05)] ring-1 ring-sky-100/80",
    secondary: "bg-white",
    warning: "bg-[#fff8ec] border-[#f5d39a]"
  };
  const titleTones = {
    primary: "text-base font-semibold tracking-[0.12em] text-[--color-ink]",
    secondary: "text-xs font-semibold tracking-[0.18em] text-[--color-muted]",
    warning: "text-xs font-semibold tracking-[0.18em] text-[--color-muted]"
  };

  return (
    <section className={`rounded-[--radius-panel] border border-[--color-border] p-4 sm:p-5 ${tones[tone]}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h3 className={`uppercase ${titleTones[tone]}`}>{title}</h3>
          {badge ? (
            <span className="rounded-full bg-[--color-panel] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[--color-muted]">
              {badge}
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          {onCopy ? (
            <Button
              aria-label={t("report:actions.copy")}
              className="min-h-8 px-3 py-1.5 text-xs"
              onClick={onCopy}
              size="sm"
              tone="ghost"
            >
              <Copy size={14} />
              {isCopied ? t("report:actions.copied") : t("report:actions.copy")}
            </Button>
          ) : null}
          {collapsible ? (
            <button
              aria-label={isOpen ? t("report:actions.hide") : t("report:actions.show")}
              aria-expanded={isOpen}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full px-2 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[--color-muted] transition duration-150 ease-out hover:bg-[--color-panel] hover:text-[--color-ink] active:bg-white"
              onClick={() => setIsOpen((current) => !current)}
              type="button"
            >
              {isOpen ? t("report:actions.hide") : t("report:actions.show")}
              <ChevronDown className={`transition ${isOpen ? "rotate-180" : ""}`} size={16} />
            </button>
          ) : null}
        </div>
      </div>
      {(!collapsible || isOpen) ? <div className="mt-4">{children}</div> : null}
    </section>
  );
}

export function ReportWorkspace({
  report,
  status,
  generationMeta,
  generationProgress,
  generationError,
  onRetryGeneration,
  isRegenerating,
  exportActions
}) {
  const { t, i18n } = useTranslation(["common", "home", "report", "export"]);
  const isReady = status === "success" && report;
  const language = i18n.resolvedLanguage || i18n.language;
  const generatedAt = generationMeta?.generatedAt || report?.generated_at;
  const sourceLabel = generationMeta?.sourceType ? t(`home:sourceTypes.${generationMeta.sourceType}`) : null;

  function renderState() {
    if (status === "loading") {
      return (
        <LoadingState
          body={t("report:loading.body")}
          progress={generationProgress}
          t={t}
          title={t("report:loading.title")}
        />
      );
    }

    if (status === "error") {
      return (
        <PlaceholderState
          actions={
            <Button onClick={onRetryGeneration} tone="secondary">
              {t("common:actions.retry")}
            </Button>
          }
          body={generationError || t("report:error.body")}
          icon={TriangleAlert}
          title={t("report:error.title")}
        />
      );
    }

    return (
      <PlaceholderState
        body={t("report:empty.body")}
        icon={FileText}
        title={t("report:empty.title")}
      />
    );
  }

  return (
    <section className="rounded-[--radius-panel] border border-white/80 bg-white/92 p-5 shadow-[var(--shadow-card)] backdrop-blur-xl sm:p-6 lg:p-7">
      {isReady ? (
        <div className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-[--color-accent]">
          <CheckCircle2 size={16} />
          <span>{t("report:status.generated")}</span>
        </div>
      ) : null}

      <div className="flex flex-col gap-4 border-b border-[--color-border] pb-5 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[--color-warning]">
            {t("report:generatedReport")}
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-[--color-ink] sm:text-4xl">
            {report?.meeting_title || t("report:structuredMeetingIntelligence")}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[--color-muted]">
            {generationMeta
              ? t("report:meta", {
                  mode: t(
                    generationMeta.mode === "mock"
                      ? "common:generationMode.fallback"
                      : "common:generationMode.llm"
                  ),
                  timestamp: formatDateTime(generationMeta.generatedAt, language),
                  attempts: generationMeta.attempts
                })
              : t("common:states.readyToAnalyze")}
          </p>
          {(generatedAt || sourceLabel) ? (
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[--color-muted]">
              {generatedAt ? (
                <span>
                  {t("report:fields.generated")}: {formatDateTime(generatedAt, language)}
                </span>
              ) : null}
              {sourceLabel ? (
                <span>
                  {t("report:fields.source")}: {sourceLabel}
                </span>
              ) : null}
            </div>
          ) : null}
          {generationMeta?.mode === "mock" ? (
            <p className="mt-2 text-xs uppercase tracking-[0.16em] text-[--color-warning]">
              {t("report:fallbackNotice")}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            aria-label={t("report:actions.regenerate")}
            disabled={!isReady || isRegenerating}
            onClick={onRetryGeneration}
            tone="secondary"
          >
            <RotateCcw size={16} />
            {t("report:actions.regenerate")}
          </Button>
        </div>
      </div>

      <div className="mt-6 space-y-5">
        {generationError && status === "error" ? (
          <ErrorBanner>{generationError}</ErrorBanner>
        ) : null}

        {!isReady ? renderState() : null}

        {isReady ? (
          <>
            <ReportSection title={t("export:toolbarTitle")}>
              <div className="space-y-4">
                <p className="text-sm text-[--color-muted]">{t("export:toolbarBody")}</p>
                <ReportExportToolbar
                  disabled={!isReady}
                  isBusy={exportActions.isBusy}
                  onAction={exportActions}
                />
              </div>
            </ReportSection>

            {exportActions.feedback ? (
              <ErrorBanner role="status" tone={exportActions.feedback.tone}>
                {exportActions.feedback.message}
              </ErrorBanner>
            ) : null}

            <ReportSection
              isCopied={exportActions.completedAction === "section-summary"}
              onCopy={() => exportActions.copySection("summary")}
              title={t("report:sections.summary")}
              tone="secondary"
            >
              <p className="max-w-4xl text-sm leading-7 text-[--color-ink] sm:text-[15px]">
                {report.summary}
              </p>
            </ReportSection>

            <div className="grid gap-5 2xl:grid-cols-[1.2fr_0.8fr]">
              <ReportSection
                badge={report.decisions.length}
                collapsible={report.decisions.length > 2}
                defaultOpen
                isCopied={exportActions.completedAction === "section-decisions"}
                onCopy={() => exportActions.copySection("decisions")}
                title={t("report:sections.decisions")}
                tone="primary"
              >
                <div className="space-y-3">
                  {report.decisions.length ? (
                    report.decisions.map((decision) => (
                      <article key={decision.id} className="rounded-[--radius-button] bg-[--color-panel] p-3.5">
                        <p className="text-sm font-semibold text-[--color-ink]">{decision.decision}</p>
                        <p className="mt-2 text-sm text-[--color-muted]">{decision.reasoning}</p>
                        <p className="mt-3 text-xs uppercase tracking-[0.14em] text-[--color-muted]">
                          {t("report:fields.owner")}: {decision.owner} • {t("report:fields.confidence")}{" "}
                          {t(`report:enums.confidence.${decision.confidence}`)}
                        </p>
                      </article>
                    ))
                  ) : (
                    <p className="text-sm text-[--color-muted]">{t("report:empty.decisions")}</p>
                  )}
                </div>
              </ReportSection>

              <ReportSection
                badge={report.next_steps.length}
                collapsible={report.next_steps.length > 4}
                defaultOpen
                isCopied={exportActions.completedAction === "section-nextSteps"}
                onCopy={() => exportActions.copySection("nextSteps")}
                title={t("report:sections.nextSteps")}
                tone="primary"
              >
                <ul className="space-y-3 text-sm text-[--color-ink]">
                  {report.next_steps.length ? (
                    report.next_steps.map((step) => (
                      <li key={step} className="flex gap-3 rounded-[--radius-button] bg-[--color-panel] p-3.5">
                        <CheckCircle2 className="mt-0.5 shrink-0 text-[--color-accent]" size={16} />
                        <span>{step}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-[--color-muted]">{t("report:empty.nextSteps")}</li>
                  )}
                </ul>
              </ReportSection>
            </div>

            <ReportSection
              badge={report.action_items.length}
              collapsible={report.action_items.length > 3}
              defaultOpen
              isCopied={exportActions.completedAction === "section-actionItems"}
              onCopy={() => exportActions.copySection("actionItems")}
              title={t("report:sections.actionItems")}
              tone="primary"
            >
              <div className="space-y-3">
                {report.action_items.length ? (
                  report.action_items.map((item) => (
                    <article
                      key={item.id}
                      className="rounded-[--radius-button] border border-[--color-border] bg-[--color-panel] p-4"
                    >
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-[--color-ink]">{item.task}</p>
                          <p className="mt-1.5 text-sm text-[--color-muted]">
                            {item.notes || t("report:empty.notes")}
                          </p>
                        </div>
                        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs uppercase tracking-[0.14em] text-[--color-muted] sm:grid-cols-3 lg:min-w-[290px] lg:max-w-[320px]">
                          <div>
                            <dt>{t("report:fields.owner")}</dt>
                            <dd className="mt-1 text-[11px] font-semibold text-[--color-ink] normal-case tracking-normal">
                              {item.owner}
                            </dd>
                          </div>
                          <div>
                            <dt>{t("report:fields.deadline")}</dt>
                            <dd className="mt-1 text-[11px] font-semibold text-[--color-ink] normal-case tracking-normal">
                              {item.deadline || t("report:empty.deadline")}
                            </dd>
                          </div>
                          <div className="col-span-2 sm:col-span-1">
                            <dt>{t("report:fields.priority")}</dt>
                            <dd className="mt-1 text-[11px] font-semibold text-[--color-ink] normal-case tracking-normal">
                              {t(`report:enums.priority.${item.priority}`)}
                            </dd>
                          </div>
                        </dl>
                      </div>
                    </article>
                  ))
                ) : (
                  <p className="text-sm text-[--color-muted]">{t("report:empty.actionItems")}</p>
                )}
              </div>
            </ReportSection>

            <div className="grid gap-5 2xl:grid-cols-2">
              <ReportSection
                badge={report.risks.length}
                collapsible
                defaultOpen={false}
                title={t("report:sections.risks")}
                tone="warning"
              >
                <div className="space-y-3">
                  {report.risks.length ? (
                    report.risks.map((risk) => (
                      <div key={risk.id} className="rounded-[--radius-button] border border-[#f2d393] bg-white/70 p-3.5">
                        <div className="flex items-start gap-3">
                          <TriangleAlert className="mt-0.5 shrink-0 text-[--color-warning]" size={16} />
                          <div>
                            <p className="text-sm font-semibold text-[--color-ink]">{risk.risk}</p>
                            <p className="mt-1 text-sm text-[--color-muted]">{risk.impact}</p>
                            <p className="mt-2 text-xs uppercase tracking-[0.14em] text-[--color-muted]">
                              {t("report:fields.owner")}: {risk.owner} • {t("report:fields.mitigation")}:{" "}
                              {risk.mitigation}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-[--color-muted]">{t("report:empty.risks")}</p>
                  )}
                </div>
              </ReportSection>

              <ReportSection
                badge={report.open_questions.length}
                collapsible
                defaultOpen={false}
                title={t("report:sections.openQuestions")}
              >
                <div className="space-y-3">
                  {report.open_questions.length ? (
                    report.open_questions.map((question) => (
                      <article key={question.id} className="rounded-[--radius-button] bg-[--color-panel] p-3.5">
                        <p className="text-sm font-semibold text-[--color-ink]">{question.question}</p>
                        <p className="mt-2 text-sm text-[--color-muted]">
                          {question.notes || t("report:empty.questionNotes")}
                        </p>
                        <p className="mt-3 text-xs uppercase tracking-[0.14em] text-[--color-muted]">
                          {t("report:fields.owner")}: {question.owner}
                        </p>
                      </article>
                    ))
                  ) : (
                    <p className="text-sm text-[--color-muted]">{t("report:empty.openQuestions")}</p>
                  )}
                </div>
              </ReportSection>
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
