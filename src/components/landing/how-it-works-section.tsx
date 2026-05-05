import { Title } from "@/components/ui/title";
import { Text } from "@/components/ui/text";
import { Small } from "@/components/ui/small";

interface HowCopy {
  heading: string;
  subheading: string;
  step1Title: string;
  step1Body: string;
  step2Title: string;
  step2Body: string;
  step3Title: string;
  step3Body: string;
}

export function HowItWorksSection({ copy }: { copy: HowCopy }) {
  const steps = [
    { title: copy.step1Title, body: copy.step1Body },
    { title: copy.step2Title, body: copy.step2Body },
    { title: copy.step3Title, body: copy.step3Body },
  ];

  return (
    <section className="col-span-12 bg-paper py-14 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="max-w-2xl mb-10">
          <Title variant="section" level={2}>
            {copy.heading}
          </Title>
          <Text variant="lead" className="mt-3">
            {copy.subheading}
          </Text>
        </div>

        <ol className="grid gap-8 md:grid-cols-3">
          {steps.map((s, i) => (
            <li key={i} className="relative">
              <div className="flex items-start gap-4">
                <StepNumber index={i + 1} />
                <div className="flex-1 min-w-0 space-y-2">
                  <Title variant="card" level={3}>
                    {s.title}
                  </Title>
                  <Text variant="body" className="text-ink-secondary">
                    {s.body}
                  </Text>
                </div>
              </div>
              {i < steps.length - 1 && (
                <div
                  aria-hidden
                  className="hidden md:block absolute top-5 left-[calc(100%-1rem)] right-[-2rem] h-px bg-rule"
                />
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function StepNumber({ index }: { index: number }) {
  return (
    <div className="shrink-0 w-10 h-10 rounded-full border border-primary/30 bg-primary/10 flex items-center justify-center">
      <Small
        variant="default"
        className="font-heading font-bold text-primary"
      >
        {String(index).padStart(2, "0")}
      </Small>
    </div>
  );
}
