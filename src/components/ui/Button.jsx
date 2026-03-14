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
      "border border-[--color-panel-strong] bg-[linear-gradient(135deg,_#17c8e3_0%,_#5ee6f2_100%)] text-[--color-panel-strong] shadow-[0_18px_36px_rgba(23,200,227,0.24)] ring-1 ring-white/70 hover:scale-[1.02] hover:-translate-y-0.5 hover:brightness-[1.03] hover:shadow-[0_22px_42px_rgba(23,200,227,0.3)] active:translate-y-0 active:scale-100 active:brightness-[0.98] active:shadow-[0_10px_24px_rgba(23,200,227,0.24)]",
    secondary:
      "border border-slate-200 bg-white text-[--color-ink] shadow-[0_10px_24px_rgba(15,23,42,0.04)] hover:scale-[1.02] hover:-translate-y-0.5 hover:border-sky-200 hover:bg-slate-50 hover:shadow-[0_16px_32px_rgba(15,23,42,0.08)] active:translate-y-0 active:scale-100 active:bg-white active:shadow-[0_8px_18px_rgba(15,23,42,0.05)]",
    ghost:
      "border border-transparent bg-transparent text-[--color-muted] hover:scale-[1.02] hover:border-[--color-border] hover:bg-[--color-panel] hover:text-[--color-ink] active:scale-100 active:bg-white"
  };
  const sizes = {
    md: "min-h-12 px-4 py-3 text-sm",
    sm: "min-h-10 px-3.5 py-2.5 text-sm",
    xs: "min-h-8 px-2.5 py-1.5 text-xs"
  };

  return (
    <button
      className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-[--radius-button] font-semibold transition duration-150 ease-out motion-reduce:transform-none motion-reduce:transition-none focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[--color-accent] disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-60 ${sizes[size]} ${tones[tone]} ${className}`}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}
