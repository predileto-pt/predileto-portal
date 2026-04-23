import { Title } from "@/components/ui/title";
import { Text } from "@/components/ui/text";

interface FeaturesCopy {
  heading: string;
  subheading: string;
  feat1Title: string;
  feat1Body: string;
  feat2Title: string;
  feat2Body: string;
  feat3Title: string;
  feat3Body: string;
  feat4Title: string;
  feat4Body: string;
  feat5Title: string;
  feat5Body: string;
  feat6Title: string;
  feat6Body: string;
}

type IconKey = "cost" | "comments" | "sparkle" | "lock-open" | "history" | "gift";

export function FeaturesSection({ copy }: { copy: FeaturesCopy }) {
  const items: { title: string; body: string; icon: IconKey }[] = [
    { title: copy.feat1Title, body: copy.feat1Body, icon: "cost" },
    { title: copy.feat2Title, body: copy.feat2Body, icon: "comments" },
    { title: copy.feat3Title, body: copy.feat3Body, icon: "sparkle" },
    { title: copy.feat4Title, body: copy.feat4Body, icon: "lock-open" },
    { title: copy.feat5Title, body: copy.feat5Body, icon: "history" },
    { title: copy.feat6Title, body: copy.feat6Body, icon: "gift" },
  ];

  return (
    <section className="col-span-12 border-t border-rule bg-canvas py-14 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="max-w-2xl mb-10">
          <Title variant="section" level={2}>
            {copy.heading}
          </Title>
          <Text variant="lead" className="mt-3">
            {copy.subheading}
          </Text>
        </div>

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it, i) => (
            <li
              key={i}
              className="bg-paper border border-rule p-5 space-y-2"
            >
              <FeatureIcon name={it.icon} />
              <Title variant="card" level={3}>
                {it.title}
              </Title>
              <Text variant="body" className="text-ink-secondary">
                {it.body}
              </Text>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function FeatureIcon({ name }: { name: IconKey }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none" as const,
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "w-4 h-4",
    "aria-hidden": true,
  };
  const wrap = (child: React.ReactNode) => (
    <div className="w-9 h-9 rounded-md bg-primary/10 text-primary flex items-center justify-center">
      {child}
    </div>
  );
  switch (name) {
    case "cost":
      return wrap(
        <svg {...common}>
          <path d="M4 10h12" />
          <path d="M4 14h9" />
          <path d="M19 6a7.5 7.5 0 1 0 0 12" />
        </svg>,
      );
    case "comments":
      return wrap(
        <svg {...common}>
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>,
      );
    case "sparkle":
      return wrap(
        <svg {...common}>
          <path d="M12 3v4" />
          <path d="M12 17v4" />
          <path d="M3 12h4" />
          <path d="M17 12h4" />
          <path d="M6 6l2.5 2.5" />
          <path d="M15.5 15.5 18 18" />
          <path d="M6 18l2.5-2.5" />
          <path d="M15.5 8.5 18 6" />
        </svg>,
      );
    case "lock-open":
      return wrap(
        <svg {...common}>
          <rect x="4" y="11" width="16" height="9" rx="2" />
          <path d="M8 11V8a4 4 0 0 1 7.5-2" />
        </svg>,
      );
    case "history":
      return wrap(
        <svg {...common}>
          <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
          <polyline points="3 3 3 8 8 8" />
          <polyline points="12 7 12 12 15 14" />
        </svg>,
      );
    case "gift":
      return wrap(
        <svg {...common}>
          <polyline points="20 12 20 22 4 22 4 12" />
          <rect x="2" y="7" width="20" height="5" />
          <line x1="12" y1="22" x2="12" y2="7" />
          <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
          <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
        </svg>,
      );
  }
}
