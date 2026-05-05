import { Title } from "@/components/ui/title";
import { Text } from "@/components/ui/text";

interface ProblemCopy {
  heading: string;
  subheading: string;
  pain1Title: string;
  pain1Body: string;
  pain2Title: string;
  pain2Body: string;
  pain3Title: string;
  pain3Body: string;
}

export function ProblemSection({ copy }: { copy: ProblemCopy }) {
  const pains = [
    { title: copy.pain1Title, body: copy.pain1Body, icon: <IconSites /> },
    { title: copy.pain2Title, body: copy.pain2Body, icon: <IconForm /> },
    { title: copy.pain3Title, body: copy.pain3Body, icon: <IconMoney /> },
  ];

  return (
    <section className="col-span-12 border-y border-rule bg-paper-muted py-14 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="max-w-2xl mb-10">
          <Title variant="section" level={2}>
            {copy.heading}
          </Title>
          <Text variant="lead" className="mt-3">
            {copy.subheading}
          </Text>
        </div>

        <ul className="grid gap-4 sm:grid-cols-3">
          {pains.map((p, i) => (
            <li
              key={i}
              className="bg-paper border border-rule p-5 space-y-3"
            >
              <div className="w-9 h-9 rounded-full bg-paper-muted flex items-center justify-center text-ink-secondary">
                {p.icon}
              </div>
              <Title variant="card" level={3}>
                {p.title}
              </Title>
              <Text variant="body" className="text-ink-secondary">
                {p.body}
              </Text>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function IconSites() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4"
      aria-hidden
    >
      <rect x="3" y="4" width="8" height="6" rx="1" />
      <rect x="13" y="4" width="8" height="6" rx="1" />
      <rect x="3" y="14" width="8" height="6" rx="1" />
      <rect x="13" y="14" width="8" height="6" rx="1" />
    </svg>
  );
}

function IconForm() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4"
      aria-hidden
    >
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <line x1="8" y1="9" x2="16" y2="9" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="12" y2="17" />
    </svg>
  );
}

function IconMoney() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 1.5-2.5 2-2.5 3.5" />
      <line x1="12" y1="17" x2="12" y2="17.01" />
    </svg>
  );
}
