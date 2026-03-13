import { formatReportAsMarkdown } from "../../lib/formatters";

export function exportMarkdown(report, options) {
  return formatReportAsMarkdown(report, options.t, options.language);
}
