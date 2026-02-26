"use client";

import { useSearchParams } from "next/navigation";

const updates = [
  {
    description:
      "A ingerir propriedades de Ponte de Lima. O processo pode demorar até 2 dias até estar completo.",
    date: "25 de fevereiro de 2026",
  },
  {
    description: "Adicionadas propriedades do Imovirtual",
    date: "15 de fevereiro de 2026",
  },
  {
    description: "Lançamento do Predileto — pesquisa de imóveis em Portugal",
    date: "1 de fevereiro de 2026",
  },
];

export function UpdatesSidebar() {
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("selected");

  if (selectedId) return null;

  return (
    <div className="lg:sticky lg:top-4 border border-gray-200 p-3 max-w-[200px]">
      <h2 className="text-[9px] text-gray-400 uppercase mb-2">Novidades</h2>
      <ul className="space-y-2">
        {updates.map((update) => (
          <li key={update.date}>
            <p className="text-[10px] text-gray-600">{update.description}</p>
            <time className="text-[9px] text-gray-400">{update.date}</time>
          </li>
        ))}
      </ul>
    </div>
  );
}
