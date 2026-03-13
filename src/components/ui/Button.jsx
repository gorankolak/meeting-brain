export function Button({
  children,
  className = "",
  tone = "primary",
  size = "md",
  type = "button",
  ...props
}) {
  const tones = {
    primary:
      "border border-[--color-panel-strong] bg-[linear-gradient(135deg,_#17c8e3_0%,_#5ee6f2_100%)] text-[--color-panel-strong] shadow-[0_18px_36px_rgba(23,200,227,0.24)] ring-1 ring-white/70 hover:-translate-y-0.5 hover:brightness-[1.03] hover:shadow-[0_22px_42px_rgba(23,200,227,0.3)] active:translate-y-0 active:brightness-[0.98] active:shadow-[0_10px_24px_rgba(23,200,227,0.24)]",
    secondary:
      "border border-[--color-border] bg-white/92 text-[--color-ink] shadow-[0_10px_24px_rgba(15,23,42,0.04)] hover:-translate-y-0.5 hover:border-sky-200 hover:bg-[--color-panel] hover:shadow-[0_16px_32px_rgba(15,23,42,0.08)] active:translate-y-0 active:bg-white active:shadow-[0_8px_18px_rgba(15,23,42,0.05)]",
    ghost:
      "border border-transparent bg-transparent text-[--color-muted] hover:border-[--color-border] hover:bg-[--color-panel] hover:text-[--color-ink] active:bg-white"
  };
  const sizes = {
    md: "min-h-12 px-4 py-3 text-sm",
    sm: "min-h-10 px-3.5 py-2.5 text-sm"
  };

  return (
    <button
      className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-[--radius-button] font-semibold transition duration-150 ease-out focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[--color-accent] disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-60 ${sizes[size]} ${tones[tone]} ${className}`}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}
