import { cn } from "@/lib/utils";

const variants = {
  default: "bg-gray-100 text-gray-600",
  muted: "bg-gray-50 text-gray-400",
} as const;

interface BadgeProps {
  children: React.ReactNode;
  variant?: keyof typeof variants;
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span className={cn("inline-block text-xs px-1.5 py-0.5 border border-gray-200", variants[variant], className)}>
      {children}
    </span>
  );
}
