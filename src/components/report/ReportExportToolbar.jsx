import {
  Check,
  Copy,
  FileDown,
  FileSpreadsheet,
  LoaderCircle,
  Pencil
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "../ui/Button";

function ToolbarButton({
  actionId,
  children,
  disabled,
  icon: Icon,
  isBusy,
  isCopied = false,
  onClick,
  tone = "secondary"
}) {
  const { t } = useTranslation(["export", "report"]);

  return (
    <Button
      aria-label={t(`export:buttons.${actionId}`)}
      className="min-h-9 w-full justify-center rounded-lg px-3.5 py-2 sm:w-auto"
      disabled={disabled || isBusy}
      onClick={onClick}
      size="sm"
      tone={tone}
    >
      {isBusy ? <LoaderCircle className="animate-spin" size={15} /> : <Icon size={15} />}
      {isCopied ? t("export:buttons.copied") : children}
    </Button>
  );
}

function UtilityButton({ children, disabled, icon: Icon, onClick, pressed = false }) {
  return (
    <Button
      aria-pressed={pressed}
      className={`min-h-8 rounded-lg px-2.5 py-1.5 text-xs font-medium ${pressed ? "border-[--color-accent]/30 bg-cyan-50 text-cyan-800" : ""}`}
      disabled={disabled}
      onClick={onClick}
      size="xs"
      tone="ghost"
    >
      {Icon ? <Icon size={14} /> : null}
      {children}
    </Button>
  );
}

export function ReportExportToolbar({
  compact = false,
  disabled,
  isBusy,
  isEditing,
  onAction,
  onToggleEditing,
  onToggleReview,
  reviewActionDisabled = false,
  reviewActionLabel
}) {
  const { t } = useTranslation(["export", "report"]);

  return (
    <div
      aria-label={t("export:toolbarLabel")}
      className={`flex flex-col ${compact ? "gap-2" : "gap-3"}`}
      role="toolbar"
    >
      <div className={`flex flex-wrap items-center ${compact ? "gap-1.5" : "gap-2"}`}>
        <ToolbarButton
          actionId="downloadPdf"
          disabled={disabled}
          icon={FileDown}
          isBusy={isBusy("pdf")}
          onClick={() => onAction.downloadPdf()}
          tone="primary"
        >
          {t("export:buttons.downloadPdf")}
        </ToolbarButton>
        <ToolbarButton
          actionId="copyReport"
          disabled={disabled}
          icon={Copy}
          isBusy={isBusy("copy")}
          isCopied={onAction.completedAction === "copy"}
          onClick={() => onAction.copyReport()}
          tone={compact ? "ghost" : "secondary"}
        >
          {t("export:buttons.copyReport")}
        </ToolbarButton>
        <ToolbarButton
          actionId="exportForJira"
          disabled={disabled}
          icon={FileSpreadsheet}
          isBusy={isBusy("jira")}
          onClick={() => onAction.exportForJira()}
          tone={compact ? "ghost" : "secondary"}
        >
          {t("export:buttons.exportForJira")}
        </ToolbarButton>
      </div>

      {!compact ? (
        <div className="flex flex-wrap items-center gap-1.5 border-t border-surface-200/80 pt-2">
          <UtilityButton disabled={disabled} icon={isEditing ? Check : Pencil} onClick={onToggleEditing} pressed={isEditing}>
            {isEditing ? t("export:buttons.doneEditing") : t("export:buttons.editReport")}
          </UtilityButton>
          <UtilityButton disabled={disabled || reviewActionDisabled} onClick={onToggleReview}>
            {reviewActionLabel}
          </UtilityButton>
        </div>
      ) : null}
    </div>
  );
}
