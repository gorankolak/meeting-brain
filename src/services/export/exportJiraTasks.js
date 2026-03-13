import { z } from "zod";

export const jiraTaskExportSchema = z.object({
  title: z.string(),
  description: z.string(),
  assignee: z.string(),
  priority: z.string(),
  due_date: z.string()
});

function normalizeTask(task) {
  return jiraTaskExportSchema.parse({
    title: task.title || "",
    description: task.description || "",
    assignee: task.assignee || "",
    priority: task.priority || "",
    due_date: task.due_date || ""
  });
}

export function extractTasksFromReport(report, t) {
  const reportTasks = Array.isArray(report.jira_tasks)
    ? report.jira_tasks.map((task) =>
        normalizeTask({
          ...task,
          assignee: task.assignee || t("export:jira.unassigned")
        })
      )
    : [];

  if (reportTasks.length) {
    return reportTasks;
  }

  return report.action_items.map((item) =>
    normalizeTask({
      title: item.task,
      description: item.notes || t("report:empty.notes"),
      assignee: item.owner || t("export:jira.unassigned"),
      priority: t(`report:enums.priority.${item.priority}`),
      due_date: item.deadline || t("report:empty.deadline")
    })
  );
}

function escapeCsv(value) {
  return `"${String(value).replaceAll("\"", "\"\"")}"`;
}

export function exportJiraTasksCsv(report, options) {
  const tasks = extractTasksFromReport(report, options.t);
  const header = ["Title", "Description", "Assignee", "Priority", "Due date"];
  const rows = tasks.map((task) => [
    task.title,
    task.description,
    task.assignee,
    task.priority,
    task.due_date
  ]);

  return [header, ...rows].map((row) => row.map(escapeCsv).join(",")).join("\n");
}

export function exportJiraTasksText(report, options) {
  const tasks = extractTasksFromReport(report, options.t);

  if (!tasks.length) {
    return options.t("report:empty.actionItems");
  }

  return tasks
    .map(
      (task, index) =>
        `${index + 1}. ${task.title}\n${options.t("export:jira.description")}: ${task.description}\n${options.t("export:jira.assignee")}: ${task.assignee}\n${options.t("export:jira.priority")}: ${task.priority}\n${options.t("export:jira.dueDate")}: ${task.due_date}`
    )
    .join("\n\n");
}
