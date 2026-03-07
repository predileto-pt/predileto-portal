import { cn } from "@/lib/utils";

const variants = {
  primary:
    "text-white bg-green-600 hover:bg-green-700 border border-green-700 shadow-[inset_0_2px_0_0_rgba(255,255,255,0.1),inset_0_-2px_0_0_rgba(0,0,0,0.1)]",
  default:
    "text-stone-700 bg-white hover:bg-stone-50 border border-stone-300 hover:border-stone-400 shadow-[inset_0_2px_0_0_rgba(255,255,255,0.8),inset_0_-2px_0_0_rgba(0,0,0,0.04)]",
  secondary:
    "text-white bg-gray-900 hover:bg-gray-800 border-y border-y-gray-700 shadow-[inset_0_2px_0_0_rgba(255,255,255,0.06),inset_0_-2px_0_0_rgba(0,0,0,0.2)]",
  steel:
    "text-gray-800 bg-gray-300 hover:bg-gray-400 border border-gray-400 hover:border-gray-500 shadow-[inset_0_2px_0_0_rgba(255,255,255,0.4),inset_0_-2px_0_0_rgba(0,0,0,0.15)]",
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
        "px-3 py-1.5 text-sm font-medium disabled:opacity-50 transition-colors duration-300 cursor-pointer",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
