export function Button({
  children,
  className = "",
  tone = "primary",
  type = "button",
  ...props
}) {
  const tones = {
    primary:
      "bg-[--color-accent] text-[--color-panel-strong] shadow-[var(--shadow-soft)] hover:brightness-95",
    secondary:
      "bg-[--color-panel-strong] text-white shadow-[var(--shadow-soft)] hover:bg-[#111f33]",
    ghost:
      "border border-[--color-border] bg-white text-[--color-ink] hover:bg-[--color-panel]"
  };

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-[--radius-button] px-4 py-3 text-sm font-semibold transition focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[--color-accent] disabled:cursor-not-allowed disabled:opacity-60 ${tones[tone]} ${className}`}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}
