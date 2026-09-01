export type TipoIconeAcao = 'editar' | 'excluir' | 'saida' | 'ajustar' | 'veiculos' | 'historico';

export function IconeAcao({ tipo }: { tipo: TipoIconeAcao }) {
  const propriedades = {
    'aria-hidden': true,
    className: 'h-4 w-4',
    fill: 'none',
    stroke: 'currentColor',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    strokeWidth: 2,
    viewBox: '0 0 24 24',
  };

  switch (tipo) {
    case 'editar':
      return (
        <svg {...propriedades}>
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
        </svg>
      );
    case 'excluir':
      return (
        <svg {...propriedades}>
          <path d="M3 6h18" />
          <path d="M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v5M14 11v5" />
        </svg>
      );
    case 'saida':
      return (
        <svg {...propriedades}>
          <path d="M10 17l5-5-5-5M15 12H3" />
          <path d="M14 3h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5" />
        </svg>
      );
    case 'ajustar':
      return (
        <svg {...propriedades}>
          <path d="M4 6h10M18 6h2M4 12h2M10 12h10M4 18h7M15 18h5" />
          <circle cx="16" cy="6" r="2" />
          <circle cx="8" cy="12" r="2" />
          <circle cx="13" cy="18" r="2" />
        </svg>
      );
    case 'veiculos':
      return (
        <svg {...propriedades}>
          <path d="M5 17h14M6 17l-1-5 2-5h10l2 5-1 5" />
          <path d="M7 12h10M8 7l1-3h6l1 3" />
          <circle cx="8" cy="17" r="2" />
          <circle cx="16" cy="17" r="2" />
        </svg>
      );
    case 'historico':
      return (
        <svg {...propriedades}>
          <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
          <path d="M3 3v5h5M12 7v5l3 2" />
        </svg>
      );
  }
}
