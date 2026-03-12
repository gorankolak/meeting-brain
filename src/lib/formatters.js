export function formatReportAsMarkdown(report) {
  const lines = [
    `# ${report.meeting_title}`,
    "",
    `Generated: ${report.generated_at}`,
    "",
    "## Summary",
    report.summary,
    "",
    "## Decisions",
    ...(report.decisions.length
      ? report.decisions.map((item) => `- ${item.decision} (${item.owner}, confidence ${item.confidence})`)
      : ["- None"]),
    "",
    "## Action Items",
    ...(report.action_items.length
      ? report.action_items.map(
          (item) => `- ${item.task} | Owner: ${item.owner} | Deadline: ${item.deadline || "Unclear"}`
        )
      : ["- None"]),
    "",
    "## Risks",
    ...(report.risks.length ? report.risks.map((item) => `- ${item.risk}`) : ["- None"]),
    "",
    "## Open Questions",
    ...(report.open_questions.length
      ? report.open_questions.map((item) => `- ${item.question}`)
      : ["- None"]),
    "",
    "## Next Steps",
    ...(report.next_steps.length ? report.next_steps.map((item) => `- ${item}`) : ["- None"])
  ];

  return lines.join("\n");
}

export function formatReportAsEmailHtml(report) {
  return `
    <h1>${report.meeting_title}</h1>
    <p>${report.summary}</p>
    <h2>Action Items</h2>
    <ul>${report.action_items.map((item) => `<li>${item.task} - ${item.owner}</li>`).join("")}</ul>
    <h2>Next Steps</h2>
    <ul>${report.next_steps.map((item) => `<li>${item}</li>`).join("")}</ul>
  `;
}
