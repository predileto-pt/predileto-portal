import { cn } from "@/lib/utils";

const variants = {
  default: "text-sm text-gray-600 leading-relaxed",
  muted: "text-sm text-gray-400",
} as const;

interface TextProps {
  children: React.ReactNode;
  variant?: keyof typeof variants;
  className?: string;
}

export function Text({ children, variant = "default", className }: TextProps) {
  return <p className={cn(variants[variant], className)}>{children}</p>;
}
