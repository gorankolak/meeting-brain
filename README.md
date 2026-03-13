# Meeting Brain

Meeting Brain is a React + Netlify Functions MVP that converts messy meeting notes into structured project reports.

## Stack

- React 18 + Vite
- TailwindCSS v4 using CSS `@theme`
- Netlify Functions
- Zod validation
- Gemini API for report generation
- `@react-pdf/renderer` for PDF export
- Resend for optional future email delivery

## Local setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env`.
3. Keep `FORCE_FALLBACK=true` to use mock/fallback report generation and avoid Gemini requests during development.
4. Set `FORCE_FALLBACK=false` and fill `GEMINI_API_KEY` to enable live report generation when needed.
5. Leave `RESEND_API_KEY` and `EMAIL_FROM` blank for the current MVP, or fill them later if email delivery is re-enabled.
6. Run `npm run dev`.

With `FORCE_FALLBACK=true`, the app skips Gemini entirely even if a valid API key is present. Without provider keys, the app also works in fallback/mock mode for local evaluation.

In local development, Vite bridges `/api/generate-report` to the Netlify function handler. The email function remains available in code but is treated as a deferred feature for this MVP slice.

## Deploy

1. Connect the repo to Netlify.
2. Set build command to `npm run build`.
3. Set publish directory to `dist`.
4. Add `GEMINI_API_KEY` and optional `GEMINI_MODEL`.
5. Add `RESEND_API_KEY` and `EMAIL_FROM` only if email delivery is enabled in a future release.

## Notes

- Frontend calls `/api/generate-report` in the active MVP flow.
- File parsing supports PDF, DOCX, TXT, and MD on the client.
- Generated output is validated against the shared Meeting Brain schema.
- Export support includes Markdown, plain text, JSON, PDF, and Jira-style task output.
