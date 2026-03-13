import { formatDateTime } from "./locale";

function buildSectionBlock(title, lines) {
  return [title, "-".repeat(title.length), ...lines].join("\n");
}

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

export function formatReportAsText(report, t, language) {
  const lines = [
    report.meeting_title,
    "=".repeat(report.meeting_title.length),
    "",
    `${t("report:fields.generated")}: ${formatDateTime(report.generated_at, language)}`,
    "",
    `${t("report:sections.summary")}`,
    "-".repeat(t("report:sections.summary").length),
    report.summary,
    "",
    `${t("report:sections.decisions")}`,
    "-".repeat(t("report:sections.decisions").length),
    ...(report.decisions.length
      ? report.decisions.flatMap((item) => [
          `• ${item.decision}`,
          `  ${t("report:fields.owner")}: ${item.owner}`,
          `  ${t("report:fields.confidence")}: ${t(`report:enums.confidence.${item.confidence}`)}`,
          `  ${item.reasoning}`,
          ""
        ])
      : [t("report:empty.decisions"), ""]),
    `${t("report:sections.actionItems")}`,
    "-".repeat(t("report:sections.actionItems").length),
    ...(report.action_items.length
      ? report.action_items.flatMap((item) => [
          `• ${item.task}`,
          `  ${t("report:fields.owner")}: ${item.owner}`,
          `  ${t("report:fields.deadline")}: ${item.deadline || t("report:empty.deadline")}`,
          `  ${t("report:fields.priority")}: ${t(`report:enums.priority.${item.priority}`)}`,
          `  ${item.notes || t("report:empty.notes")}`,
          ""
        ])
      : [t("report:empty.actionItems"), ""]),
    `${t("report:sections.risks")}`,
    "-".repeat(t("report:sections.risks").length),
    ...(report.risks.length
      ? report.risks.flatMap((item) => [
          `• ${item.risk}`,
          `  ${item.impact}`,
          `  ${t("report:fields.owner")}: ${item.owner}`,
          `  ${t("report:fields.mitigation")}: ${item.mitigation}`,
          ""
        ])
      : [t("report:empty.risks"), ""]),
    `${t("report:sections.openQuestions")}`,
    "-".repeat(t("report:sections.openQuestions").length),
    ...(report.open_questions.length
      ? report.open_questions.flatMap((item) => [
          `• ${item.question}`,
          `  ${t("report:fields.owner")}: ${item.owner}`,
          `  ${item.notes || t("report:empty.questionNotes")}`,
          ""
        ])
      : [t("report:empty.openQuestions"), ""]),
    `${t("report:sections.nextSteps")}`,
    "-".repeat(t("report:sections.nextSteps").length),
    ...(report.next_steps.length
      ? report.next_steps.map((item) => `• ${item}`)
      : [t("report:empty.nextSteps")])
  ];

  return lines.join("\n");
}

export function formatSectionAsText(sectionId, report, t, language) {
  const sectionTitle = t(`report:sections.${sectionId}`);

  const sectionLines = {
    summary: [report.summary],
    decisions: report.decisions.length
      ? report.decisions.flatMap((item) => [
          `• ${item.decision}`,
          `  ${t("report:fields.owner")}: ${item.owner}`,
          `  ${t("report:fields.confidence")}: ${t(`report:enums.confidence.${item.confidence}`)}`,
          `  ${item.reasoning}`,
          ""
        ])
      : [t("report:empty.decisions")],
    nextSteps: report.next_steps.length
      ? report.next_steps.map((item) => `• ${item}`)
      : [t("report:empty.nextSteps")],
    actionItems: report.action_items.length
      ? report.action_items.flatMap((item) => [
          `• ${item.task}`,
          `  ${t("report:fields.owner")}: ${item.owner}`,
          `  ${t("report:fields.deadline")}: ${item.deadline || t("report:empty.deadline")}`,
          `  ${t("report:fields.priority")}: ${t(`report:enums.priority.${item.priority}`)}`,
          `  ${item.notes || t("report:empty.notes")}`,
          ""
        ])
      : [t("report:empty.actionItems")]
  }[sectionId];

  return [
    report.meeting_title,
    `${t("report:fields.generated")}: ${formatDateTime(report.generated_at, language)}`,
    "",
    buildSectionBlock(sectionTitle, sectionLines || [])
  ].join("\n");
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
