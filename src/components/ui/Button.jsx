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
      "border border-transparent bg-[--color-accent] text-[--color-panel-strong] shadow-[var(--shadow-soft)] hover:brightness-95",
    secondary:
      "border border-transparent bg-[--color-panel-strong] text-white shadow-[var(--shadow-soft)] hover:bg-[#111f33]",
    ghost:
      "border border-[--color-border] bg-white/92 text-[--color-ink] hover:bg-[--color-panel]"
  };
  const sizes = {
    md: "min-h-12 px-4 py-3 text-sm",
    sm: "min-h-10 px-3.5 py-2.5 text-sm"
  };

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-[--radius-button] font-semibold transition duration-150 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[--color-accent] disabled:cursor-not-allowed disabled:opacity-60 ${sizes[size]} ${tones[tone]} ${className}`}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}
