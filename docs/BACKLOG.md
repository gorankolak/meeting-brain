# Meeting Brain — Implementation Backlog

Product: Meeting Brain  
Phase: 5 — MVP Stabilization & Production Readiness

This backlog assumes the core MVP flows are already implemented.

Goals of Phase 5:

- stabilize the MVP
- improve reliability
- improve UX
- add professional export formats
- prepare project for production deployment
- improve developer experience

---

# EPIC 0 — Internationalization (Completed)

Internationalization support is already implemented.

Completed features:

- [x] HR / EN translation system implemented
- [x] `LanguageSwitcher` component implemented
- [x] Translation files created (`locales/hr`, `locales/en`)
- [x] App loads with Croatian as default language
- [x] UI language toggle implemented

Remaining improvements (optional future work):

- [ ] Persist language selection in localStorage
- [ ] Ensure all error messages are translated
- [ ] Ensure export labels are translated

---

# EPIC 1 — Transcript Input Experience

## Feature: Input validation

- [ ] Add transcript length validation (min + max characters)
- [ ] Show validation error UI for empty transcript submission
- [ ] Disable "Generate Report" button when transcript input is invalid
- [ ] Add helper text explaining supported transcript formats

## Feature: File upload improvements

- [ ] Validate file type for transcript uploads (.txt, .md, .docx if supported)
- [ ] Show error message for unsupported file formats
- [ ] Add file size validation for uploads
- [ ] Display uploaded file name in UI

## Feature: Example meeting flow

- [ ] Implement example transcript loader utility
- [ ] Add UI button: "Load Example Meeting"
- [ ] Add 2–3 different example meeting scenarios
- [ ] Reset current input when example transcript is loaded

---

# EPIC 2 — Report Generation Reliability (Completed)

## Feature: API request lifecycle

- [x] Add loading state during report generation
- [x] Add timeout handling for LLM request
- [x] Add retry mechanism for failed report generation
- [x] Display generation progress indicator

## Feature: Response validation

- [x] Validate API response against report schema
- [x] Show error UI if schema validation fails
- [x] Log schema mismatch to console for debugging

## Feature: Service layer improvements

- [x] Separate API request logic into dedicated service module
- [x] Add environment variable validation for API keys
- [x] Implement graceful fallback when API is unavailable

---

# EPIC 3 — Report Workspace UI

## Feature: Report layout

- [x] Improve report readability using section spacing
- [x] Add section headers for key report parts
- [x] Add collapsible sections for long reports

## Feature: Copy & export actions

- [x] Implement "Copy Report to Clipboard" action
- [x] Add success confirmation after copy action
- [x] Add "Download Report as Markdown" option
- [x] Add "Download Report as Text" option

## Feature: Regeneration

- [x] Add "Regenerate Report" button
- [x] Preserve transcript input when regenerating report
- [x] Prevent duplicate requests while regeneration is running

---

# EPIC 4 — Email Sending UX

## Feature: Email form

- [ ] Add email format validation
- [ ] Disable send button if email is invalid
- [ ] Add helper text explaining email delivery

## Feature: Email sending states

- [ ] Add loading state when sending email
- [ ] Show success message after email is sent
- [ ] Show error message if email sending fails

## Feature: Email service

- [ ] Validate email payload before sending request
- [ ] Add server response validation
- [ ] Add error handling for failed serverless email function

---

# EPIC 5 — Error Handling

## Feature: Global error UI

- [ ] Implement reusable ErrorBanner component
- [ ] Display API errors in report workspace
- [ ] Display file parsing errors in input panel

## Feature: Error boundaries

- [ ] Implement React error boundary component
- [ ] Wrap main app layout with error boundary
- [ ] Add fallback UI for rendering errors

---

# EPIC 6 — Report Export Formats

This epic enables practical report sharing and task extraction for PMO assistants and project coordinators.

Supported export formats:

- Markdown
- JSON
- PDF
- Jira-style task format

---

## Feature: Export service layer

- [ ] Create `src/services/export/` directory
- [ ] Implement `exportMarkdown.js`
- [ ] Implement `exportJson.js`
- [ ] Implement `exportPdf.js`
- [ ] Implement `exportJiraTasks.js`

---

## Feature: PDF report export

- [ ] Install PDF generation library (`jspdf` or `react-pdf`)
- [ ] Create `generatePdfReport()` utility
- [ ] Convert report JSON into PDF layout
- [ ] Add "Download PDF" button in report toolbar
- [ ] Implement PDF download action
- [ ] Test export with long reports
- [ ] Ensure section hierarchy preserved in PDF

---

## Feature: Jira-style task export

Example task format:

Title  
Description  
Assignee  
Priority  
Due date

- [ ] Define Jira-style task schema
- [ ] Create `extractTasksFromReport()` utility
- [ ] Map report action items to Jira task structure
- [ ] Create CSV/text export formatter
- [ ] Add "Export Jira Tasks" button
- [ ] Implement clipboard copy action
- [ ] Test export with multiple action items

---

## Feature: Export UI integration

- [ ] Create `ReportExportToolbar` component
- [ ] Refactor export buttons into toolbar
- [ ] Add loading state for export operations
- [ ] Add success notifications after export
- [ ] Ensure responsive toolbar layout

---

# EPIC 7 — Accessibility Improvements

## Feature: Form accessibility

- [ ] Add accessible labels to transcript input
- [ ] Add ARIA attributes for validation errors
- [ ] Ensure form fields are keyboard navigable

## Feature: Button accessibility

- [ ] Add aria-label attributes for action buttons
- [ ] Ensure focus styles are visible

## Feature: Screen reader support

- [ ] Add aria-live region for generation status
- [ ] Announce report generation completion

---

# EPIC 8 — Analytics Integration

## Feature: Event tracking

- [ ] Integrate Google Analytics (GA4)
- [ ] Track report generation event
- [ ] Track example meeting usage
- [ ] Track report email sending

## Feature: Debug mode

- [ ] Add analytics debug logging for development mode

---

# EPIC 9 — Deployment & Environment

## Feature: Environment configuration

- [ ] Add environment variable documentation
- [ ] Add `.env.example` file

## Feature: Netlify deployment

- [ ] Validate Netlify serverless functions configuration
- [ ] Ensure environment variables are available in Netlify
- [ ] Test production deployment build

---

# EPIC 10 — UI Polish

## Feature: Visual consistency

- [ ] Standardize button styles across app
- [ ] Standardize spacing between sections
- [ ] Improve typography hierarchy

## Feature: Responsive layout

- [ ] Test layout on tablet breakpoints
- [ ] Improve mobile layout for report workspace
- [ ] Ensure email form works on small screens

---

# MVP STABILIZATION COMPLETE WHEN

- Transcript input flow stable
- Report generation reliable
- Email sending confirmed
- Export formats working (Markdown, JSON, PDF, Jira tasks)
- Errors handled gracefully
- UI responsive and accessible
- Deployment verified
- Analytics operational
