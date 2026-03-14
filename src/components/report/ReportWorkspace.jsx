import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  Clock3,
  Copy,
  FileText,
  ListTodo,
  Loader2,
  Pencil,
  Plus,
  Save,
  ShieldAlert,
  Trash2,
  X
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "../ui/Button";
import { ErrorBanner } from "../ui/ErrorBanner";
import { ReportExportToolbar } from "./ReportExportToolbar";
import { ReportSkeleton } from "./ReportSkeleton";
import { useGenerationProgress } from "../../hooks/useGenerationProgress";
import { formatDateTime } from "../../lib/locale";

const SECTION_REVEAL_DELAY_MS = 120;
const SECTION_SCROLL_OFFSET_PX = 28;
const HEADER_SCROLL_DIRECTION_THRESHOLD_PX = 12;
const HEADER_STICKY_TOP_PX = 16;
const SECTION_ICON_MAP = {
  summary: FileText,
  decisions: CheckCircle,
  actionItems: ListTodo,
  risks: ShieldAlert,
  openQuestions: CircleHelp,
  nextSteps: ArrowRight
};
const REPORT_SECTION_ITEMS = [
  { id: "summary", titleKey: "report:sections.summary", icon: FileText },
  { id: "decisions", titleKey: "report:sections.decisions", icon: CheckCircle },
  { id: "actionItems", titleKey: "report:sections.actionItems", icon: ListTodo },
  { id: "risks", titleKey: "report:sections.risks", icon: ShieldAlert },
  { id: "openQuestions", titleKey: "report:sections.openQuestions", icon: CircleHelp },
  { id: "nextSteps", titleKey: "report:sections.nextSteps", icon: ArrowRight }
];
const INPUT_CLASSNAME =
  "w-full rounded-[--radius-button] border border-slate-200 bg-white px-3 py-2 text-sm text-[--color-ink] outline-none transition focus:border-[--color-accent] focus:shadow-[0_0_0_4px_rgba(23,200,227,0.12)]";
const TEXTAREA_CLASSNAME = `${INPUT_CLASSNAME} min-h-[120px] resize-y leading-6`;
const PRIORITY_OPTIONS = ["high", "medium", "low", "unclear"];

function createId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function SuccessBanner({ report, visible, t }) {
  if (!visible || !report) {
    return null;
  }

  return (
    <div className="mb-5 rounded-[--radius-panel] border border-emerald-200/80 bg-emerald-50/90 px-4 py-3 text-emerald-900 transition duration-300 motion-reduce:transition-none">
      <div className="flex items-start gap-3">
        <CheckCircle className="mt-0.5 shrink-0" size={18} />
        <div>
          <p className="text-sm font-semibold">{t("report:success.title")}</p>
          <p className="mt-1 text-xs text-emerald-800">
            {t("report:success.stats", {
              actionItems: report.action_items.length,
              decisions: report.decisions.length,
              risks: report.risks.length
            })}
          </p>
        </div>
      </div>
    </div>
  );
}

function ProgressPanel({ progress, progressMessage, t }) {
  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
        <div className="flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-[--color-muted]">
          <span>{t(`report:progress.${progress.currentStage}`)}</span>
          <span>{progress.percent}%</span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-200">
          <div
            className="h-full rounded-full bg-[--color-accent] transition-[width] duration-500 motion-reduce:transition-none"
            style={{ width: `${progress.percent}%` }}
          />
        </div>
      </div>

      <div aria-live="polite" className="text-sm font-medium text-[--color-muted]">
        {progressMessage}
      </div>

      <ReportSkeleton />
    </div>
  );
}

function PlaceholderState({ icon: Icon, title, body, actions = null }) {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white px-6 py-10 text-center sm:min-h-[520px] sm:px-8">
      <div className="flex size-18 items-center justify-center rounded-[--radius-button] bg-[--color-panel] text-[--color-accent]">
        <Icon size={28} />
      </div>
      <h2 className="mt-6 font-display text-3xl font-semibold text-[--color-ink] sm:text-4xl">{title}</h2>
      <p className="mt-3 max-w-md text-sm leading-7 text-[--color-muted]">{body}</p>
      {actions ? <div className="mt-6 flex flex-wrap justify-center gap-3">{actions}</div> : null}
    </div>
  );
}

function PriorityBadge({ label, priority }) {
  const tones = {
    high: "border-red-200 bg-red-50 text-red-700",
    medium: "border-amber-200 bg-amber-50 text-amber-700",
    low: "border-surface-200 bg-surface-100 text-surface-700",
    unclear: "border-surface-200 bg-surface-100 text-surface-700"
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium ${tones[priority]}`}>
      {label}
    </span>
  );
}

function ToastFeedback({ feedback }) {
  if (!feedback) {
    return null;
  }

  const tone =
    feedback.tone === "error"
      ? "border-red-200 bg-white text-red-700"
      : "border-emerald-200 bg-white text-emerald-700";

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-50">
      <div className={`rounded-[--radius-panel] border px-4 py-3 shadow-[var(--shadow-soft)] ${tone}`}>
        <p className="text-sm font-semibold">{feedback.message}</p>
      </div>
    </div>
  );
}

function SectionCopyButton({ isCopied, onClick, t, title }) {
  const label = isCopied ? t("report:actions.copied") : t("report:actions.copy");

  return (
    <Button
      aria-label={`${label}: ${title}`}
      className="min-h-8 rounded-lg px-2.5 py-1.5 sm:px-2"
      onClick={onClick}
      size="xs"
      title={`${label}: ${title}`}
      tone="ghost"
    >
      <Copy size={14} />
      <span className="sm:hidden">{label}</span>
    </Button>
  );
}

function SectionToggleButton({ isOpen, onClick, t }) {
  return (
    <button
      aria-expanded={isOpen}
      className="inline-flex min-h-8 items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-[--color-muted] transition hover:bg-surface-100 hover:text-[--color-ink] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[--color-accent] motion-reduce:transition-none"
      onClick={onClick}
      type="button"
    >
      <span>{isOpen ? t("report:actions.hide") : t("report:actions.show")}</span>
      <ChevronDown className={`transition motion-reduce:transition-none ${isOpen ? "rotate-180" : ""}`} size={15} />
    </button>
  );
}

function ReportSection({
  title,
  icon: Icon,
  children,
  tone = "secondary",
  collapsible = false,
  defaultOpen = true,
  badge = null,
  onCopy = null,
  isCopied = false,
  revealIndex = 0,
  isVisible = false,
  actions = null,
  sectionId = undefined,
  sectionRef = undefined,
  scrollMarginTop = undefined
}) {
  const { t } = useTranslation("report");
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const tones = {
    primary: "border-slate-200 bg-slate-50",
    secondary: "border-slate-200 bg-slate-50",
    warning: "border-slate-200 bg-slate-50"
  };

  useEffect(() => {
    setIsOpen(defaultOpen);
  }, [defaultOpen, title]);

  return (
    <section
      id={sectionId}
      ref={sectionRef}
      className={`rounded-xl border p-4 shadow-[0_10px_30px_rgba(15,23,42,0.03)] transition duration-300 ease-out motion-reduce:transform-none motion-reduce:transition-none sm:p-5 ${tones[tone]} ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      }`}
      style={{
        scrollMarginTop: scrollMarginTop ? `${scrollMarginTop}px` : undefined,
        transitionDelay: `${revealIndex * SECTION_REVEAL_DELAY_MS}ms`
      }}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            {Icon ? (
              <span className="flex size-9 shrink-0 items-center justify-center rounded-[--radius-button] bg-surface-100 text-[--color-accent]">
                <Icon size={17} />
              </span>
            ) : null}
            <div className="flex min-w-0 items-center gap-2.5">
              <h3 className="text-base font-semibold text-[--color-ink] sm:text-[17px]">{title}</h3>
              {badge !== null ? (
                <span className="inline-flex min-w-7 items-center justify-center rounded-full border border-surface-200 bg-surface-100 px-2 py-0.5 text-[11px] font-medium text-[--color-muted]">
                  {badge}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {actions}
          {onCopy ? <SectionCopyButton isCopied={isCopied} onClick={onCopy} t={t} title={title} /> : null}
          {collapsible ? (
            <SectionToggleButton isOpen={isOpen} onClick={() => setIsOpen((current) => !current)} t={t} />
          ) : null}
        </div>
      </div>

      {!collapsible || isOpen ? <div className="mt-4">{children}</div> : null}
    </section>
  );
}

function ReportSectionNav({ activeSectionId, items, onSelect, stickyTop = 16, t, variant = "desktop" }) {
  const isDesktop = variant === "desktop";

  return (
    <div
      className={
        isDesktop
          ? "sticky"
          : "sticky z-20 -mx-5 border-b border-slate-200 bg-white/90 px-5 py-3 backdrop-blur-md sm:-mx-6 sm:px-6"
      }
      style={{ top: `${stickyTop}px` }}
    >
      <nav
        aria-label={t("report:generatedReport")}
        className={isDesktop ? "space-y-1" : "flex gap-1.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"}
      >
        {items.map((item) => {
          const isActive = item.id === activeSectionId;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              className={
                isDesktop
                  ? `flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition duration-200 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[--color-accent] motion-reduce:transition-none ${
                      isActive
                        ? "bg-cyan-50/90 text-cyan-950 shadow-[inset_0_0_0_1px_rgba(8,145,178,0.14)]"
                        : "text-[--color-muted] hover:bg-surface-100 hover:text-[--color-ink]"
                    }`
                  : `shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition duration-200 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[--color-accent] motion-reduce:transition-none ${
                      isActive
                        ? "bg-cyan-50/90 text-cyan-950 shadow-[inset_0_0_0_1px_rgba(8,145,178,0.14)]"
                        : "text-[--color-muted] hover:bg-surface-100 hover:text-[--color-ink]"
                    }`
              }
              onClick={() => onSelect(item.id)}
              type="button"
            >
              <Icon className="shrink-0" size={isDesktop ? 16 : 14} />
              <span>{t(item.titleKey)}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

function ReviewStatusBadge({ hasUnsavedChanges, reviewStatus, t }) {
  const badge =
    reviewStatus === "reviewed"
      ? {
          label: t("report:review.reviewed"),
          className: "border-cyan-200 bg-cyan-50 text-cyan-800"
        }
      : hasUnsavedChanges
        ? {
            label: t("report:review.unsavedChanges"),
            className: "border-amber-200 bg-amber-50 text-amber-800"
          }
        : {
            label: t("report:review.draft"),
            className: "border-surface-200 bg-surface-100 text-surface-700"
          };

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium ${badge.className}`}>
      {badge.label}
    </span>
  );
}

function MetaPill({ children, tone = "neutral" }) {
  const tones = {
    neutral: "border-surface-200 bg-surface-50 text-[--color-muted]",
    warning: "border-amber-200 bg-amber-50 text-amber-800"
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}

function SummaryEditor({ isEditingEnabled, report, onSave, onDirty }) {
  const { t } = useTranslation("report");
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(report.summary);

  useEffect(() => {
    setDraft(report.summary);
    setIsEditing(false);
  }, [isEditingEnabled, report.summary, report.generated_at]);

  if (isEditingEnabled && isEditing) {
    return (
      <div className="space-y-3">
        <textarea
          className={TEXTAREA_CLASSNAME}
          onChange={(event) => setDraft(event.target.value)}
          value={draft}
        />
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => {
              onSave(draft);
              onDirty();
              setIsEditing(false);
            }}
            size="sm"
          >
            <Save size={16} />
            {t("report:editor.save")}
          </Button>
          <Button
            onClick={() => {
              setDraft(report.summary);
              setIsEditing(false);
            }}
            size="sm"
            tone="secondary"
          >
            <X size={16} />
            {t("report:editor.cancel")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {isEditingEnabled ? (
        <div>
          <Button
            className="min-h-8 rounded-lg px-2.5 py-1.5"
            onClick={() => {
              setIsEditing(true);
            }}
            size="xs"
            tone="ghost"
          >
            <Pencil size={14} />
            {t("report:editor.edit")}
          </Button>
        </div>
      ) : null}
      <p className="max-w-4xl text-sm leading-7 text-[--color-ink] sm:text-[15px]">{report.summary}</p>
    </div>
  );
}

function DecisionsEditor({ isEditingEnabled, report, onChange, onDirty }) {
  const { t } = useTranslation("report");
  const [editingId, setEditingId] = useState("");
  const [draftValue, setDraftValue] = useState("");
  const [newDecision, setNewDecision] = useState("");

  useEffect(() => {
    setEditingId("");
    setDraftValue("");
    setNewDecision("");
  }, [isEditingEnabled, report.generated_at]);

  return (
    <div className="space-y-3">
      {report.decisions.length ? (
        report.decisions.map((decision) => {
          const isEditing = editingId === decision.id;

          return (
            <article key={decision.id} className="rounded-[--radius-panel] border border-slate-200 bg-white p-4">
              {isEditing ? (
                <div className="space-y-3">
                  <textarea
                    className={`${TEXTAREA_CLASSNAME} min-h-[96px]`}
                    onChange={(event) => setDraftValue(event.target.value)}
                    value={draftValue}
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() => {
                        onChange((current) =>
                          current.map((item) =>
                            item.id === decision.id ? { ...item, decision: draftValue } : item
                          )
                        );
                        onDirty();
                        setEditingId("");
                        setDraftValue("");
                      }}
                      size="sm"
                    >
                      <Save size={16} />
                      {t("report:editor.save")}
                    </Button>
                    <Button
                      onClick={() => {
                        setEditingId("");
                        setDraftValue("");
                      }}
                      size="sm"
                      tone="secondary"
                    >
                      <X size={16} />
                      {t("report:editor.cancel")}
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <p className="text-sm font-semibold text-[--color-ink]">{decision.decision}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {isEditingEnabled ? (
                        <>
                          <Button
                            className="min-h-8 rounded-lg px-2.5 py-1.5"
                            onClick={() => {
                              setEditingId(decision.id);
                              setDraftValue(decision.decision);
                            }}
                            size="xs"
                            tone="ghost"
                          >
                            <Pencil size={14} />
                            {t("report:editor.edit")}
                          </Button>
                          <Button
                            className="min-h-8 rounded-lg px-2.5 py-1.5"
                            onClick={() => {
                              onChange((current) => current.filter((item) => item.id !== decision.id));
                              onDirty();
                            }}
                            size="xs"
                            tone="ghost"
                          >
                            <Trash2 size={14} />
                            {t("report:editor.delete")}
                          </Button>
                        </>
                      ) : null}
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-[--color-muted]">{decision.reasoning}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                    <MetaPill>{decision.owner}</MetaPill>
                    <MetaPill>{t(`report:enums.confidence.${decision.confidence}`)}</MetaPill>
                  </div>
                </>
              )}
            </article>
          );
        })
      ) : (
        <p className="text-sm text-[--color-muted]">{t("report:empty.decisions")}</p>
      )}

      {isEditingEnabled ? (
        <div className="rounded-[--radius-panel] border border-dashed border-slate-200 bg-white p-4">
          <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-[--color-muted]">
            {t("report:editor.addDecision")}
          </label>
          <textarea
            className={`${TEXTAREA_CLASSNAME} mt-2 min-h-[88px]`}
            onChange={(event) => setNewDecision(event.target.value)}
            placeholder={t("report:editor.decisionPlaceholder")}
            value={newDecision}
          />
          <div className="mt-3">
            <Button
              disabled={!newDecision.trim()}
              onClick={() => {
                onChange((current) => [
                  ...current,
                  {
                    id: createId("decision"),
                    decision: newDecision.trim(),
                    reasoning: t("report:editor.addedManually"),
                    owner: t("report:editor.unassigned"),
                    confidence: "medium"
                  }
                ]);
                onDirty();
                setNewDecision("");
              }}
              size="sm"
              tone="secondary"
            >
              <Plus size={16} />
              {t("report:editor.add")}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ActionItemsEditor({ isEditingEnabled, report, onChange, onDirty }) {
  const { t } = useTranslation("report");
  const [editingId, setEditingId] = useState("");
  const [draft, setDraft] = useState(null);
  const [newItem, setNewItem] = useState({
    task: "",
    owner: "",
    deadline: "",
    priority: "medium"
  });

  useEffect(() => {
    setEditingId("");
    setDraft(null);
    setNewItem({
      task: "",
      owner: "",
      deadline: "",
      priority: "medium"
    });
  }, [isEditingEnabled, report.generated_at]);

  function startEditing(item) {
    setEditingId(item.id);
    setDraft({
      task: item.task,
      owner: item.owner,
      deadline: item.deadline,
      priority: item.priority
    });
  }

  function updateDraft(field, value) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  return (
    <div className="space-y-3">
      {report.action_items.length ? (
        report.action_items.map((item) => {
          const isEditing = editingId === item.id;

          return (
            <article
              key={item.id}
              className="rounded-[--radius-panel] border border-slate-200 bg-white p-4 transition hover:border-slate-300 motion-reduce:transition-none"
            >
              {isEditing && draft ? (
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-[--color-muted]">
                      {t("report:fields.task")}
                    </label>
                    <textarea
                      className={`${TEXTAREA_CLASSNAME} min-h-[88px]`}
                      onChange={(event) => updateDraft("task", event.target.value)}
                      value={draft.task}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-[--color-muted]">
                      {t("report:fields.owner")}
                    </label>
                    <input
                      className={INPUT_CLASSNAME}
                      onChange={(event) => updateDraft("owner", event.target.value)}
                      value={draft.owner}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-[--color-muted]">
                      {t("report:fields.deadline")}
                    </label>
                    <input
                      className={INPUT_CLASSNAME}
                      onChange={(event) => updateDraft("deadline", event.target.value)}
                      value={draft.deadline}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-[--color-muted]">
                      {t("report:fields.priority")}
                    </label>
                    <select
                      className={INPUT_CLASSNAME}
                      onChange={(event) => updateDraft("priority", event.target.value)}
                      value={draft.priority}
                    >
                      {PRIORITY_OPTIONS.map((priority) => (
                        <option key={priority} value={priority}>
                          {t(`report:enums.priority.${priority}`)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={() => {
                          onChange((current) =>
                            current.map((currentItem) =>
                              currentItem.id === item.id ? { ...currentItem, ...draft } : currentItem
                            )
                          );
                          onDirty();
                          setEditingId("");
                          setDraft(null);
                        }}
                        size="sm"
                      >
                        <Save size={16} />
                        {t("report:editor.save")}
                      </Button>
                      <Button
                        onClick={() => {
                          setEditingId("");
                          setDraft(null);
                        }}
                        size="sm"
                        tone="secondary"
                      >
                        <X size={16} />
                        {t("report:editor.cancel")}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-[15px] font-semibold text-[--color-ink]">{item.task}</p>
                      <p className="mt-1.5 text-sm text-[--color-muted]">{item.notes || t("report:empty.notes")}</p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {isEditingEnabled ? (
                        <>
                          <Button className="min-h-8 rounded-lg px-2.5 py-1.5" onClick={() => startEditing(item)} size="xs" tone="ghost">
                            <Pencil size={14} />
                            {t("report:editor.edit")}
                          </Button>
                          <Button
                            className="min-h-8 rounded-lg px-2.5 py-1.5"
                            onClick={() => {
                              onChange((current) => current.filter((currentItem) => currentItem.id !== item.id));
                              onDirty();
                            }}
                            size="xs"
                            tone="ghost"
                          >
                            <Trash2 size={14} />
                            {t("report:editor.delete")}
                          </Button>
                        </>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 text-[11px]">
                    <MetaPill>{item.owner || t("report:editor.unassigned")}</MetaPill>
                    <MetaPill>
                      <Clock3 size={12} />
                      {item.deadline || t("report:empty.deadline")}
                    </MetaPill>
                    <PriorityBadge
                      label={t(`report:enums.priority.${item.priority}`)}
                      priority={item.priority}
                    />
                  </div>
                </div>
              )}
            </article>
          );
        })
      ) : (
        <p className="text-sm text-[--color-muted]">{t("report:empty.actionItems")}</p>
      )}

      {isEditingEnabled ? (
        <div className="rounded-[--radius-panel] border border-dashed border-slate-200 bg-white p-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-[--color-muted]">
                {t("report:fields.task")}
              </label>
              <textarea
                className={`${TEXTAREA_CLASSNAME} min-h-[88px]`}
                onChange={(event) => setNewItem((current) => ({ ...current, task: event.target.value }))}
                placeholder={t("report:editor.taskPlaceholder")}
                value={newItem.task}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-[--color-muted]">
                {t("report:fields.owner")}
              </label>
              <input
                className={INPUT_CLASSNAME}
                onChange={(event) => setNewItem((current) => ({ ...current, owner: event.target.value }))}
                placeholder={t("report:editor.ownerPlaceholder")}
                value={newItem.owner}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-[--color-muted]">
                {t("report:fields.deadline")}
              </label>
              <input
                className={INPUT_CLASSNAME}
                onChange={(event) => setNewItem((current) => ({ ...current, deadline: event.target.value }))}
                placeholder={t("report:editor.deadlinePlaceholder")}
                value={newItem.deadline}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-[--color-muted]">
                {t("report:fields.priority")}
              </label>
              <select
                className={INPUT_CLASSNAME}
                onChange={(event) => setNewItem((current) => ({ ...current, priority: event.target.value }))}
                value={newItem.priority}
              >
                {PRIORITY_OPTIONS.map((priority) => (
                  <option key={priority} value={priority}>
                    {t(`report:enums.priority.${priority}`)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-3">
            <Button
              disabled={!newItem.task.trim()}
              onClick={() => {
                onChange((current) => [
                  ...current,
                  {
                    id: createId("action"),
                    task: newItem.task.trim(),
                    owner: newItem.owner.trim() || t("report:editor.unassigned"),
                    deadline: newItem.deadline.trim(),
                    priority: newItem.priority,
                    status: "open",
                    notes: t("report:editor.addedManually")
                  }
                ]);
                onDirty();
                setNewItem({
                  task: "",
                  owner: "",
                  deadline: "",
                  priority: "medium"
                });
              }}
              size="sm"
              tone="secondary"
            >
              <Plus size={16} />
              {t("report:editor.addTask")}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function ReportWorkspace({
  report,
  status,
  generationMeta,
  generationProgress,
  generationError,
  onRetryGeneration,
  exportActions,
  hasUnsavedChanges,
  reviewStatus,
  onMarkReviewed,
  onReportChange
}) {
  const { t, i18n } = useTranslation(["common", "home", "report", "export"]);
  const isReady = status === "success" && report;
  const language = i18n.resolvedLanguage || i18n.language;
  const generatedAt = generationMeta?.generatedAt || report?.generated_at;
  const sourceLabel = generationMeta?.sourceType ? t(`home:sourceTypes.${generationMeta.sourceType}`) : null;
  const generationMessages = useMemo(
    () => [
      t("report:generationMessages.analyzing"),
      t("report:generationMessages.decisions"),
      t("report:generationMessages.actionItems"),
      t("report:generationMessages.risks"),
      t("report:generationMessages.preparing")
    ],
    [t]
  );
  const progressMessage = useGenerationProgress(status === "generating", generationMessages);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const [revealedSections, setRevealedSections] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState(REPORT_SECTION_ITEMS[0].id);
  const [isHeaderCompact, setIsHeaderCompact] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [mobileNavHeight, setMobileNavHeight] = useState(0);
  const headerRef = useRef(null);
  const mobileNavRef = useRef(null);
  const sectionRefs = useRef({});
  const sectionObserverRef = useRef(null);
  const scrollFrameRef = useRef(0);
  const lastScrollYRef = useRef(0);
  const scrollMarginTop = headerHeight + mobileNavHeight + SECTION_SCROLL_OFFSET_PX + 16;

  useEffect(() => {
    if (!isReady || !generatedAt) {
      setShowSuccessBanner(false);
      setRevealedSections([]);
      return undefined;
    }

    setShowSuccessBanner(true);

    const sectionIds = ["header", "summary", "decisions", "actionItems", "risks", "openQuestions", "nextSteps"];
    const timers = sectionIds.map((sectionId, index) =>
      window.setTimeout(() => {
        setRevealedSections((current) => [...new Set([...current, sectionId])]);
      }, index * SECTION_REVEAL_DELAY_MS)
    );
    const bannerTimer = window.setTimeout(() => setShowSuccessBanner(false), 5000);

    return () => {
      timers.forEach((timerId) => window.clearTimeout(timerId));
      window.clearTimeout(bannerTimer);
    };
  }, [generatedAt, isReady]);

  useEffect(() => {
    setIsEditing(false);
    setIsHeaderCompact(false);
    setActiveSectionId(REPORT_SECTION_ITEMS[0].id);
  }, [isReady, generatedAt]);

  useEffect(() => {
    if (!isReady) {
      setHeaderHeight(0);
      setMobileNavHeight(0);
      return undefined;
    }

    if (typeof ResizeObserver === "undefined") {
      setHeaderHeight(headerRef.current?.getBoundingClientRect().height || 0);
      setMobileNavHeight(mobileNavRef.current?.getBoundingClientRect().height || 0);
      return undefined;
    }

    const resizeObserver = new ResizeObserver(() => {
      setHeaderHeight(headerRef.current?.getBoundingClientRect().height || 0);
      setMobileNavHeight(mobileNavRef.current?.getBoundingClientRect().height || 0);
    });

    if (headerRef.current) {
      resizeObserver.observe(headerRef.current);
    }

    if (mobileNavRef.current) {
      resizeObserver.observe(mobileNavRef.current);
    }

    setHeaderHeight(headerRef.current?.getBoundingClientRect().height || 0);
    setMobileNavHeight(mobileNavRef.current?.getBoundingClientRect().height || 0);

    return () => resizeObserver.disconnect();
  }, [isReady, generatedAt]);

  useEffect(() => {
    if (!isReady) {
      sectionObserverRef.current?.disconnect();
      sectionObserverRef.current = null;
      return undefined;
    }

    const sections = REPORT_SECTION_ITEMS.map((item) => sectionRefs.current[item.id]).filter(Boolean);

    if (!sections.length) {
      return undefined;
    }

    if (typeof IntersectionObserver === "undefined") {
      setActiveSectionId(REPORT_SECTION_ITEMS[0].id);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((entryA, entryB) => entryB.intersectionRatio - entryA.intersectionRatio);

        if (visibleEntries.length) {
          setActiveSectionId(visibleEntries[0].target.id);
        }
      },
      {
        root: null,
        rootMargin: `-${headerHeight + mobileNavHeight + 40}px 0px -50% 0px`,
        threshold: [0.2, 0.35, 0.5, 0.65]
      }
    );

    sections.forEach((section) => observer.observe(section));
    sectionObserverRef.current = observer;

    return () => {
      observer.disconnect();
      sectionObserverRef.current = null;
    };
  }, [generatedAt, headerHeight, isReady, mobileNavHeight]);

  useEffect(() => {
    if (!isReady || typeof window === "undefined") {
      setIsHeaderCompact(false);
      return undefined;
    }

    lastScrollYRef.current = window.scrollY;

    const updateStickyHeaderState = () => {
      scrollFrameRef.current = 0;

      const summarySection = sectionRefs.current.summary;
      const headerElement = headerRef.current;

      if (!summarySection || !headerElement) {
        return;
      }

      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollYRef.current;
      const summaryTop = summarySection.getBoundingClientRect().top;
      const enteredContent = summaryTop <= headerElement.getBoundingClientRect().height + 40;

      if (!enteredContent || currentScrollY <= 32) {
        setIsHeaderCompact(false);
      } else if (delta >= HEADER_SCROLL_DIRECTION_THRESHOLD_PX) {
        setIsHeaderCompact(true);
      } else if (delta <= -HEADER_SCROLL_DIRECTION_THRESHOLD_PX) {
        setIsHeaderCompact(false);
      }

      lastScrollYRef.current = currentScrollY;
    };

    const onScroll = () => {
      if (scrollFrameRef.current) {
        return;
      }

      scrollFrameRef.current = window.requestAnimationFrame(updateStickyHeaderState);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (scrollFrameRef.current) {
        window.cancelAnimationFrame(scrollFrameRef.current);
      }
      scrollFrameRef.current = 0;
    };
  }, [generatedAt, headerHeight, isReady, mobileNavHeight]);

  function updateReportSection(field, updater) {
    onReportChange((current) => {
      if (!current) {
        return current;
      }

      const nextValue = typeof updater === "function" ? updater(current[field]) : updater;
      return {
        ...current,
        [field]: nextValue
      };
    });
  }

  function markDirty() {
    if (reviewStatus === "reviewed") {
      onMarkReviewed("draft");
    }
  }

  function renderState() {
    if (status === "generating") {
      return <ProgressPanel progress={generationProgress} progressMessage={progressMessage} t={t} />;
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
          icon={AlertTriangle}
          title={t("report:error.title")}
        />
      );
    }

    return <PlaceholderState body={t("report:empty.body")} icon={FileText} title={t("report:empty.title")} />;
  }

  function isSectionVisible(sectionId) {
    return revealedSections.includes(sectionId);
  }

  function setSectionRef(sectionId) {
    return (node) => {
      if (node) {
        sectionRefs.current[sectionId] = node;
      } else {
        delete sectionRefs.current[sectionId];
      }
    };
  }

  function scrollToSection(sectionId) {
    const section = sectionRefs.current[sectionId];

    if (!section) {
      return;
    }

    setActiveSectionId(sectionId);
    setIsHeaderCompact(true);
    section.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }

  const headerVisible = isSectionVisible("header");
  const reportTitle = report?.meeting_title || t("report:structuredMeetingIntelligence");

  return (
    <>
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-[var(--shadow-card)] sm:p-6 lg:p-7">
        <SuccessBanner report={report} t={t} visible={showSuccessBanner} />

        {generationError && status === "error" ? <ErrorBanner>{generationError}</ErrorBanner> : null}

        {!isReady ? renderState() : null}

        {isReady ? (
          <div className="space-y-5 xl:grid xl:grid-cols-[220px_minmax(0,1fr)] xl:items-start xl:gap-8 xl:space-y-0">
            <aside className="hidden xl:block">
              <ReportSectionNav
                activeSectionId={activeSectionId}
                items={REPORT_SECTION_ITEMS}
                onSelect={scrollToSection}
                stickyTop={24}
                t={t}
                variant="desktop"
              />
            </aside>

            <div className="min-w-0 space-y-5">
              <div
                ref={headerRef}
                className={`sticky z-30 rounded-xl border border-slate-200 border-b bg-white/90 shadow-[0_14px_32px_rgba(15,23,42,0.07)] backdrop-blur-lg transition-all duration-200 ease-out motion-reduce:transform-none motion-reduce:transition-none ${
                  isHeaderCompact ? "px-4 py-3 sm:px-5" : "px-4 py-4 sm:px-5"
                } ${
                  headerVisible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
                }`}
                style={{ top: `${HEADER_STICKY_TOP_PX}px` }}
              >
                {isHeaderCompact ? (
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <h2
                        className="truncate font-display text-lg font-semibold text-[--color-ink] sm:text-xl"
                        data-report-heading="true"
                        tabIndex={-1}
                        title={reportTitle}
                      >
                        {reportTitle}
                      </h2>
                    </div>

                    <div className="w-full lg:w-auto lg:max-w-none">
                      <ReportExportToolbar
                        compact
                        disabled={!isReady}
                        isBusy={exportActions.isBusy}
                        isEditing={isEditing}
                        onAction={exportActions}
                        onToggleEditing={() => setIsEditing((current) => !current)}
                        onToggleReview={() =>
                          onMarkReviewed(reviewStatus === "reviewed" ? "draft" : "reviewed")
                        }
                        reviewActionDisabled={false}
                        reviewActionLabel={
                          reviewStatus === "reviewed" ? t("report:review.markDraft") : t("report:review.markReviewed")
                        }
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[--color-warning]">
                          {t("report:generatedReport")}
                        </p>
                        <h2
                          className="mt-2 font-display text-2xl font-semibold text-[--color-ink] sm:text-3xl"
                          data-report-heading="true"
                          tabIndex={-1}
                          title={reportTitle}
                        >
                          {reportTitle}
                        </h2>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[--color-accent]">
                            <CheckCircle2 size={15} />
                            <span>{t("report:status.generated")}</span>
                          </span>
                          <ReviewStatusBadge hasUnsavedChanges={hasUnsavedChanges} reviewStatus={reviewStatus} t={t} />
                        </div>
                      </div>

                      <div className="w-full max-w-[560px]">
                        <ReportExportToolbar
                          disabled={!isReady}
                          isBusy={exportActions.isBusy}
                          isEditing={isEditing}
                          onAction={exportActions}
                          onToggleEditing={() => setIsEditing((current) => !current)}
                          onToggleReview={() =>
                            onMarkReviewed(reviewStatus === "reviewed" ? "draft" : "reviewed")
                          }
                          reviewActionDisabled={false}
                          reviewActionLabel={
                            reviewStatus === "reviewed" ? t("report:review.markDraft") : t("report:review.markReviewed")
                          }
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-[11px]">
                      {generatedAt ? (
                        <MetaPill>
                          <Clock3 size={12} />
                          {formatDateTime(generatedAt, language)}
                        </MetaPill>
                      ) : null}
                      {generationMeta?.attempts ? (
                        <MetaPill>{t("report:metaAttempt", { attempts: generationMeta.attempts })}</MetaPill>
                      ) : null}
                      {sourceLabel ? <MetaPill>{sourceLabel}</MetaPill> : null}
                      {generationMeta?.mode === "mock" ? (
                        <MetaPill tone="warning">{t("report:fallbackNoticeCompact")}</MetaPill>
                      ) : null}
                    </div>
                  </div>
                )}
              </div>

              <div className="xl:hidden" ref={mobileNavRef}>
                <ReportSectionNav
                  activeSectionId={activeSectionId}
                  items={REPORT_SECTION_ITEMS}
                  onSelect={scrollToSection}
                  stickyTop={headerHeight + HEADER_STICKY_TOP_PX + 4}
                  t={t}
                  variant="mobile"
                />
              </div>

              <ReportSection
                icon={SECTION_ICON_MAP.summary}
                isCopied={exportActions.completedAction === "section-summary"}
                isVisible={isSectionVisible("summary")}
                onCopy={() => exportActions.copySection("summary")}
                revealIndex={1}
                sectionId="summary"
                sectionRef={setSectionRef("summary")}
                scrollMarginTop={scrollMarginTop}
                title={t("report:sections.summary")}
                tone="secondary"
              >
                <SummaryEditor
                  isEditingEnabled={isEditing}
                  onDirty={markDirty}
                  onSave={(value) => updateReportSection("summary", value)}
                  report={report}
                />
              </ReportSection>

              <ReportSection
                badge={report.decisions.length}
                collapsible={report.decisions.length > 2}
                defaultOpen
                icon={SECTION_ICON_MAP.decisions}
                isCopied={exportActions.completedAction === "section-decisions"}
                isVisible={isSectionVisible("decisions")}
                onCopy={() => exportActions.copySection("decisions")}
                revealIndex={2}
                sectionId="decisions"
                sectionRef={setSectionRef("decisions")}
                scrollMarginTop={scrollMarginTop}
                title={t("report:sections.decisions")}
                tone="primary"
              >
                <DecisionsEditor
                  isEditingEnabled={isEditing}
                  onChange={(updater) => updateReportSection("decisions", updater)}
                  onDirty={markDirty}
                  report={report}
                />
              </ReportSection>

              <ReportSection
                badge={report.action_items.length}
                collapsible={report.action_items.length > 3}
                defaultOpen
                icon={SECTION_ICON_MAP.actionItems}
                isCopied={exportActions.completedAction === "section-actionItems"}
                isVisible={isSectionVisible("actionItems")}
                onCopy={() => exportActions.copySection("actionItems")}
                revealIndex={3}
                sectionId="actionItems"
                sectionRef={setSectionRef("actionItems")}
                scrollMarginTop={scrollMarginTop}
                title={t("report:sections.actionItems")}
                tone="primary"
              >
                <ActionItemsEditor
                  isEditingEnabled={isEditing}
                  onChange={(updater) => updateReportSection("action_items", updater)}
                  onDirty={markDirty}
                  report={report}
                />
              </ReportSection>

              <ReportSection
                badge={report.risks.length}
                collapsible
                defaultOpen={false}
                icon={SECTION_ICON_MAP.risks}
                isVisible={isSectionVisible("risks")}
                revealIndex={4}
                sectionId="risks"
                sectionRef={setSectionRef("risks")}
                scrollMarginTop={scrollMarginTop}
                title={t("report:sections.risks")}
                tone="warning"
              >
                <div className="space-y-3">
                  {report.risks.length ? (
                    report.risks.map((risk) => (
                      <div key={risk.id} className="rounded-[--radius-panel] border border-slate-200 bg-white p-4">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="mt-0.5 shrink-0 text-[--color-warning]" size={16} />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-[--color-ink]">{risk.risk}</p>
                            <p className="mt-1.5 text-sm text-[--color-muted]">{risk.impact}</p>
                            <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                              <MetaPill>{risk.owner}</MetaPill>
                              <MetaPill>{risk.mitigation}</MetaPill>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-[--color-muted]">{t("report:empty.risks")}</p>
                  )}
                </div>
              </ReportSection>

              <div className="grid gap-5 xl:grid-cols-2">
                <ReportSection
                  badge={report.open_questions.length}
                  collapsible
                  defaultOpen={false}
                  icon={SECTION_ICON_MAP.openQuestions}
                  isVisible={isSectionVisible("openQuestions")}
                  revealIndex={5}
                  sectionId="openQuestions"
                  sectionRef={setSectionRef("openQuestions")}
                  scrollMarginTop={scrollMarginTop}
                  title={t("report:sections.openQuestions")}
                >
                  <div className="space-y-3">
                    {report.open_questions.length ? (
                      report.open_questions.map((question) => (
                        <article key={question.id} className="rounded-[--radius-panel] border border-slate-200 bg-white p-4">
                          <p className="text-sm font-semibold text-[--color-ink]">{question.question}</p>
                          <p className="mt-2 text-sm text-[--color-muted]">
                            {question.notes || t("report:empty.questionNotes")}
                          </p>
                          <div className="mt-3">
                            <MetaPill>{question.owner}</MetaPill>
                          </div>
                        </article>
                      ))
                    ) : (
                      <p className="text-sm text-[--color-muted]">{t("report:empty.openQuestions")}</p>
                    )}
                  </div>
                </ReportSection>

                <ReportSection
                  badge={report.next_steps.length}
                  collapsible={report.next_steps.length > 4}
                  defaultOpen
                  icon={SECTION_ICON_MAP.nextSteps}
                  isCopied={exportActions.completedAction === "section-nextSteps"}
                  isVisible={isSectionVisible("nextSteps")}
                  onCopy={() => exportActions.copySection("nextSteps")}
                  revealIndex={6}
                  sectionId="nextSteps"
                  sectionRef={setSectionRef("nextSteps")}
                  scrollMarginTop={scrollMarginTop}
                  title={t("report:sections.nextSteps")}
                  tone="primary"
                >
                  <ul className="space-y-3 text-sm text-[--color-ink]">
                    {report.next_steps.length ? (
                      report.next_steps.map((step) => (
                        <li key={step} className="flex gap-3 rounded-[--radius-panel] border border-slate-200 bg-white p-4">
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
            </div>
          </div>
        ) : null}
      </section>

      <ToastFeedback feedback={exportActions.feedback} />
    </>
  );
}
