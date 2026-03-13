import { AlertCircle, CheckCircle2, Info } from "lucide-react";

const TONES = {
  error: {
    Icon: AlertCircle,
    className: "border-red-200 bg-red-50 text-red-700"
  },
  success: {
    Icon: CheckCircle2,
    className: "border-emerald-200 bg-emerald-50 text-emerald-800"
  },
  info: {
    Icon: Info,
    className: "border-[--color-border] bg-[--color-panel] text-[--color-ink]"
  }
};

export function ErrorBanner({ children, tone = "error", id, role = "alert" }) {
  const { Icon, className } = TONES[tone] || TONES.error;

  return (
    <div
      className={`flex items-start gap-2 rounded-[--radius-button] border px-4 py-3 text-sm ${className}`}
      id={id}
      role={role}
    >
      <Icon aria-hidden="true" className="mt-0.5 shrink-0" size={16} />
      <span>{children}</span>
    </div>
  );
}
