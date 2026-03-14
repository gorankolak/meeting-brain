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
  const { t } = useTranslation("export");

  return (
    <Button
      aria-label={t(`export:buttons.${actionId}`)}
      className="w-full justify-center sm:w-auto"
      disabled={disabled || isBusy}
      onClick={onClick}
      size="sm"
      tone={tone}
    >
      {isBusy ? <LoaderCircle className="animate-spin" size={16} /> : <Icon size={16} />}
      {isCopied ? t("export:buttons.copied") : children}
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
  reviewActionLabel,
  reviewActionTone = "secondary",
  statusBadge
}) {
  const { t } = useTranslation("export");

  return (
    <div
      aria-label={t("export:toolbarLabel")}
      className="flex flex-col gap-4"
      role="toolbar"
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {statusBadge}
          <Button
            disabled={disabled || reviewActionDisabled}
            onClick={onToggleReview}
            size="sm"
            tone={reviewActionTone}
          >
            {reviewActionLabel}
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button disabled={disabled} onClick={onToggleEditing} size="sm" tone={isEditing ? "primary" : "secondary"}>
            {isEditing ? <Check size={16} /> : <Pencil size={16} />}
            {isEditing ? t("export:buttons.doneEditing") : t("export:buttons.editReport")}
          </Button>
          <ToolbarButton
            actionId="copyReport"
            disabled={disabled}
            icon={Copy}
            isBusy={isBusy("copy")}
            isCopied={onAction.completedAction === "copy"}
            onClick={() => onAction.copyReport()}
          >
            {t("export:buttons.copyReport")}
          </ToolbarButton>
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
            actionId="exportForJira"
            disabled={disabled}
            icon={FileSpreadsheet}
            isBusy={isBusy("jira")}
            onClick={() => onAction.exportForJira()}
          >
            {t("export:buttons.exportForJira")}
          </ToolbarButton>
        </div>
      </div>
    </div>
  );
}
