# Meeting Brain — UX / System Design

PHASE 2 — UX Architecture

---

# 1. UX Concept

Meeting Brain is a **single-screen productivity tool** inspired by developer tools such as gitingest.com.

The interface focuses on a **fast input → processing → results workflow** without page navigation.

Users remain on one workspace while interacting with the tool.

Core interaction loop:

Input → Generate → Review → Export / Email

This approach minimizes cognitive load and improves productivity.

---

# 2. Layout Structure

Desktop Layout

---

## | Header |

| Input Panel | Results Panel |
| | |
| | |
| | |
| | |

---

## | Footer |

Mobile Layout

Header

Input Panel

Generate Button

Results Panel

Footer

---

# 3. User Journeys

## Journey 1 — Paste Meeting Notes

User pastes meeting transcript or notes.

Steps:

1. Open application
2. Paste meeting text into input area
3. Click **Generate Report**
4. AI processes input
5. Structured report appears in results panel

Output sections:

Summary  
Key Decisions  
Action Items  
Risks  
Open Questions  
Next Steps

---

## Journey 2 — Upload Document

User uploads a meeting transcript file.

Steps:

1. Upload file
2. System extracts text
3. Preview of extracted text appears
4. User clicks **Generate Report**
5. AI processes content
6. Structured output appears in results panel

---

## Journey 3 — Load Example Meeting

Allows users to quickly test the product without preparing their own meeting notes.

Steps:

1. User clicks **Load Example Meeting**
2. Example transcript is inserted into the input area
3. User clicks **Generate Report**
4. AI processes the example transcript
5. Structured output appears in the results panel

Example scenarios include:

- product development sprint meeting
- infrastructure implementation meeting
- vendor coordination meeting

Example transcripts are stored in the repository.

---

## Journey 4 — Export Report

User exports generated report.

Options:

Copy to clipboard  
Download Markdown file  
Download JSON file

---

## Journey 5 — Send Report via Email

User shares report via email.

Steps:

1. Enter recipient email
2. Click **Send Report**
3. Backend sends email using Resend API
4. Confirmation message appears

---

# 4. Route Map

MVP routing is minimal.

Routes:

/  
Main workspace

/privacy  
Privacy policy

/terms  
Terms of service

All core functionality exists on the root route.

---

# 5. Page Definitions

## Main Workspace (/)

Purpose

Main tool interface for generating structured meeting reports.

Sections

Header

Input Panel

Results Panel

Export Actions

Email Send

Footer

---

# 6. Component Hierarchy

App

Header

MainLayout

InputPanel

TextInput

FileUpload

LoadExampleButton

PreviewArea

GenerateButton

ResultsPanel

SummarySection

DecisionsSection

ActionItemsSection

RisksSection

QuestionsSection

NextStepsSection

ExportPanel

CopyButton

DownloadMarkdownButton

DownloadJSONButton

EmailPanel

EmailInput

SendButton

Footer

---

# 7. State Ownership Strategy

Global App State

inputText  
uploadedFile  
extractedText  
generationStatus  
generatedReport  
errorState  
exampleLoaded

---

InputPanel State

textValue  
filePreview

---

ResultsPanel State

reportData

---

EmailPanel State

recipientEmail  
emailStatus

---

# 8. Generation State Flow

Application processing states:

idle

User has not yet generated a report.

generating

AI processing in progress.

success

Report successfully generated and displayed.

error

Generation failed and error message is displayed.

---

# 9. Loading States

When generation begins:

Generate button becomes disabled.

Results panel displays:

"Processing meeting notes..."

Animated loading indicator appears.

---

# 10. Error States

Possible errors:

AI request failed

File extraction failed

Email send failed

Invalid input

Error UI pattern:

Error banner displayed above results panel.

Example:

"Generation failed. Please try again."

---

# 11. Empty States

Before generation:

Results panel displays message:

"Paste meeting notes, upload a file, or load an example meeting to generate a structured report."

---

# 12. Accessibility Baseline

Keyboard navigation

All inputs and actions accessible via tab navigation.

ARIA

aria-live regions for generation status updates.

Color contrast

Minimum WCAG AA contrast compliance.

Touch targets

Minimum 44px click area.

---

# 13. Responsive Strategy

Desktop

Two-column layout with input and results panels.

Tablet

Panels stack vertically with input first.

Mobile

Single column workflow:

Input → Generate → Results.

---

# 14. UX Performance Goals

Initial page load target:

Under 1 second.

AI generation target:

5–10 seconds.

After generation:

Smooth scroll to results panel.

---

# 15. Design Style

Minimal developer-tool aesthetic.

Inspired by:

gitingest.com

Clean interface with minimal distractions.

Primary design goals:

Clarity  
Speed  
Productivity

Styling stack:

TailwindCSS
