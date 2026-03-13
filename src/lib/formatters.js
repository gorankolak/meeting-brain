import { formatDateTime } from "./locale";

export function formatReportAsMarkdown(report, t, language) {
  const lines = [
    `# ${report.meeting_title}`,
    "",
    `${t("report:fields.generated")}: ${formatDateTime(report.generated_at, language)}`,
    "",
    `## ${t("report:sections.summary")}`,
    report.summary,
    "",
    `## ${t("report:sections.decisions")}`,
    ...(report.decisions.length
      ? report.decisions.map(
          (item) =>
            `- ${item.decision} (${t("report:fields.owner")}: ${item.owner}, ${t("report:fields.confidence")}: ${t(`report:enums.confidence.${item.confidence}`)})`
        )
      : [`- ${t("report:empty.decisions")}`]),
    "",
    `## ${t("report:sections.actionItems")}`,
    ...(report.action_items.length
      ? report.action_items.map(
          (item) =>
            `- ${item.task} | ${t("report:fields.owner")}: ${item.owner} | ${t("report:fields.deadline")}: ${item.deadline || t("report:empty.deadline")}`
        )
      : [`- ${t("report:empty.actionItems")}`]),
    "",
    `## ${t("report:sections.risks")}`,
    ...(report.risks.length ? report.risks.map((item) => `- ${item.risk}`) : [`- ${t("report:empty.risks")}`]),
    "",
    `## ${t("report:sections.openQuestions")}`,
    ...(report.open_questions.length
      ? report.open_questions.map((item) => `- ${item.question}`)
      : [`- ${t("report:empty.openQuestions")}`]),
    "",
    `## ${t("report:sections.nextSteps")}`,
    ...(report.next_steps.length
      ? report.next_steps.map((item) => `- ${item}`)
      : [`- ${t("report:empty.nextSteps")}`])
  ];

  return lines.join("\n");
}

export function formatReportAsEmailHtml(report, t) {
  return `
    <h1>${report.meeting_title}</h1>
    <p>${report.summary}</p>
    <h2>${t("report:sections.actionItems")}</h2>
    <ul>${report.action_items.map((item) => `<li>${item.task} - ${item.owner}</li>`).join("")}</ul>
    <h2>${t("report:sections.nextSteps")}</h2>
    <ul>${report.next_steps.map((item) => `<li>${item}</li>`).join("")}</ul>
  `;
}
