# Meeting Brain

Meeting Brain is a React + Netlify Functions MVP that converts messy meeting notes into structured project reports.

## Stack

- React 18 + Vite
- TailwindCSS v4 using CSS `@theme`
- Netlify Functions
- Zod validation
- Gemini API for report generation
- Resend for email delivery

## Local setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env`.
3. Fill `GEMINI_API_KEY` to enable live report generation.
4. Fill `RESEND_API_KEY` and `EMAIL_FROM` to enable live email delivery.
5. Run `npm run dev`.

Without provider keys, the app still works in fallback/mock mode for local evaluation.

## Deploy

1. Connect the repo to Netlify.
2. Set build command to `npm run build`.
3. Set publish directory to `dist`.
4. Add `GEMINI_API_KEY`, optional `GEMINI_MODEL`, `RESEND_API_KEY`, and `EMAIL_FROM`.

## Notes

- Frontend calls `/api/generate-report` and `/api/send-report-email`.
- File parsing supports PDF, DOCX, TXT, and MD on the client.
- Generated output is validated against the shared Meeting Brain schema.
