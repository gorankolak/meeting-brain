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
      className="min-h-9 w-auto shrink-0 justify-center rounded-md px-3 py-2 whitespace-nowrap"
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
      className={`min-h-8 rounded-md px-2.5 py-1.5 text-xs font-medium ${pressed ? "border-[--color-border] bg-[color-mix(in_srgb,var(--color-primary)_18%,white)] text-[--color-primary-dark]" : ""}`}
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
      className="flex min-w-fit flex-col gap-3 bg-[var(--color-surface)]"
      role="toolbar"
    >
      <div className="flex flex-nowrap items-center justify-start gap-2 sm:justify-end">
        <ToolbarButton
          actionId="downloadPdf"
          disabled={disabled}
          icon={FileDown}
          isBusy={isBusy("pdf")}
          onClick={() => onAction.downloadPdf()}
          tone="accent"
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
          tone="secondary"
        >
          {t("export:buttons.copyReport")}
        </ToolbarButton>
        <ToolbarButton
          actionId="exportForJira"
          disabled={disabled}
          icon={FileSpreadsheet}
          isBusy={isBusy("jira")}
          onClick={() => onAction.exportForJira()}
          tone="secondary"
        >
          {t("export:buttons.exportForJira")}
        </ToolbarButton>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 border-t border-[--color-border] pt-2.5">
        <UtilityButton disabled={disabled} icon={isEditing ? Check : Pencil} onClick={onToggleEditing} pressed={isEditing}>
          {isEditing ? t("export:buttons.doneEditing") : t("export:buttons.editReport")}
        </UtilityButton>
        <UtilityButton disabled={disabled || reviewActionDisabled} onClick={onToggleReview}>
          {reviewActionLabel}
        </UtilityButton>
      </div>
    </div>
  );
}
