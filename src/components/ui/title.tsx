import { cn } from "@/lib/utils";

const variants = {
  display:
    "text-4xl font-heading font-bold leading-heading tracking-heading",
  page: "text-3xl font-heading font-bold leading-heading tracking-heading",
  section:
    "text-2xl font-heading font-bold leading-heading tracking-heading",
  card: "text-lg font-heading font-bold leading-heading tracking-heading",
  subsection:
    "text-base font-heading font-bold leading-heading tracking-heading",
} as const;

type Variant = keyof typeof variants;
type Level = 1 | 2 | 3 | 4 | 5 | 6;

const defaultLevel: Record<Variant, Level> = {
  display: 1,
  page: 1,
  section: 2,
  card: 3,
  subsection: 4,
};

interface TitleProps {
  children: React.ReactNode;
  variant?: Variant;
  level?: Level;
  className?: string;
}

export function Title({
  children,
  variant = "section",
  level,
  className,
}: TitleProps) {
  const resolved = level ?? defaultLevel[variant];
  const className_ = cn(variants[variant], "text-ink", className);

  switch (resolved) {
    case 1:
      return <h1 className={className_}>{children}</h1>;
    case 2:
      return <h2 className={className_}>{children}</h2>;
    case 3:
      return <h3 className={className_}>{children}</h3>;
    case 4:
      return <h4 className={className_}>{children}</h4>;
    case 5:
      return <h5 className={className_}>{children}</h5>;
    case 6:
      return <h6 className={className_}>{children}</h6>;
  }
}
