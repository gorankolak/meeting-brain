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
3. Keep `FORCE_FALLBACK=true` to use mock/fallback report generation and avoid Gemini requests during development.
4. Set `FORCE_FALLBACK=false` and fill `GEMINI_API_KEY` to enable live report generation when needed.
5. Fill `RESEND_API_KEY` and `EMAIL_FROM` to enable live email delivery.
6. Run `npm run dev`.

With `FORCE_FALLBACK=true`, the app skips Gemini entirely even if a valid API key is present. Without provider keys, the app also works in fallback/mock mode for local evaluation.

In local development, Vite now bridges `/api/generate-report` and `/api/send-report-email` directly to the Netlify function handlers, so `npm run dev` is sufficient for end-to-end testing.

## Deploy

1. Connect the repo to Netlify.
2. Set build command to `npm run build`.
3. Set publish directory to `dist`.
4. Add `GEMINI_API_KEY`, optional `GEMINI_MODEL`, `RESEND_API_KEY`, and `EMAIL_FROM`.

## Notes

- Frontend calls `/api/generate-report` and `/api/send-report-email`.
- File parsing supports PDF, DOCX, TXT, and MD on the client.
- Generated output is validated against the shared Meeting Brain schema.
