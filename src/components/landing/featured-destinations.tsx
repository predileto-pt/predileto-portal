import Link from "next/link";
import { Title } from "@/components/ui/title";

interface Destination {
  name: string;
  /** District value passed to the search params (BE expects district name). */
  district: string;
  /** Eyebrow shown above the name — region, vibe, or count. */
  tagline: string;
  /**
   * Image path relative to /public — e.g. `/images/lisboa.jpeg`.
   * Optional: when omitted, the card renders just the gradient + name
   * overlay, which is also the fallback if the image fails to load.
   */
  image?: string;
  /** Tailwind class for the gradient behind the image. */
  bg: string;
  /**
   * Tailwind `from-*` color for the bottom-to-top colored shade overlay.
   * Pick a 600/700-weight saturated color so white text remains readable
   * at the bottom; the gradient fades to fully transparent at the top so
   * the image is visible across the upper half.
   */
  tint: string;
}

const DESTINATIONS: Destination[] = [
  {
    name: "Lisboa",
    district: "Lisboa",
    tagline: "Capital · histórica",
    image: "/images/lisboa.jpeg",
    bg: "bg-gradient-to-br from-amber-200 to-rose-300",
    tint: "from-rose-700/85",
  },
  {
    name: "Porto",
    district: "Porto",
    tagline: "Douro · vinho",
    image: "/images/porto.jpeg",
    bg: "bg-gradient-to-br from-orange-200 to-amber-300",
    tint: "from-orange-700/85",
  },
  {
    name: "Algarve",
    district: "Faro",
    tagline: "Sul · costa atlântica",
    image: "/images/algarve.jpg",
    bg: "bg-gradient-to-br from-sky-200 to-cyan-300",
    tint: "from-cyan-700/85",
  },
  {
    name: "Sintra",
    district: "Lisboa",
    tagline: "Serra · palácios",
    image: "/images/sintra.jpeg",
    bg: "bg-gradient-to-br from-emerald-200 to-teal-300",
    tint: "from-emerald-700/85",
  },
  {
    name: "Coimbra",
    district: "Coimbra",
    tagline: "Universitária",
    image: "/images/coimbra.jpg",
    bg: "bg-gradient-to-br from-stone-200 to-amber-200",
    tint: "from-amber-800/85",
  },
  {
    name: "Braga",
    district: "Braga",
    tagline: "Minho · barroca",
    image: "/images/braga.jpg",
    bg: "bg-gradient-to-br from-amber-100 to-orange-200",
    tint: "from-amber-700/85",
  },
  {
    name: "Cascais",
    district: "Lisboa",
    tagline: "Linha · costa",
    image: "/images/cascais.jpeg",
    bg: "bg-gradient-to-br from-blue-200 to-indigo-200",
    tint: "from-indigo-700/85",
  },
  {
    name: "Madeira",
    district: "Madeira",
    tagline: "Ilha · atlântica",
    image: "/images/madeira.jpeg",
    bg: "bg-gradient-to-br from-emerald-300 to-cyan-400",
    tint: "from-teal-700/85",
  },
];

interface FeaturedDestinationsProps {
  locale: string;
  mode: "comprar" | "arrendar";
  heading: string;
  eyebrow: string;
  cta: string;
}

export function FeaturedDestinations({
  locale,
  mode,
  heading,
  eyebrow,
  cta,
}: FeaturedDestinationsProps) {
  return (
    <section className="col-span-12 bg-canvas">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14 sm:py-20">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div className="max-w-xl">
            <p className="text-[11px] uppercase tracking-[0.22em] text-primary font-semibold mb-3">
              {eyebrow}
            </p>
            <Title variant="section" level={2} className="text-balance">
              {heading}
            </Title>
          </div>
          <a
            href="#all-locations"
            className="text-sm font-heading font-bold text-ink-secondary hover:text-primary transition-colors inline-flex items-center gap-1 self-start sm:self-end"
          >
            {cta}
            <span aria-hidden>→</span>
          </a>
        </div>

        <ul className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {DESTINATIONS.map((d, i) => {
            const href = `/${mode}?district=${encodeURIComponent(d.district)}`;
            // Slight vertical offset on alternating cards for editorial feel
            const offset = i % 4 === 1 || i % 4 === 2 ? "lg:translate-y-6" : "";
            return (
              <li key={d.name} className={offset}>
                <Link
                  href={href}
                  className={`group relative block aspect-[4/5] overflow-hidden ${d.bg}`}
                >
                  {d.image ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={d.image}
                      alt=""
                      loading="lazy"
                      onError={(e) => {
                        // Hide the broken <img> so the gradient
                        // background shows through cleanly. Prevents
                        // the broken-icon glyph from rendering on top
                        // of the card.
                        e.currentTarget.style.display = "none";
                      }}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
                    />
                  ) : null}
                  {/* Per-card colored shade fading bottom → top. Solid at
                      the bottom (text contrast), transparent at the top
                      (image visible). Replaces the old neutral dark-bottom
                      gradient so each card carries its own mood. */}
                  <div
                    aria-hidden
                    className={`absolute inset-0 bg-gradient-to-t ${d.tint} to-transparent`}
                  />
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-[0.18em] font-semibold text-white/90 bg-black/30 backdrop-blur-sm px-2 py-1">
                      {d.tagline}
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                    <h3 className="font-heading font-bold text-white text-2xl sm:text-3xl leading-none drop-shadow-sm">
                      {d.name}
                    </h3>
                    <span className="mt-2 inline-flex items-center gap-1 text-xs font-heading font-semibold text-white/90 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                      Explorar
                      <span aria-hidden>→</span>
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
