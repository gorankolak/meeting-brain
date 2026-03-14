import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  CheckCircle2,
  ChevronDown,
  Copy,
  FileText,
  HelpCircle,
  ListTodo,
  Loader2,
  Pencil,
  Plus,
  RotateCcw,
  Save,
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

const SECTION_REVEAL_DELAY_MS = 150;
const SECTION_SCROLL_OFFSET_PX = 24;
const REPORT_SECTION_ITEMS = [
  { id: "summary", titleKey: "report:sections.summary" },
  { id: "decisions", titleKey: "report:sections.decisions" },
  { id: "actionItems", titleKey: "report:sections.actionItems" },
  { id: "risks", titleKey: "report:sections.risks" },
  { id: "openQuestions", titleKey: "report:sections.openQuestions" },
  { id: "nextSteps", titleKey: "report:sections.nextSteps" }
];
const INPUT_CLASSNAME =
  "w-full rounded-[--radius-button] border border-[--color-border] bg-white px-3 py-2 text-sm text-[--color-ink] outline-none transition focus:border-[--color-accent] focus:shadow-[0_0_0_4px_rgba(23,200,227,0.12)]";
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
    <div className="mb-5 rounded-[--radius-button] border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-900 transition duration-500">
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
      <div className="rounded-[--radius-button] border border-[--color-border] bg-white p-4">
        <div className="flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-[--color-muted]">
          <span>{t(`report:progress.${progress.currentStage}`)}</span>
          <span>{progress.percent}%</span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-200">
          <div
            className="h-full rounded-full bg-[--color-accent] transition-[width] duration-500"
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

function OwnerBadge({ owner }) {
  return (
    <span className="inline-flex items-center rounded-full bg-cyan-100 px-2 py-0.5 text-xs font-semibold text-cyan-800">
      {owner}
    </span>
  );
}

function PriorityBadge({ label, priority }) {
  const tones = {
    high: "bg-red-100 text-red-700",
    medium: "bg-amber-100 text-amber-700",
    low: "bg-surface-200 text-surface-700",
    unclear: "bg-surface-200 text-surface-700"
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${tones[priority]}`}>
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
      <div className={`rounded-[--radius-button] border px-4 py-3 shadow-[var(--shadow-soft)] ${tone}`}>
        <p className="text-sm font-semibold">{feedback.message}</p>
      </div>
    </div>
  );
}

function SectionHeaderButton({ children, icon: Icon, onClick, tone = "ghost" }) {
  return (
    <Button className="min-h-8 px-3 py-1.5 text-xs" onClick={onClick} size="sm" tone={tone}>
      {Icon ? <Icon size={14} /> : null}
      {children}
    </Button>
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
    primary: "bg-white shadow-[0_10px_24px_rgba(15,23,42,0.05)] ring-1 ring-sky-100/80",
    secondary: "bg-white",
    warning: "bg-[#fff8ec] border-[#f5d39a]"
  };

  useEffect(() => {
    setIsOpen(defaultOpen);
  }, [defaultOpen, title]);

  return (
    <section
      id={sectionId}
      ref={sectionRef}
      className={`rounded-[--radius-panel] border border-[--color-border] p-4 transition duration-500 ease-out sm:p-5 ${tones[tone]} ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
      }`}
      style={{
        scrollMarginTop: scrollMarginTop ? `${scrollMarginTop}px` : undefined,
        transitionDelay: `${revealIndex * SECTION_REVEAL_DELAY_MS}ms`
      }}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          {Icon ? (
            <span className="flex size-9 items-center justify-center rounded-full bg-surface-100 text-[--color-accent]">
              <Icon size={18} />
            </span>
          ) : null}
          <div className="flex items-center gap-3">
            <h3 className="text-base font-semibold tracking-[0.04em] text-[--color-ink]">{title}</h3>
            {badge !== null ? (
              <span className="rounded-full bg-surface-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[--color-muted]">
                {badge}
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {actions}
          {onCopy ? (
            <SectionHeaderButton icon={Copy} onClick={onCopy}>
              {isCopied ? t("report:actions.copied") : t("report:actions.copy")}
            </SectionHeaderButton>
          ) : null}
          {collapsible ? (
            <button
              aria-expanded={isOpen}
              className="inline-flex items-center gap-2 rounded-full px-2 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[--color-muted] hover:bg-surface-100 hover:text-[--color-ink]"
              onClick={() => setIsOpen((current) => !current)}
              type="button"
            >
              {isOpen ? t("report:actions.hide") : t("report:actions.show")}
              <ChevronDown className={`transition ${isOpen ? "rotate-180" : ""}`} size={16} />
            </button>
          ) : null}
        </div>
      </div>
      {!collapsible || isOpen ? <div className="mt-4">{children}</div> : null}
    </section>
  );
}

function ReportSectionMiniNav({ activeSectionId, items, onSelect, stickyTop, t }) {
  return (
    <div
      className="sticky z-10 -mx-5 mb-6 border-b border-surface-200/80 bg-white/95 px-5 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-7 lg:px-7"
      style={{ top: `${stickyTop}px` }}
    >
      <nav
        aria-label={t("report:generatedReport")}
        className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item) => {
          const isActive = item.id === activeSectionId;

          return (
            <button
              key={item.id}
              className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition ${
                isActive
                  ? "bg-cyan-100 text-cyan-800 shadow-[inset_0_0_0_1px_rgba(8,145,178,0.12)]"
                  : "text-surface-600 hover:bg-surface-100 hover:text-[--color-ink]"
              }`}
              onClick={() => onSelect(item.id)}
              type="button"
            >
              {t(item.titleKey)}
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
          className: "bg-cyan-100 text-cyan-800"
        }
      : hasUnsavedChanges
        ? {
            label: t("report:review.unsavedChanges"),
            className: "bg-amber-100 text-amber-800"
          }
        : {
            label: t("report:review.draft"),
            className: "bg-surface-200 text-surface-700"
          };

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${badge.className}`}>
      {badge.label}
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
            onClick={() => {
              setIsEditing(true);
            }}
            size="sm"
            tone="secondary"
          >
            <Pencil size={16} />
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
            <article key={decision.id} className="rounded-[--radius-button] bg-surface-100 p-3.5">
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
                    <div className="flex flex-wrap gap-2">
                      {isEditingEnabled ? (
                        <>
                          <Button
                            onClick={() => {
                              setEditingId(decision.id);
                              setDraftValue(decision.decision);
                            }}
                            size="sm"
                            tone="ghost"
                          >
                            <Pencil size={14} />
                            {t("report:editor.edit")}
                          </Button>
                          <Button
                            onClick={() => {
                              onChange((current) => current.filter((item) => item.id !== decision.id));
                              onDirty();
                            }}
                            size="sm"
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
                  <p className="mt-3 text-xs uppercase tracking-[0.14em] text-[--color-muted]">
                    {t("report:fields.owner")}: {decision.owner} • {t("report:fields.confidence")}{" "}
                    {t(`report:enums.confidence.${decision.confidence}`)}
                  </p>
                </>
              )}
            </article>
          );
        })
      ) : (
        <p className="text-sm text-[--color-muted]">{t("report:empty.decisions")}</p>
      )}

      {isEditingEnabled ? (
        <div className="rounded-[--radius-button] border border-dashed border-[--color-border] bg-white p-3.5">
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
              className="rounded-[--radius-button] border border-[--color-border] bg-[--color-panel] p-4 transition hover:bg-surface-100"
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
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <p className="text-sm font-semibold text-[--color-ink]">{item.task}</p>
                      <div className="flex flex-wrap gap-2">
                        {isEditingEnabled ? (
                          <>
                            <Button onClick={() => startEditing(item)} size="sm" tone="ghost">
                              <Pencil size={14} />
                              {t("report:editor.edit")}
                            </Button>
                            <Button
                              onClick={() => {
                                onChange((current) => current.filter((currentItem) => currentItem.id !== item.id));
                                onDirty();
                              }}
                              size="sm"
                              tone="ghost"
                            >
                              <Trash2 size={14} />
                              {t("report:editor.delete")}
                            </Button>
                          </>
                        ) : null}
                      </div>
                    </div>
                    <p className="mt-1.5 text-sm text-[--color-muted]">
                      {item.notes || t("report:empty.notes")}
                    </p>
                  </div>
                  <dl className="grid grid-cols-1 gap-3 text-xs uppercase tracking-[0.14em] text-[--color-muted] sm:grid-cols-3 lg:min-w-[320px]">
                    <div>
                      <dt>{t("report:fields.owner")}</dt>
                      <dd className="mt-1">
                        <OwnerBadge owner={item.owner || t("report:editor.unassigned")} />
                      </dd>
                    </div>
                    <div>
                      <dt>{t("report:fields.deadline")}</dt>
                      <dd className="mt-1 text-[11px] font-semibold text-[--color-ink] normal-case tracking-normal">
                        {item.deadline || t("report:empty.deadline")}
                      </dd>
                    </div>
                    <div>
                      <dt>{t("report:fields.priority")}</dt>
                      <dd className="mt-1">
                        <PriorityBadge
                          label={t(`report:enums.priority.${item.priority}`)}
                          priority={item.priority}
                        />
                      </dd>
                    </div>
                  </dl>
                </div>
              )}
            </article>
          );
        })
      ) : (
        <p className="text-sm text-[--color-muted]">{t("report:empty.actionItems")}</p>
      )}

      {isEditingEnabled ? (
        <div className="rounded-[--radius-button] border border-dashed border-[--color-border] bg-white p-4">
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
  isRegenerating,
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
  const [toolbarHeight, setToolbarHeight] = useState(0);
  const [miniNavHeight, setMiniNavHeight] = useState(0);
  const toolbarRef = useRef(null);
  const miniNavRef = useRef(null);
  const sectionRefs = useRef({});
  const sectionObserverRef = useRef(null);
  const scrollMarginTop = toolbarHeight + miniNavHeight + SECTION_SCROLL_OFFSET_PX;

  useEffect(() => {
    if (!isReady || !generatedAt) {
      setShowSuccessBanner(false);
      setRevealedSections([]);
      return undefined;
    }

    setShowSuccessBanner(true);

    const sectionIds = ["toolbar", "summary", "decisions", "actionItems", "risks", "openQuestions", "nextSteps"];
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
  }, [isReady, generatedAt]);

  useEffect(() => {
    if (!isReady) {
      setActiveSectionId(REPORT_SECTION_ITEMS[0].id);
      setToolbarHeight(0);
      setMiniNavHeight(0);
      return undefined;
    }

    if (typeof ResizeObserver === "undefined") {
      setToolbarHeight(toolbarRef.current?.getBoundingClientRect().height || 0);
      setMiniNavHeight(miniNavRef.current?.getBoundingClientRect().height || 0);
      return undefined;
    }

    const resizeObserver = new ResizeObserver(() => {
      setToolbarHeight(toolbarRef.current?.getBoundingClientRect().height || 0);
      setMiniNavHeight(miniNavRef.current?.getBoundingClientRect().height || 0);
    });

    if (toolbarRef.current) {
      resizeObserver.observe(toolbarRef.current);
    }

    if (miniNavRef.current) {
      resizeObserver.observe(miniNavRef.current);
    }

    setToolbarHeight(toolbarRef.current?.getBoundingClientRect().height || 0);
    setMiniNavHeight(miniNavRef.current?.getBoundingClientRect().height || 0);

    return () => {
      resizeObserver.disconnect();
    };
  }, [isReady]);

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
        rootMargin: `-${toolbarHeight + miniNavHeight + 12}px 0px -55% 0px`,
        threshold: [0.2, 0.35, 0.5, 0.65]
      }
    );

    sections.forEach((section) => observer.observe(section));
    sectionObserverRef.current = observer;

    return () => {
      observer.disconnect();
      sectionObserverRef.current = null;
    };
  }, [isReady, toolbarHeight, miniNavHeight, generatedAt]);

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
    section.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }

  return (
    <>
      <section className="rounded-[--radius-panel] border border-white/80 bg-white/92 p-5 shadow-[var(--shadow-card)] backdrop-blur-xl sm:p-6 lg:p-7">
        <SuccessBanner report={report} t={t} visible={showSuccessBanner} />

        {isReady ? (
          <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
            <span className="inline-flex items-center gap-2 font-medium text-[--color-accent]">
              <CheckCircle2 size={16} />
              <span>{t("report:status.generated")}</span>
            </span>
            <ReviewStatusBadge hasUnsavedChanges={hasUnsavedChanges} reviewStatus={reviewStatus} t={t} />
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
                        ? "common:generationMode.simulation"
                        : "common:generationMode.llm"
                    ),
                    timestamp: formatDateTime(generationMeta.generatedAt, language),
                    attempts: generationMeta.attempts
                  })
                : t("common:states.readyToAnalyze")}
            </p>
            {generatedAt || sourceLabel ? (
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
              {isRegenerating ? <Loader2 className="animate-spin" size={16} /> : <RotateCcw size={16} />}
              {t("report:actions.regenerate")}
            </Button>
          </div>
        </div>

        <div className="mt-6 space-y-5">
          {generationError && status === "error" ? <ErrorBanner>{generationError}</ErrorBanner> : null}

          {!isReady ? renderState() : null}

          {isReady ? (
            <>
              <div
                ref={toolbarRef}
                className={`sticky top-0 z-10 -mx-5 mb-6 border-b border-surface-200 bg-white/90 px-5 py-4 backdrop-blur transition duration-500 ease-out sm:-mx-6 sm:px-6 lg:-mx-7 lg:px-7 ${
                  isSectionVisible("toolbar") ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
                }`}
                style={{ transitionDelay: "0ms" }}
              >
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1 lg:flex-row lg:items-center lg:justify-between">
                    <p className="text-sm text-[--color-muted]">{t("export:toolbarBody")}</p>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[--color-muted]">
                      {isEditing ? t("report:editor.editing") : t("report:editor.readOnly")}
                    </p>
                  </div>
                  <ReportExportToolbar
                    disabled={!isReady}
                    isBusy={exportActions.isBusy}
                    isEditing={isEditing}
                    onAction={exportActions}
                    onToggleEditing={() => setIsEditing((current) => !current)}
                    onToggleReview={() =>
                      onMarkReviewed(reviewStatus === "reviewed" ? "draft" : "reviewed")
                    }
                    reviewActionLabel={
                      reviewStatus === "reviewed" ? t("report:review.markDraft") : t("report:review.markReviewed")
                    }
                    reviewActionTone={reviewStatus === "reviewed" ? "secondary" : "primary"}
                    statusBadge={
                      <ReviewStatusBadge
                        hasUnsavedChanges={hasUnsavedChanges}
                        reviewStatus={reviewStatus}
                        t={t}
                      />
                    }
                  />
                </div>
              </div>

              <div ref={miniNavRef}>
                <ReportSectionMiniNav
                  activeSectionId={activeSectionId}
                  items={REPORT_SECTION_ITEMS}
                  onSelect={scrollToSection}
                  stickyTop={toolbarHeight}
                  t={t}
                />
              </div>

              <ReportSection
                icon={FileText}
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
                icon={CheckCircle}
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
                icon={ListTodo}
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
                icon={AlertTriangle}
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
                      <div key={risk.id} className="rounded-[--radius-button] border border-[#f2d393] bg-white/70 p-3.5">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="mt-0.5 shrink-0 text-[--color-warning]" size={16} />
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

              <div className="grid gap-5 xl:grid-cols-2">
                <ReportSection
                  badge={report.open_questions.length}
                  collapsible
                  defaultOpen={false}
                  icon={HelpCircle}
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
                        <article key={question.id} className="rounded-[--radius-button] bg-surface-100 p-3.5">
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

                <ReportSection
                  badge={report.next_steps.length}
                  collapsible={report.next_steps.length > 4}
                  defaultOpen
                  icon={ArrowRight}
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
                        <li key={step} className="flex gap-3 rounded-[--radius-button] bg-surface-100 p-3.5">
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
            </>
          ) : null}
        </div>
      </section>

      <ToastFeedback feedback={exportActions.feedback} />
    </>
  );
}
