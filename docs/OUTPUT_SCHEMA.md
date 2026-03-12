# OUTPUT_SCHEMA.md

# Meeting Brain — Output Schema

## Purpose

This document defines the **standard structured output** that Meeting Brain should generate from meeting notes, transcripts, or uploaded documents.

The goal of this schema is to make AI output:

- predictable
- easy to render in the UI
- easy to export
- easy to transform into PDF, Markdown, email, and Jira-style tasks

This schema should be treated as the **single source of truth** for AI-generated meeting analysis output.

---

## Output Principles

The AI output should follow these principles:

1. Do not invent facts.
2. Only extract information supported by the input.
3. If something is unclear, mark it as unclear.
4. Prefer structured data over long prose.
5. Keep summaries concise and actionable.
6. Action items should be specific whenever possible.

---

## Standard Output Structure

```json
{
  "meeting_title": "",
  "meeting_type": "",
  "source_type": "",
  "generated_at": "",
  "summary": "",
  "decisions": [],
  "action_items": [],
  "risks": [],
  "open_questions": [],
  "next_steps": [],
  "stakeholders": [],
  "jira_tasks": []
}
```

---

## Field Definitions

### meeting_title

**Type:** string

Human-readable meeting title.

Example:

```json
"meeting_title": "Infrastructure Rollout Coordination Meeting"
```

If no title is clearly available, generate a short descriptive title based on context.

---

### meeting_type

**Type:** string

Describes the meeting category.

Suggested values:

- project_status
- sprint_planning
- vendor_coordination
- technical_review
- implementation_sync
- stakeholder_update
- general

Example:

```json
"meeting_type": "vendor_coordination"
```

---

### source_type

**Type:** string

Describes the input source.

Suggested values:

- pasted_notes
- transcript
- pdf_upload
- doc_upload
- docx_upload
- txt_upload
- md_upload
- example

Example:

```json
"source_type": "pdf_upload"
```

---

### generated_at

**Type:** string

ISO timestamp representing when the structured output was generated.

Example:

```json
"generated_at": "2026-03-11T14:30:00Z"
```

---

### summary

**Type:** string

A short plain-language summary of the meeting.

Rules:

- 2–5 sentences
- focus on key outcomes
- avoid unnecessary technical detail
- understandable to non-technical stakeholders

Example:

```json
"summary": "The team reviewed the rollout timeline for the infrastructure upgrade and agreed to delay deployment by one week due to vendor-side readiness issues. Several follow-up tasks were assigned to engineering and procurement. Budget impact remains under review."
```

---

### decisions

**Type:** array of objects

Each decision represents a clear conclusion or agreement made during the meeting.

Structure:

```json
{
  "id": "",
  "decision": "",
  "reasoning": "",
  "owner": "",
  "confidence": "high"
}
```

Field descriptions:

- id — unique identifier
- decision — the decision made
- reasoning — short explanation
- owner — responsible person/team
- confidence — high / medium / low

Example:

```json
{
  "id": "DEC-001",
  "decision": "Deployment will be postponed by one week.",
  "reasoning": "Vendor hardware will not arrive on the originally planned date.",
  "owner": "Project Lead",
  "confidence": "high"
}
```

---

### action_items

**Type:** array of objects

Each action item represents a concrete task.

Structure:

```json
{
  "id": "",
  "task": "",
  "owner": "",
  "deadline": "",
  "priority": "",
  "status": "open",
  "notes": ""
}
```

Field descriptions:

- id — unique identifier
- task — task description
- owner — responsible person/team
- deadline — due date
- priority — high / medium / low / unclear
- status — open
- notes — optional context

Example:

```json
{
  "id": "ACT-001",
  "task": "Confirm revised delivery date with the hardware vendor.",
  "owner": "Ana",
  "deadline": "2026-03-14",
  "priority": "high",
  "status": "open",
  "notes": "Required before finalizing deployment schedule."
}
```

---

### risks

**Type:** array of objects

Captures risks, blockers, or uncertainties.

Structure:

```json
{
  "id": "",
  "risk": "",
  "impact": "",
  "mitigation": "",
  "owner": ""
}
```

Example:

```json
{
  "id": "RSK-001",
  "risk": "Vendor delivery delay may push deployment timeline.",
  "impact": "Project launch could slip into the following week.",
  "mitigation": "Track vendor confirmation and prepare fallback schedule.",
  "owner": "Procurement Team"
}
```

---

### open_questions

**Type:** array of objects

Unresolved questions requiring follow-up.

Structure:

```json
{
  "id": "",
  "question": "",
  "owner": "",
  "notes": ""
}
```

Example:

```json
{
  "id": "Q-001",
  "question": "Will the budget increase require additional management approval?",
  "owner": "Finance",
  "notes": "Not resolved during this meeting."
}
```

---

### next_steps

**Type:** array of strings

High-level next steps derived from meeting conclusions.

Example:

```json
"next_steps": [
  "Confirm vendor delivery timeline.",
  "Update deployment plan.",
  "Prepare stakeholder communication."
]
```

---

### stakeholders

**Type:** array of objects

People or teams involved in the meeting.

Structure:

```json
{
  "name": "",
  "role": "",
  "involvement": ""
}
```

Example:

```json
{
  "name": "Ana",
  "role": "Project Coordinator",
  "involvement": "Owns vendor communication follow-up"
}
```

---

### jira_tasks

**Type:** array of objects

Simplified Jira-style tasks derived from action items.

Structure:

```json
{
  "title": "",
  "description": "",
  "assignee": "",
  "due_date": "",
  "priority": "",
  "labels": []
}
```

Example:

```json
{
  "title": "Confirm revised hardware delivery date",
  "description": "Contact the vendor and confirm the updated shipment timeline.",
  "assignee": "Ana",
  "due_date": "2026-03-14",
  "priority": "High",
  "labels": ["vendor", "deployment", "follow-up"]
}
```

---

## Empty / Unclear Value Rules

If a field cannot be reliably extracted:

Use `"Unclear"` for string values.

Example:

```json
"owner": "Unclear"
```

Use empty arrays when no items exist:

```json
"risks": []
```

The AI should **never fabricate names, dates, or responsibilities**.

---

## Mapping to Product Outputs

This schema powers all product outputs.

Structured Report uses:

- summary
- decisions
- action_items
- risks
- open_questions
- next_steps

Visual Overview uses:

- decisions
- action_items
- stakeholders
- risks

Markdown Export uses the full schema.

PDF Export uses the full schema.

Email Output uses:

- meeting_title
- summary
- action_items
- next_steps

Jira Export uses:

- jira_tasks

---

## Minimal Required Fields for MVP

If the AI cannot populate every field, the following minimum output is required:

```json
{
  "meeting_title": "",
  "summary": "",
  "decisions": [],
  "action_items": [],
  "risks": [],
  "open_questions": [],
  "next_steps": []
}
```

---

## Example Full Output

```json
{
  "meeting_title": "Infrastructure Rollout Coordination Meeting",
  "meeting_type": "implementation_sync",
  "source_type": "pdf_upload",
  "generated_at": "2026-03-11T14:30:00Z",
  "summary": "The team reviewed the infrastructure rollout plan and agreed to postpone deployment by one week due to delayed vendor delivery. Follow-up actions were assigned to procurement and engineering.",
  "decisions": [
    {
      "id": "DEC-001",
      "decision": "Deployment will be postponed by one week.",
      "reasoning": "Vendor hardware delivery is delayed.",
      "owner": "Project Lead",
      "confidence": "high"
    }
  ],
  "action_items": [
    {
      "id": "ACT-001",
      "task": "Confirm revised hardware delivery date with vendor.",
      "owner": "Ana",
      "deadline": "2026-03-14",
      "priority": "high",
      "status": "open",
      "notes": "Needed to finalize rollout schedule."
    }
  ],
  "risks": [
    {
      "id": "RSK-001",
      "risk": "Vendor delay may impact rollout timeline.",
      "impact": "Project launch could slip further.",
      "mitigation": "Track vendor confirmation.",
      "owner": "Procurement Team"
    }
  ],
  "open_questions": [
    {
      "id": "Q-001",
      "question": "Will the revised timeline affect stakeholder communication?",
      "owner": "Communications Team",
      "notes": "Needs confirmation."
    }
  ],
  "next_steps": [
    "Confirm vendor timeline.",
    "Update rollout plan.",
    "Prepare stakeholder communication."
  ],
  "stakeholders": [
    {
      "name": "Ana",
      "role": "Project Coordinator",
      "involvement": "Vendor communication"
    }
  ],
  "jira_tasks": [
    {
      "title": "Confirm revised hardware delivery date",
      "description": "Contact vendor and confirm updated delivery timeline.",
      "assignee": "Ana",
      "due_date": "2026-03-14",
      "priority": "High",
      "labels": ["vendor", "deployment"]
    }
  ]
}
```
