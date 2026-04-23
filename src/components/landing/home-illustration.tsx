/**
 * Stylized illustration for the home hero. References the real product
 * surface: a search composer at the center, AI-attribute chips drifting
 * around it, and an anonymous comment bubble — the visual shorthand for
 * "AI-enriched + community-backed". Pure inline SVG, no external assets.
 */
export function HomeIllustration({
  className = "",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 480 420"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Ilustração: caixa de pesquisa rodeada por etiquetas de análise IA"
    >
      <defs>
        <linearGradient id="accent-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="hsl(172 66% 50%)" />
          <stop offset="100%" stopColor="hsl(38 92% 50%)" />
        </linearGradient>
        <linearGradient id="soft-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(172 66% 95%)" />
          <stop offset="100%" stopColor="hsl(38 92% 96%)" />
        </linearGradient>
        <radialGradient id="bg-halo" cx="0.5" cy="0.5" r="0.6">
          <stop offset="0%" stopColor="hsl(172 66% 50% / 0.10)" />
          <stop offset="100%" stopColor="hsl(172 66% 50% / 0)" />
        </radialGradient>
      </defs>

      {/* Soft halo */}
      <rect x="40" y="30" width="400" height="360" rx="32" fill="url(#bg-halo)" />

      {/* Stylized houses — simple rooftops in the background */}
      <g opacity="0.35" stroke="hsl(172 66% 30%)" strokeWidth="1.5" fill="none">
        <path d="M60 330 L110 290 L160 330 L160 370 L60 370 Z" />
        <rect x="95" y="335" width="16" height="35" fill="hsl(172 66% 95%)" />
        <rect x="120" y="335" width="20" height="20" fill="hsl(172 66% 95%)" />

        <path d="M320 325 L365 285 L410 325 L410 365 L320 365 Z" />
        <rect x="348" y="330" width="14" height="35" fill="hsl(38 92% 96%)" />
        <rect x="372" y="330" width="20" height="18" fill="hsl(38 92% 96%)" />

        <path d="M190 345 L230 315 L270 345 L270 375 L190 375 Z" />
      </g>

      {/* Central composer card */}
      <g>
        <rect
          x="80"
          y="160"
          width="320"
          height="74"
          rx="20"
          fill="#ffffff"
          stroke="hsl(0 0% 90%)"
          strokeWidth="1"
        />
        {/* Cursor */}
        <rect x="104" y="188" width="2" height="18" fill="hsl(172 66% 45%)">
          <animate
            attributeName="opacity"
            values="1;0;1"
            dur="1s"
            repeatCount="indefinite"
          />
        </rect>
        {/* Fake query text */}
        <rect x="114" y="190" width="170" height="6" rx="3" fill="hsl(0 0% 82%)" />
        <rect x="114" y="204" width="104" height="6" rx="3" fill="hsl(0 0% 88%)" />
        {/* Send button */}
        <circle cx="370" cy="197" r="14" fill="hsl(0 0% 10%)" />
        <path
          d="M370 204 L370 190 M364 196 L370 190 L376 196"
          stroke="#ffffff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </g>

      {/* Floating AI attribute chips */}
      <g fontFamily="Bernino, sans-serif" fontSize="11">
        <g transform="translate(40, 90)">
          <rect width="150" height="28" rx="14" fill="url(#soft-fill)" stroke="hsl(172 66% 50% / 0.25)" />
          <circle cx="16" cy="14" r="5" fill="hsl(172 66% 45%)" />
          <text x="28" y="18" fill="hsl(172 66% 28%)">
            Custo de vida ~1.200€
          </text>
        </g>

        <g transform="translate(290, 70)">
          <rect width="140" height="28" rx="14" fill="url(#soft-fill)" stroke="hsl(38 92% 50% / 0.35)" />
          <circle cx="16" cy="14" r="5" fill="hsl(38 92% 45%)" />
          <text x="28" y="18" fill="hsl(30 70% 28%)">
            Gasolina ~80€/mês
          </text>
        </g>

        <g transform="translate(20, 250)">
          <rect width="128" height="28" rx="14" fill="url(#soft-fill)" stroke="hsl(172 66% 50% / 0.25)" />
          <circle cx="16" cy="14" r="5" fill="hsl(172 66% 45%)" />
          <text x="28" y="18" fill="hsl(172 66% 28%)">
            Metro a 3 min
          </text>
        </g>

        <g transform="translate(310, 260)">
          <rect width="128" height="28" rx="14" fill="url(#soft-fill)" stroke="hsl(38 92% 50% / 0.35)" />
          <circle cx="16" cy="14" r="5" fill="hsl(38 92% 45%)" />
          <text x="28" y="18" fill="hsl(30 70% 28%)">
            Ruído: Baixo
          </text>
        </g>
      </g>

      {/* Anonymous comment bubble */}
      <g transform="translate(95, 66)">
        <rect width="170" height="54" rx="12" fill="#ffffff" stroke="hsl(0 0% 88%)" />
        <circle cx="18" cy="26" r="10" fill="hsl(0 0% 92%)" stroke="hsl(0 0% 82%)" />
        <path
          d="M14 23 a4 4 0 0 1 8 0 a4 4 0 0 1 -8 0 M10 34 a8 8 0 0 1 16 0"
          fill="hsl(0 0% 55%)"
          stroke="none"
        />
        <rect x="38" y="16" width="40" height="5" rx="2.5" fill="hsl(0 0% 20%)" />
        <rect x="38" y="28" width="120" height="5" rx="2.5" fill="hsl(0 0% 76%)" />
        <rect x="38" y="38" width="90" height="5" rx="2.5" fill="hsl(0 0% 76%)" />
      </g>

      {/* Faint grid dots */}
      <g fill="hsl(0 0% 60% / 0.2)">
        {Array.from({ length: 6 }, (_, r) =>
          Array.from({ length: 10 }, (_, c) => (
            <circle
              key={`${r}-${c}`}
              cx={80 + c * 36}
              cy={310 + r * 14}
              r={1}
            />
          )),
        )}
      </g>
    </svg>
  );
}
