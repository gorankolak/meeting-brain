import { Mail, Copy, FileJson, FileText, TriangleAlert, CheckCircle2 } from "lucide-react";
import { Button } from "../ui/Button";
import { EmailPanel } from "../email/EmailPanel";

function EmptyState() {
  return (
    <div className="flex min-h-[520px] flex-col items-center justify-center rounded-[--radius-panel] border border-dashed border-[--color-border] bg-[linear-gradient(180deg,_rgba(255,255,255,0.96),_rgba(240,247,250,0.9))] px-8 text-center">
      <div className="flex size-18 items-center justify-center rounded-full bg-[--color-panel] text-[--color-accent]">
        <FileText size={28} />
      </div>
      <h2 className="mt-6 text-3xl font-semibold text-[--color-ink]">No report generated yet</h2>
      <p className="mt-3 max-w-md text-sm leading-7 text-[--color-muted]">
        Paste meeting notes, upload a document, or load an example to generate a schema-validated report.
      </p>
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
  const isReady = status === "success" && report;

  return (
    <section className="rounded-[--radius-panel] border border-white/80 bg-white/92 p-5 shadow-[var(--shadow-card)] backdrop-blur-xl">
      <div className="flex flex-col gap-4 border-b border-[--color-border] pb-5 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[--color-warning]">
            Generated report
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-[--color-ink]">
            {report?.meeting_title || "Structured meeting intelligence"}
          </h2>
          <p className="mt-2 text-sm text-[--color-muted]">
            {generationMeta
              ? `${generationMeta.mode} mode • ${generationMeta.generatedAt}`
              : "Ready to analyze"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button disabled={!isReady} onClick={exportActions.copyMarkdown} tone="ghost">
            <Copy size={16} />
            Copy markdown
          </Button>
          <Button disabled={!isReady} onClick={exportActions.downloadMarkdown} tone="ghost">
            <FileText size={16} />
            Markdown
          </Button>
          <Button disabled={!isReady} onClick={exportActions.downloadJson} tone="ghost">
            <FileJson size={16} />
            JSON
          </Button>
        </div>
      </div>

      <div className="mt-6 space-y-5">
        {!isReady ? <EmptyState /> : null}

        {isReady ? (
          <>
            <ReportSection title="Meeting summary">
              <p className="text-sm leading-7 text-[--color-ink]">{report.summary}</p>
            </ReportSection>

            <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
              <ReportSection title="Key decisions">
                <div className="space-y-3">
                  {report.decisions.length ? (
                    report.decisions.map((decision) => (
                      <article key={decision.id} className="rounded-[--radius-button] bg-[--color-panel] p-4">
                        <p className="text-sm font-semibold text-[--color-ink]">{decision.decision}</p>
                        <p className="mt-2 text-sm text-[--color-muted]">{decision.reasoning}</p>
                        <p className="mt-3 text-xs uppercase tracking-[0.14em] text-[--color-muted]">
                          {decision.owner} • confidence {decision.confidence}
                        </p>
                      </article>
                    ))
                  ) : (
                    <p className="text-sm text-[--color-muted]">No explicit decisions captured.</p>
                  )}
                </div>
              </ReportSection>

              <ReportSection title="Next steps">
                <ul className="space-y-3 text-sm text-[--color-ink]">
                  {report.next_steps.length ? (
                    report.next_steps.map((step) => (
                      <li key={step} className="flex gap-3 rounded-[--radius-button] bg-[--color-panel] p-4">
                        <CheckCircle2 className="mt-0.5 shrink-0 text-[--color-accent]" size={16} />
                        <span>{step}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-[--color-muted]">No next steps identified.</li>
                  )}
                </ul>
              </ReportSection>
            </div>

            <ReportSection title="Action items">
              <div className="space-y-3">
                {report.action_items.length ? (
                  report.action_items.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col gap-2 rounded-[--radius-button] border border-[--color-border] bg-[--color-panel] p-4 lg:flex-row lg:items-center lg:justify-between"
                    >
                      <div>
                        <p className="text-sm font-semibold text-[--color-ink]">{item.task}</p>
                        <p className="mt-1 text-sm text-[--color-muted]">{item.notes || "No additional notes."}</p>
                      </div>
                      <div className="text-xs uppercase tracking-[0.14em] text-[--color-muted]">
                        {item.owner} • {item.deadline || "No deadline"} • {item.priority}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-[--color-muted]">No action items identified.</p>
                )}
              </div>
            </ReportSection>

            <div className="grid gap-5 xl:grid-cols-2">
              <ReportSection title="Risks and blockers" tone="warning">
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
                              {risk.owner} • mitigation: {risk.mitigation}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-[--color-muted]">No material risks surfaced.</p>
                  )}
                </div>
              </ReportSection>

              <ReportSection title="Open questions">
                <div className="space-y-3">
                  {report.open_questions.length ? (
                    report.open_questions.map((question) => (
                      <article key={question.id} className="rounded-[--radius-button] bg-[--color-panel] p-4">
                        <p className="text-sm font-semibold text-[--color-ink]">{question.question}</p>
                        <p className="mt-2 text-sm text-[--color-muted]">{question.notes || "No notes."}</p>
                        <p className="mt-3 text-xs uppercase tracking-[0.14em] text-[--color-muted]">
                          {question.owner}
                        </p>
                      </article>
                    ))
                  ) : (
                    <p className="text-sm text-[--color-muted]">No open questions identified.</p>
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
