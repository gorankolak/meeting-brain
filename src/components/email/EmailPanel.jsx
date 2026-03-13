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
          ? t("export:messages.emailMock", { recipient })
          : t("export:messages.emailSent", { recipient })
      );
      setRecipient("");
      setStatus("idle");
    } catch (error) {
      setStatus("idle");
      setEmailFeedback(
        error.message && error.message !== "EMAIL_SEND_FAILED"
          ? error.message
          : t("export:messages.emailError")
      );
    }
  }

  return (
    <form className="flex flex-col gap-3 rounded-[--radius-panel] border border-[--color-border] bg-[--color-panel] p-4 lg:flex-row" onSubmit={handleSubmit}>
      <label className="sr-only" htmlFor="email-recipient">
        {t("export:email.recipientLabel")}
      </label>
      <input
        className="min-w-0 flex-1 rounded-[--radius-button] border border-[--color-border] bg-white px-4 py-3 text-sm outline-none transition focus:border-[--color-accent]"
        id="email-recipient"
        onChange={(event) => setRecipient(event.target.value)}
        placeholder={t("export:email.recipientPlaceholder")}
        required
        type="email"
        value={recipient}
      />
      <Button disabled={status === "loading"} type="submit">
        <Mail size={16} />
        {status === "loading" ? t("export:email.sending") : t("export:buttons.sendEmail")}
      </Button>
    </form>
  );
}
