import { useState } from "react";
import { Mail } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "../ui/Button";
import { sendReportEmail } from "../../services/sendReportEmail";

export function EmailPanel({ report, setEmailFeedback }) {
  const { t, i18n } = useTranslation(["export"]);
  const [recipient, setRecipient] = useState("");
  const [status, setStatus] = useState("idle");

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("loading");
    setEmailFeedback(null);

    try {
      const response = await sendReportEmail({
        recipient,
        report,
        language: i18n.resolvedLanguage || i18n.language
      });
      setEmailFeedback(
        response.mode === "mock"
          ? {
              tone: "info",
              message: t("export:messages.emailMock", { recipient })
            }
          : {
              tone: "success",
              message: t("export:messages.emailSent", { recipient })
            }
      );
      setRecipient("");
      setStatus("idle");
    } catch (error) {
      setStatus("idle");
      setEmailFeedback(
        error.message && error.message !== "EMAIL_SEND_FAILED"
          ? { tone: "error", message: error.message }
          : { tone: "error", message: t("export:messages.emailError") }
      );
    }
  }

  return (
    <form
      className="rounded-lg border border-gray-200 bg-white p-4 sm:p-5"
      onSubmit={handleSubmit}
    >
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <label className="block" htmlFor="email-recipient">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">
            {t("export:email.recipientLabel")}
          </span>
          <input
            className="min-w-0 w-full rounded-md border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition duration-150 ease-out focus:border-[--color-accent] focus:shadow-[0_0_0_4px_rgba(23,200,227,0.12)]"
            id="email-recipient"
            onChange={(event) => setRecipient(event.target.value)}
            placeholder={t("export:email.recipientPlaceholder")}
            required
            type="email"
            value={recipient}
          />
        </label>
        <Button className="w-full lg:w-auto" disabled={status === "loading"} tone="secondary" type="submit">
          <Mail size={16} />
          {status === "loading" ? t("export:email.sending") : t("export:buttons.sendEmail")}
        </Button>
      </div>
    </form>
  );
}
