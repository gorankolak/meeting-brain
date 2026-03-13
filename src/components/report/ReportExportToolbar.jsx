import {
  ClipboardList,
  Copy,
  FileDown,
  FileJson,
  FileSpreadsheet,
  FileText,
  LoaderCircle
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "../ui/Button";

function ToolbarButton({ actionId, children, disabled, icon: Icon, isBusy, onClick }) {
  const { t } = useTranslation("export");

  return (
    <Button
      aria-label={t(`export:buttons.${actionId}`)}
      className="w-full sm:w-auto"
      disabled={disabled || isBusy}
      onClick={onClick}
      tone="ghost"
    >
      {isBusy ? <LoaderCircle className="animate-spin" size={16} /> : <Icon size={16} />}
      {children}
    </Button>
  );
}

export function ReportExportToolbar({ disabled, isBusy, onAction }) {
  const { t } = useTranslation("export");

  return (
    <div aria-label={t("export:toolbarLabel")} className="flex flex-wrap gap-2" role="toolbar">
      <ToolbarButton
        actionId="copyReport"
        disabled={disabled}
        icon={Copy}
        isBusy={isBusy("copy")}
        onClick={() => onAction.copyReport()}
      >
        {t("export:buttons.copyReport")}
      </ToolbarButton>
      <ToolbarButton
        actionId="downloadMarkdown"
        disabled={disabled}
        icon={FileText}
        isBusy={isBusy("markdown")}
        onClick={() => onAction.downloadMarkdown()}
      >
        {t("export:buttons.downloadMarkdown")}
      </ToolbarButton>
      <ToolbarButton
        actionId="downloadText"
        disabled={disabled}
        icon={FileText}
        isBusy={isBusy("text")}
        onClick={() => onAction.downloadText()}
      >
        {t("export:buttons.downloadText")}
      </ToolbarButton>
      <ToolbarButton
        actionId="downloadJson"
        disabled={disabled}
        icon={FileJson}
        isBusy={isBusy("json")}
        onClick={() => onAction.downloadJson()}
      >
        {t("export:buttons.downloadJson")}
      </ToolbarButton>
      <ToolbarButton
        actionId="downloadPdf"
        disabled={disabled}
        icon={FileDown}
        isBusy={isBusy("pdf")}
        onClick={() => onAction.downloadPdf()}
      >
        {t("export:buttons.downloadPdf")}
      </ToolbarButton>
      <ToolbarButton
        actionId="downloadJiraCsv"
        disabled={disabled}
        icon={FileSpreadsheet}
        isBusy={isBusy("jiraCsv")}
        onClick={() => onAction.downloadJiraCsv()}
      >
        {t("export:buttons.downloadJiraCsv")}
      </ToolbarButton>
      <ToolbarButton
        actionId="copyJiraTasks"
        disabled={disabled}
        icon={ClipboardList}
        isBusy={isBusy("jiraCopy")}
        onClick={() => onAction.copyJiraTasks()}
      >
        {t("export:buttons.copyJiraTasks")}
      </ToolbarButton>
    </div>
  );
}
