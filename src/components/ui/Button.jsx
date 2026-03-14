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
      "border border-teal-500 bg-teal-500 text-white hover:brightness-105 active:scale-[0.99]",
    accent:
      "border border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100 active:scale-[0.99]",
    secondary:
      "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 active:scale-[0.99]",
    ghost:
      "border border-transparent bg-transparent text-gray-600 hover:border-gray-200 hover:bg-gray-50 hover:text-gray-900 active:scale-[0.99]"
  };
  const sizes = {
    md: "min-h-12 px-4 py-3 text-sm",
    sm: "min-h-10 px-3.5 py-2.5 text-sm",
    xs: "min-h-8 px-2.5 py-1.5 text-xs"
  };

  return (
    <button
      className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-md font-semibold transition duration-150 ease-out motion-reduce:transform-none motion-reduce:transition-none focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[--color-accent] disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-60 ${sizes[size]} ${tones[tone]} ${className}`}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}
