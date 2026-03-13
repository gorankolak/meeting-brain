import {
  Copy,
  FileDown,
  FileSpreadsheet,
  LoaderCircle
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
      className="w-full justify-center"
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

export function ReportExportToolbar({ disabled, isBusy, onAction }) {
  const { t } = useTranslation("export");

  return (
    <div
      aria-label={t("export:toolbarLabel")}
      className="grid gap-2.5 lg:grid-cols-3"
      role="toolbar"
    >
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
  );
}
