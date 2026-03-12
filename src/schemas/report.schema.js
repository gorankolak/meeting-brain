import { z } from "zod";

const decisionSchema = z.object({
  id: z.string(),
  decision: z.string(),
  reasoning: z.string(),
  owner: z.string(),
  confidence: z.enum(["high", "medium", "low"])
});

const actionItemSchema = z.object({
  id: z.string(),
  task: z.string(),
  owner: z.string(),
  deadline: z.string(),
  priority: z.enum(["high", "medium", "low", "unclear"]),
  status: z.literal("open"),
  notes: z.string()
});

const riskSchema = z.object({
  id: z.string(),
  risk: z.string(),
  impact: z.string(),
  mitigation: z.string(),
  owner: z.string()
});

const questionSchema = z.object({
  id: z.string(),
  question: z.string(),
  owner: z.string(),
  notes: z.string()
});

const stakeholderSchema = z.object({
  name: z.string(),
  role: z.string(),
  involvement: z.string()
});

const jiraTaskSchema = z.object({
  title: z.string(),
  description: z.string(),
  assignee: z.string(),
  due_date: z.string(),
  priority: z.string(),
  labels: z.array(z.string())
});

export const meetingReportSchema = z.object({
  meeting_title: z.string(),
  meeting_type: z.string(),
  source_type: z.string(),
  generated_at: z.string(),
  summary: z.string(),
  decisions: z.array(decisionSchema),
  action_items: z.array(actionItemSchema),
  risks: z.array(riskSchema),
  open_questions: z.array(questionSchema),
  next_steps: z.array(z.string()),
  stakeholders: z.array(stakeholderSchema),
  jira_tasks: z.array(jiraTaskSchema)
});
