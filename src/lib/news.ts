export interface NewsEntry {
  description: string;
  date: string;
}

export function getNewsEntries(): NewsEntry[] {
  return [
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
      description:
        "Lançamento do Predileto — pesquisa de imóveis em Portugal",
      date: "1 de fevereiro de 2026",
    },
  ];
}
