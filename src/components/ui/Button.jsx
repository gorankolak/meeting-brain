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
      "border border-transparent bg-[var(--color-primary)] text-[var(--color-primary-dark)] shadow-[inset_0_-1px_0_rgba(22,51,0,0.14),0_1px_2px_rgba(17,17,17,0.08)] hover:bg-[#8ED85F] hover:shadow-[inset_0_-1px_0_rgba(22,51,0,0.18),0_2px_4px_rgba(17,17,17,0.10)] active:scale-[0.99]",
    accent:
      "border border-transparent bg-[var(--color-primary)] text-[var(--color-primary-dark)] shadow-[inset_0_-1px_0_rgba(22,51,0,0.14),0_1px_2px_rgba(17,17,17,0.08)] hover:bg-[#8ED85F] hover:shadow-[inset_0_-1px_0_rgba(22,51,0,0.18),0_2px_4px_rgba(17,17,17,0.10)] active:scale-[0.99]",
    secondary:
      "border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[color-mix(in_srgb,var(--color-surface)_92%,black_8%)] active:scale-[0.99]",
    ghost:
      "border border-transparent bg-transparent text-[var(--color-primary-dark)] hover:bg-[color-mix(in_srgb,var(--color-surface)_85%,var(--color-primary)_15%)] active:scale-[0.99]"
  };
  const sizes = {
    md: "min-h-12 px-4 py-3 text-sm",
    sm: "min-h-10 px-3.5 py-2.5 text-sm",
    xs: "min-h-8 px-2.5 py-1.5 text-xs"
  };

  return (
    <button
      className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-md font-semibold transition duration-150 ease-out motion-reduce:transform-none motion-reduce:transition-none focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)] disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-60 ${sizes[size]} ${tones[tone]} ${className}`}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}
