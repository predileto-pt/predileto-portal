import { cn } from "@/lib/utils";

const variants = {
  primary:
    "bg-[#2bd4bd] hover:bg-[#25bfaa] border-[#20a896] text-white",
  default:
    "bg-white hover:bg-gray-50 border-gray-300 text-gray-700",
  secondary:
    "bg-gray-100 hover:bg-gray-200 border-gray-200 text-gray-700",
} as const;

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
}

export function Button({
  variant = "default",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
