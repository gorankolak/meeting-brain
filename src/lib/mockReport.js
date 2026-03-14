function toIsoDate(daysFromNow) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().slice(0, 10);
}

export function createMockReport({ meetingTitle, sourceType }) {
  const generatedAt = new Date().toISOString();
  const title = meetingTitle || "Q2 Launch Readiness Sync";

  return {
    meeting_title: title,
    meeting_type: "project_sync",
    source_type: sourceType || "pasted_notes",
    generated_at: generatedAt,
    summary:
      "The team aligned on the launch readiness plan, agreed to keep the current release date pending QA completion, and identified analytics validation plus legal review as the main open dependencies before rollout.",
    decisions: [
      {
        id: "decision-1",
        decision: "Keep the customer beta launch targeted for next Thursday.",
        reasoning: "Engineering confirmed the core scope is stable and the remaining work is concentrated in QA and analytics verification.",
        owner: "Mia",
        confidence: "high"
      },
      {
        id: "decision-2",
        decision: "Route support documentation through product marketing before publishing.",
        reasoning: "The team wants one approval pass to keep onboarding and release messaging consistent.",
        owner: "Ana",
        confidence: "medium"
      }
    ],
    action_items: [
      {
        id: "action-1",
        task: "Finish regression testing for the invite flow and confirm no blocking defects remain.",
        owner: "Luka",
        deadline: toIsoDate(2),
        priority: "high",
        status: "open",
        notes: "QA should publish a short sign-off note in Slack after the final pass."
      },
      {
        id: "action-2",
        task: "Validate event tracking in staging for signup, invite acceptance, and first project creation.",
        owner: "Ana",
        deadline: toIsoDate(3),
        priority: "high",
        status: "open",
        notes: "Analytics events need to match the dashboard definitions used for launch reporting."
      },
      {
        id: "action-3",
        task: "Prepare the customer-facing launch email draft for final legal review.",
        owner: "Petra",
        deadline: toIsoDate(4),
        priority: "medium",
        status: "open",
        notes: "Reuse the approved messaging from the onboarding update sent last month."
      },
      {
        id: "action-4",
        task: "Create a rollback checklist for the first 24 hours after launch.",
        owner: "Marko",
        deadline: toIsoDate(5),
        priority: "low",
        status: "open",
        notes: "Include owners, alert thresholds, and the exact steps for disabling access if needed."
      }
    ],
    risks: [
      {
        id: "risk-1",
        risk: "Incomplete analytics coverage could make the beta launch hard to evaluate.",
        impact: "The team may ship without reliable activation and retention signals for the first cohort.",
        mitigation: "Complete staging verification before launch and add a manual QA checklist for key events.",
        owner: "Ana"
      }
    ],
    open_questions: [
      {
        id: "question-1",
        question: "Should enterprise accounts be included in the first beta wave or staged a week later?",
        owner: "Mia",
        notes: "Decision depends on support capacity and whether SSO edge cases are closed."
      }
    ],
    next_steps: [
      "Review QA sign-off in the Wednesday launch standup.",
      "Confirm analytics coverage and circulate the dashboard link to stakeholders.",
      "Finalize customer communications after legal approval.",
      "Run the launch checklist one day before release."
    ],
    stakeholders: [
      {
        name: "Mia",
        role: "Product Lead",
        involvement: "Owns launch scope and final go/no-go decision."
      },
      {
        name: "Ana",
        role: "Data Analyst",
        involvement: "Verifies launch instrumentation and reporting."
      },
      {
        name: "Luka",
        role: "QA Lead",
        involvement: "Signs off release quality and regression coverage."
      }
    ],
    jira_tasks: [
      {
        title: "Regression test invite flow",
        description: "Complete final QA regression and record sign-off.",
        assignee: "Luka",
        due_date: toIsoDate(2),
        priority: "High",
        labels: ["launch", "qa"]
      },
      {
        title: "Validate launch analytics events",
        description: "Check staging events against dashboard requirements.",
        assignee: "Ana",
        due_date: toIsoDate(3),
        priority: "High",
        labels: ["launch", "analytics"]
      },
      {
        title: "Draft launch rollback checklist",
        description: "Document rollback owners, triggers, and steps.",
        assignee: "Marko",
        due_date: toIsoDate(5),
        priority: "Medium",
        labels: ["launch", "ops"]
      }
    ]
  };
}
