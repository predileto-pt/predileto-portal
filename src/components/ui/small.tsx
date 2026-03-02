import { cn } from "@/lib/utils";

const variants = {
  default: "text-xs text-gray-400",
  label: "text-xs text-gray-400 uppercase",
} as const;

interface SmallProps {
  children: React.ReactNode;
  variant?: keyof typeof variants;
  as?: "span" | "time" | "label";
  className?: string;
}

export function Small({
  children,
  variant = "default",
  as: Tag = "span",
  className,
}: SmallProps) {
  return <Tag className={cn(variants[variant], className)}>{children}</Tag>;
}
