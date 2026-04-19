import { cn } from "@/lib/utils";

const variants = {
  default: "text-xs text-ink-muted",
  label: "text-xs text-ink-muted uppercase tracking-body",
  caption: "text-xs text-ink-subtle leading-body",
  meta: "text-xs text-ink-muted font-medium",
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
