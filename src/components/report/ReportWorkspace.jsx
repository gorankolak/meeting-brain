import { Mail, Copy, FileJson, FileText, TriangleAlert, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "../ui/Button";
import { EmailPanel } from "../email/EmailPanel";
import { formatDateTime } from "../../lib/locale";

function PlaceholderState({ icon: Icon, title, body }) {
  return (
    <div className="flex min-h-[520px] flex-col items-center justify-center rounded-[--radius-panel] border border-dashed border-[--color-border] bg-[linear-gradient(180deg,_rgba(255,255,255,0.96),_rgba(240,247,250,0.9))] px-8 text-center">
      <div className="flex size-18 items-center justify-center rounded-full bg-[--color-panel] text-[--color-accent]">
        <Icon size={28} />
      </div>
      <h2 className="mt-6 text-3xl font-semibold text-[--color-ink]">{title}</h2>
      <p className="mt-3 max-w-md text-sm leading-7 text-[--color-muted]">{body}</p>
    </div>
  );
}

function ReportSection({ title, children, tone = "default" }) {
  const tones = {
    default: "bg-white",
    warning: "bg-[#fff8ec] border-[#f5d39a]"
  };

  return (
    <section className={`rounded-[--radius-panel] border border-[--color-border] p-5 ${tones[tone]}`}>
      <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[--color-muted]">{title}</h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function ReportWorkspace({
  report,
  status,
  generationMeta,
  exportActions,
  emailFeedback,
  setEmailFeedback
}) {
  const { t, i18n } = useTranslation(["common", "report", "export"]);
  const isReady = status === "success" && report;
  const language = i18n.resolvedLanguage || i18n.language;

  function renderState() {
    if (status === "loading") {
      return (
        <PlaceholderState
          body={t("report:loading.body")}
          icon={FileText}
          title={t("report:loading.title")}
        />
      );
    }

    if (status === "error") {
      return (
        <PlaceholderState
          body={t("report:error.body")}
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
    <section className="rounded-[--radius-panel] border border-white/80 bg-white/92 p-5 shadow-[var(--shadow-card)] backdrop-blur-xl">
      <div className="flex flex-col gap-4 border-b border-[--color-border] pb-5 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[--color-warning]">
            {t("report:generatedReport")}
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-[--color-ink]">
            {report?.meeting_title || t("report:structuredMeetingIntelligence")}
          </h2>
          <p className="mt-2 text-sm text-[--color-muted]">
            {generationMeta
              ? t("report:meta", {
                  mode: t(
                    generationMeta.mode === "mock"
                      ? "common:generationMode.fallback"
                      : "common:generationMode.llm"
                  ),
                  timestamp: formatDateTime(generationMeta.generatedAt, language)
                })
              : t("common:states.readyToAnalyze")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button disabled={!isReady} onClick={exportActions.copyMarkdown} tone="ghost">
            <Copy size={16} />
            {t("export:buttons.copyMarkdown")}
          </Button>
          <Button disabled={!isReady} onClick={exportActions.downloadMarkdown} tone="ghost">
            <FileText size={16} />
            {t("export:buttons.downloadMarkdown")}
          </Button>
          <Button disabled={!isReady} onClick={exportActions.downloadJson} tone="ghost">
            <FileJson size={16} />
            {t("export:buttons.downloadJson")}
          </Button>
        </div>
      </div>

      <div className="mt-6 space-y-5">
        {!isReady ? renderState() : null}

        {isReady ? (
          <>
            <ReportSection title={t("report:sections.summary")}>
              <p className="text-sm leading-7 text-[--color-ink]">{report.summary}</p>
            </ReportSection>

            <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
              <ReportSection title={t("report:sections.decisions")}>
                <div className="space-y-3">
                  {report.decisions.length ? (
                    report.decisions.map((decision) => (
                      <article key={decision.id} className="rounded-[--radius-button] bg-[--color-panel] p-4">
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

              <ReportSection title={t("report:sections.nextSteps")}>
                <ul className="space-y-3 text-sm text-[--color-ink]">
                  {report.next_steps.length ? (
                    report.next_steps.map((step) => (
                      <li key={step} className="flex gap-3 rounded-[--radius-button] bg-[--color-panel] p-4">
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

            <ReportSection title={t("report:sections.actionItems")}>
              <div className="space-y-3">
                {report.action_items.length ? (
                  report.action_items.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col gap-2 rounded-[--radius-button] border border-[--color-border] bg-[--color-panel] p-4 lg:flex-row lg:items-center lg:justify-between"
                    >
                      <div>
                        <p className="text-sm font-semibold text-[--color-ink]">{item.task}</p>
                        <p className="mt-1 text-sm text-[--color-muted]">
                          {item.notes || t("report:empty.notes")}
                        </p>
                      </div>
                      <div className="text-xs uppercase tracking-[0.14em] text-[--color-muted]">
                        {t("report:fields.owner")}: {item.owner} • {t("report:fields.deadline")}:{" "}
                        {item.deadline || t("report:empty.deadline")} • {t("report:fields.priority")}:{" "}
                        {t(`report:enums.priority.${item.priority}`)}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-[--color-muted]">{t("report:empty.actionItems")}</p>
                )}
              </div>
            </ReportSection>

            <div className="grid gap-5 xl:grid-cols-2">
              <ReportSection title={t("report:sections.risks")} tone="warning">
                <div className="space-y-3">
                  {report.risks.length ? (
                    report.risks.map((risk) => (
                      <div key={risk.id} className="rounded-[--radius-button] border border-[#f2d393] bg-white/70 p-4">
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

              <ReportSection title={t("report:sections.openQuestions")}>
                <div className="space-y-3">
                  {report.open_questions.length ? (
                    report.open_questions.map((question) => (
                      <article key={question.id} className="rounded-[--radius-button] bg-[--color-panel] p-4">
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

            <EmailPanel report={report} setEmailFeedback={setEmailFeedback} />
          </>
        ) : null}

        {emailFeedback ? (
          <div className="flex items-start gap-2 rounded-[--radius-button] border border-[--color-border] bg-[--color-panel] px-4 py-3 text-sm text-[--color-ink]">
            <Mail className="mt-0.5 shrink-0 text-[--color-accent]" size={16} />
            <span>{emailFeedback}</span>
          </div>
        ) : null}
      </div>
    </section>
  );
}
