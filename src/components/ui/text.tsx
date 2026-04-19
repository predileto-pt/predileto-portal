import { cn } from "@/lib/utils";

const variants = {
  default: "text-sm text-gray-600 leading-relaxed",
  muted: "text-sm text-ink-muted",
  body: "text-base text-ink-secondary leading-body",
  lead: "text-lg text-ink leading-body",
  subtle: "text-sm text-ink-subtle leading-body",
} as const;

interface TextProps {
  children: React.ReactNode;
  variant?: keyof typeof variants;
  className?: string;
}

export function Text({ children, variant = "default", className }: TextProps) {
  return <p className={cn(variants[variant], className)}>{children}</p>;
}
