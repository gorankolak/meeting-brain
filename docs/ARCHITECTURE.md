# ARCHITECTURE.md

## 1. Purpose

This document defines the technical architecture for **Meeting Brain MVP**.

It provides a clear blueprint for development aligned with:

- PRD.md
- UX.md
- OUTPUT_SCHEMA.md
- Data Model.md
- Product Development System

The architecture is optimized for:

- fast MVP development
- strong frontend engineering practices
- clean separation of concerns
- maintainability
- portfolio-level code quality

---

# 2. Architecture Overview

Meeting Brain is a **React single-page application** that converts meeting transcripts into structured reports using an LLM.

Core user flow:

1. User inputs meeting transcript
2. User optionally uploads file
3. User can load an example meeting
4. System generates structured report
5. User views report
6. User exports or emails report

---

# High-Level Architecture

```
React App (Client)
       ↓
Serverless API Layer
       ↓
LLM Provider
       ↓
Structured JSON Response
       ↓
Client Report Rendering
```

Frontend never calls the LLM directly.

Instead:

- client sends normalized transcript
- server builds prompt
- server calls LLM
- server validates schema
- server returns structured report

This architecture:

- protects API keys
- keeps prompt logic server-side
- improves reliability
- reflects production architecture.

---

# 3. Tech Stack

## Frontend

- React 18+
- Vite
- TailwindCSS v4
- React Router
- React Hook Form
- Zod
- Lucide Icons

---

## Styling System

Meeting Brain uses:

**TailwindCSS v4 with CSS-first configuration**

Important rule:

There is **NO `tailwind.config.js` file**.

Design tokens are defined directly in CSS using the Tailwind v4 `@theme` system.

Example:

```
@import "tailwindcss";

@theme {

  --color-brand-navy: #0B132B;
  --color-brand-cyan: #22D3EE;
  --color-brand-amber: #F6B44B;

  --color-surface-50: #F8FAFC;
  --color-surface-100: #EEF2F7;
  --color-surface-800: #253047;
  --color-surface-900: #111827;

  --radius-card: 12px;
  --radius-button: 8px;

}
```

Usage example:

```
bg-[--color-brand-navy]
text-[--color-brand-cyan]
rounded-[--radius-card]
```

This aligns with the **design system shown in the visual style guide**.

---

# 4. Backend / API Layer

Server functionality is implemented using:

**Netlify Functions**

Endpoints:

```
/api/generate-report
/api/send-report-email
```

Responsibilities:

- LLM prompt generation
- schema validation
- email sending
- API key protection

---

# 5. LLM Provider

Recommended providers:

Primary:

```
Gemini API
```

Alternative:

```
OpenRouter
```

Reason:

- strong free tier
- fast responses
- reliable JSON outputs.

---

# 6. File Parsing

Client-side parsing for simplicity.

Supported file types:

```
PDF
DOCX
TXT
```

Libraries used:

```
pdfjs-dist
mammoth
```

File limits:

```
max file size: 5MB
```

---

# 7. Email System

Emails are sent via:

```
Resend
```

Optional:

```
React Email templates
```

Emails include:

- meeting summary
- decisions
- action items
- follow-ups

---

# 8. Persistence Strategy

MVP intentionally avoids database complexity.

State storage:

```
React state
localStorage (optional)
```

localStorage can persist:

- last transcript
- last generated report
- UI preferences

---

# 9. Project Structure

```
/src
  /app
    App.jsx
    routes.jsx

  /pages
    HomePage.jsx
    NewMeetingPage.jsx
    ReportPage.jsx
    NotFoundPage.jsx

  /components
    /layout
      AppShell.jsx
      Header.jsx
      PageSection.jsx

    /ui
      Button.jsx
      Card.jsx
      Badge.jsx
      Input.jsx
      Textarea.jsx
      FileUpload.jsx
      Spinner.jsx
      EmptyState.jsx
      ErrorState.jsx
      SectionHeading.jsx

    /meeting
      MeetingInputForm.jsx
      ExampleMeetingButton.jsx
      TranscriptInput.jsx
      FileInputPanel.jsx
      GenerateReportButton.jsx

    /report
      ReportOverviewCard.jsx
      SummarySection.jsx
      KeyTopicsSection.jsx
      DecisionsSection.jsx
      ActionItemsSection.jsx
      RisksSection.jsx
      FollowUpsSection.jsx
      ReportActions.jsx
      ReportStatusBanner.jsx

    /email
      EmailReportDialog.jsx
      EmailForm.jsx

    /export
      ExportMenu.jsx

  /hooks
    useMeetingInput.js
    useGenerateReport.js
    useReportActions.js

  /schemas
    meetingInput.schema.js
    report.schema.js
    email.schema.js

  /services
    generateReport.js
    parsePdf.js
    parseDocx.js
    sendReportEmail.js
    localStorage.js

  /lib
    exampleMeetings.js
    formatters.js
    validators.js
    utils.js

  /styles
    index.css

/netlify
  /functions
    generate-report.js
    send-report-email.js

/docs
  PRD.md
  UX.md
  OUTPUT_SCHEMA.md
  Data Model.md
  ARCHITECTURE.md
```

---

# 10. Routing Strategy

Routes:

```
/
/app
/app/new-meeting
/app/report/:id
```

Pages:

**HomePage**

Product intro.

**NewMeetingPage**

Transcript input and generation.

**ReportPage**

Structured report view.

---

# 11. State Management

No external state libraries.

State types:

### UI State

```
loading
dialogs
errors
```

### Form State

Handled via:

```
react-hook-form
zod validation
```

### Async State

Managed by hooks:

```
useGenerateReport
useReportActions
```

---

# 12. Data Flow

Generate report flow:

```
User Input
↓
Validation
↓
File Parsing
↓
POST /api/generate-report
↓
LLM Response
↓
Schema Validation
↓
Report Display
```

---

# 13. API Endpoints

## Generate Report

```
POST /api/generate-report
```

Request:

```
{
 "meetingTitle": "",
 "transcript": "",
 "sourceType": "manual"
}
```

Response:

```
{
 "reportId": "",
 "overview": {},
 "keyTopics": [],
 "decisions": [],
 "actionItems": [],
 "risks": [],
 "followUps": []
}
```

---

## Send Email

```
POST /api/send-report-email
```

Uses Resend API.

---

# 14. LLM Prompt Strategy

Prompt generated server-side.

Prompt sections:

1. system role
2. developer schema instructions
3. transcript input

Rules:

- JSON only output
- schema-aligned response
- no hallucinated information.

Response validated with Zod.

---

# 15. Export System

Export methods:

```
Copy to clipboard
Download TXT
Download Markdown
```

Formatting utilities:

```
/src/lib/formatters.js
```

---

# 16. Error Handling

Error types:

- validation errors
- parsing errors
- API failures
- LLM failures
- email failures

Principles:

- user-friendly messages
- retry capability
- preserved user input

---

# 17. Accessibility

Required:

- semantic HTML
- labelled inputs
- keyboard navigation
- focus states
- color contrast compliance

---

# 18. Performance Strategy

Rules:

- avoid heavy dependencies
- parse files only when needed
- limit transcript length
- prevent unnecessary rerenders

---

# 19. Naming Conventions

Components:

```
PascalCase
```

Hooks:

```
useSomething
```

Utilities:

```
camelCase
```

---

# 20. Environment Variables

```
GEMINI_API_KEY
RESEND_API_KEY
APP_BASE_URL
```

Secrets must remain server-side.

---

# 21. Deployment

Recommended platform:

```
Netlify
```

Includes:

- hosting
- serverless functions
- environment variable management

---

# 22. Future Expansion

Future versions may include:

- authentication
- report history
- collaborative editing
- streaming LLM responses
- analytics dashboards
- PDF exports
- team workspaces

Architecture already supports expansion.

---

# 23. Recommended Build Order

Development sequence:

1. routing + layout
2. input form
3. example loader
4. report API
5. report display
6. file upload parsing
7. export system
8. email sending
9. error handling
10. localStorage polish

---

# 24. Core Architecture Principle

Meeting Brain follows this rule:

> Business logic stays in the API layer, schemas define contracts, and UI components remain simple and focused on presentation.

This ensures:

- maintainability
- predictable outputs
- scalable architecture
- production-ready structure.
