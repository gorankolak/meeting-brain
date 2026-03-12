import { useState } from "react";
import { Mail } from "lucide-react";
import { Button } from "../ui/Button";
import { sendReportEmail } from "../../services/sendReportEmail";

export function EmailPanel({ report, setEmailFeedback }) {
  const [recipient, setRecipient] = useState("");
  const [status, setStatus] = useState("idle");

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("loading");
    setEmailFeedback(null);

    try {
      const response = await sendReportEmail({ recipient, report });
      setEmailFeedback(
        response.mode === "mock"
          ? `Mock email prepared for ${recipient}. Configure Resend to enable delivery.`
          : `Report sent to ${recipient}.`
      );
      setRecipient("");
      setStatus("idle");
    } catch (error) {
      setStatus("idle");
      setEmailFeedback(error.message || "Email send failed.");
    }
  }

  return (
    <form className="flex flex-col gap-3 rounded-[--radius-panel] border border-[--color-border] bg-[--color-panel] p-4 lg:flex-row" onSubmit={handleSubmit}>
      <label className="sr-only" htmlFor="email-recipient">
        Recipient email
      </label>
      <input
        className="min-w-0 flex-1 rounded-[--radius-button] border border-[--color-border] bg-white px-4 py-3 text-sm outline-none transition focus:border-[--color-accent]"
        id="email-recipient"
        onChange={(event) => setRecipient(event.target.value)}
        placeholder="teammates@company.com"
        required
        type="email"
        value={recipient}
      />
      <Button disabled={status === "loading"} type="submit">
        <Mail size={16} />
        {status === "loading" ? "Sending..." : "Send via email"}
      </Button>
    </form>
  );
}
