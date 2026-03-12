# Meeting Brain

## Problem Statement

Technical project meetings often generate large amounts of unstructured discussion that must later be transformed into structured project documentation.

Project assistants and coordinators frequently need to:

- write meeting minutes
- summarize technical discussions
- extract decisions
- identify action items
- assign responsibilities
- prepare stakeholder updates

This process is repetitive, time-consuming, and error-prone.

Meeting discussions typically contain tangents, unclear responsibilities, and technical jargon that makes summarization difficult. As a result, assistants may spend hours reviewing transcripts or notes after each meeting.

This phenomenon is often referred to as the **“Minutes Monkey” problem**, where assistants repeatedly translate messy meeting discussions into structured documentation.

Reducing this manual effort would significantly improve project coordination efficiency.

---

## Target Audience

### Primary Users

**PMO Assistants / Project Coordinators**

These users assist project managers in organizing and coordinating project work.

Typical responsibilities include:

- preparing meeting documentation
- updating project status reports
- coordinating project communication
- assisting with project documentation
- tracking action items and responsibilities

This aligns closely with roles such as:

- Project Management Office Assistant
- Project Coordinator
- Digital Project Assistant

---

### Secondary Users

Secondary users may also benefit from the tool:

- Junior Project Managers
- Delivery Coordinators
- Technical Program Assistants
- Operations Coordinators

---

### Typical Working Environment

Users commonly work with:

- Microsoft Word documents
- PDF meeting notes
- meeting transcripts
- technical discussions from project meetings

The product must therefore support **common office document formats** such as PDF and DOCX.

---

## Value Proposition

**Meeting Brain converts messy technical meetings into structured project documentation within seconds.**

Instead of manually reviewing meeting notes or transcripts, users can generate structured meeting summaries automatically.

Key benefits include:

- faster meeting documentation
- clearer project coordination
- improved decision tracking
- reduced administrative workload
- easier communication with stakeholders

Meeting Brain helps project assistants move from manual summarization work to higher-value coordination tasks.

---

## MVP Scope

The MVP focuses on a simple workflow where users can input meeting content
(text or uploaded file) and receive a structured meeting summary.

The MVP will primarily consist of a **single-page application**
with an input panel and a structured results panel.

### Inputs

Users can provide meeting content through:

- pasted meeting notes or transcript
- uploaded meeting documents
- example meeting transcripts for quick testing

Supported file formats:

- PDF
- DOC
- DOCX
- TXT
- MD

---

### Processing

The system analyzes meeting content and extracts key project information including:

- meeting summary
- decisions
- action items
- risks or blockers
- open questions
- next steps

---

### Outputs

#### Structured Meeting Report

The generated report contains:

- meeting summary
- decisions
- action items
- risks
- open questions
- next steps

---

#### Visual Overview

Meeting outcomes are displayed visually through:

- decision structure
- task overview
- responsibility grouping

This allows users to quickly understand meeting outcomes.

---

#### Export Options

Users can export results as:

- Markdown
- PDF
- Jira-style task format

---

#### Email Output

Users can send the generated meeting summary via email.

---

## Out of Scope

The MVP intentionally excludes the following features:

- live meeting recording
- audio transcription
- Zoom / Microsoft Teams integrations
- Google Drive document import
- Slack integration
- Jira API integration
- authentication system
- saved meeting history
- multi-user collaboration
- project dashboards
- AI model training or fine tuning

These features may be considered in future product phases.

---

## Core User Flows

### Flow 1 — Paste Meeting Notes

1. User opens Meeting Brain
2. User pastes meeting transcript or notes
3. User clicks **Generate Report**
4. System analyzes meeting content
5. Structured output is generated
6. User reviews results
7. User exports or sends the report

---

### Flow 2 — Upload Meeting Document

1. User uploads meeting file
2. System extracts text from document
3. User clicks **Generate Report**
4. AI processes meeting content
5. Structured output is displayed

Supported formats:

- PDF
- DOC
- DOCX
- TXT
- MD

---

### Flow 3 — Example Meeting Input

Allows users to quickly test the product.

1. User clicks **Load Example Meeting**
2. Example transcript is loaded
3. User generates meeting report
4. Output is displayed

Example scenarios include:

- product development sprint meeting
- infrastructure implementation meeting
- vendor coordination meeting

---

### Flow 4 — Send Meeting Report via Email

1. User generates meeting report
2. User clicks **Send via Email**
3. Email form appears
4. User enters recipient email
5. System sends the structured meeting report

---

## User Stories

As a **PMO assistant**, I want to paste meeting notes and generate structured meeting minutes so I can update project documentation quickly.

As a **project coordinator**, I want action items and owners extracted from meetings so I can track responsibilities.

As a **stakeholder**, I want a concise meeting summary so I can understand meeting outcomes without reading the entire transcript.

As a **delivery coordinator**, I want meeting outcomes converted into Jira-style tasks so I can quickly move work into execution.

---

## Edge Cases

The system should handle the following situations:

- meeting transcript contains no clear decisions
- notes contain fragmented bullet points instead of full sentences
- multiple potential owners for an action item
- no explicit deadlines mentioned
- meeting discussion contains mostly brainstorming without outcomes
- uploaded file contains little or no extractable text
- AI cannot confidently determine responsibilities
- transcript contains excessive unrelated conversation

The system should avoid inventing information when confidence is low.

---

## Success Metrics

### Usability

Users can easily:

- paste or upload meeting content
- generate structured meeting reports
- understand results without extensive editing

---

### Speed

Users should be able to produce a structured meeting report in **under two minutes**.

---

### Output Quality

Generated reports consistently include:

- a clear meeting summary
- identifiable decisions
- actionable tasks
- risks or blockers
- open questions

---

### Demonstration Value

First-time users should understand the product value immediately through:

- example meeting inputs
- structured output preview
- export options
- email functionality
