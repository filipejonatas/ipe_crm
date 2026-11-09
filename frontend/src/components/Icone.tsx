// Ícones Lucide (https://lucide.dev, licença ISC), obtidos via better-icons/Iconify.
// Para adicionar: `npx better-icons get lucide:<nome>` e copie os elementos para cá.
import type { ReactNode, SVGProps } from 'react';

const icones = {
  // lucide:pencil
  editar: (
    <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497zM15 5l4 4" />
  ),
  // lucide:trash-2
  excluir: (
    <path d="M10 11v6m4-6v6m5-11v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  ),
  // lucide:package-minus
  saida: (
    <>
      <path d="M12 22V12m4 5h6m-1-4V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.729l7 4a2 2 0 0 0 2 .001l1.675-.955" />
      <path d="M3.29 7L12 12l8.71-5M7.5 4.27l8.997 5.148" />
    </>
  ),
  // lucide:package-pen
  ajustar: (
    <>
      <path d="M12 14.34V12l8.71-5m-4.199 14.141a2 2 0 0 0 .854-.506l4.013-4.009a1 1 0 1 0-3.004-3.004l-4.01 4.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .599.626z" />
      <path d="M21 9.114V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l5.087 2.907M3.29 7L12 12M7.5 4.27l9 5.15" />
    </>
  ),
  // lucide:car-front
  veiculo: (
    <>
      <path d="m21 8l-2 2l-1.5-3.7A2 2 0 0 0 15.646 5H8.4a2 2 0 0 0-1.903 1.257L5 10L3 8m4 6h.01M17 14h.01" />
      <rect width="18" height="8" x="3" y="10" rx="2" />
      <path d="M5 18v2m14-2v2" />
    </>
  ),
  // lucide:history
  historico: (
    <>
      <path d="M3 12a9 9 0 1 0 9-9a9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5m4-1v5l4 2" />
    </>
  ),
  // lucide:x
  fechar: <path d="M18 6L6 18M6 6l12 12" />,
  // lucide:menu
  menu: <path d="M4 5h16M4 12h16M4 19h16" />,
  // lucide:panel-left-close
  recolherMenu: (
    <>
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M9 3v18m7-6l-3-3l3-3" />
    </>
  ),
  // lucide:panel-left-open
  expandirMenu: (
    <>
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M9 3v18m5-12l3 3l-3 3" />
    </>
  ),
  // lucide:log-out
  sair: <path d="m16 17l5-5l-5-5m5 5H9m0 9H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />,
  // lucide:eye
  mostrar: (
    <>
      <path d="M2.062 12.348a1 1 0 0 1 0-.696a10.75 10.75 0 0 1 19.876 0a1 1 0 0 1 0 .696a10.75 10.75 0 0 1-19.876 0" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  // lucide:eye-off
  ocultar: (
    <>
      <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575a1 1 0 0 1 0 .696a10.8 10.8 0 0 1-1.444 2.49m-6.41-.679a3 3 0 0 1-4.242-4.242" />
      <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151a1 1 0 0 1 0-.696a10.75 10.75 0 0 1 4.446-5.143M2 2l20 20" />
    </>
  ),
  // lucide:droplet
  oleo: (
    <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5S5 13 5 15a7 7 0 0 0 7 7" />
  ),
  // lucide:boxes-linked
  compatibilidade: (
    <>
      <path d="M14 6h2a2 2 0 0 1 2 2v5m-3.79 2.202L18 17.4V22" />
      <path d="M14.796 14.611A1.6 1.6 0 0 0 14 15.995v3.013a1.6 1.6 0 0 0 .797 1.384l2.4 1.392a1.6 1.6 0 0 0 1.606 0l2.4-1.392A1.6 1.6 0 0 0 22 19.008v-3.013a1.6 1.6 0 0 0-.796-1.384l-2.4-1.394a1.6 1.6 0 0 0-1.514-.051zM18 17.4l3.79-2.198m-19.58-11L6 6.4V16a2 2 0 0 0 2 2h2" />
      <path d="M2.796 3.611A1.6 1.6 0 0 0 2 4.995v3.013a1.6 1.6 0 0 0 .797 1.384l2.4 1.392a1.6 1.6 0 0 0 1.606 0l2.4-1.392A1.6 1.6 0 0 0 10 8.008V4.995a1.6 1.6 0 0 0-.796-1.384l-2.4-1.394a1.6 1.6 0 0 0-1.514-.052zM6 6.4l3.79-2.198" />
    </>
  ),
  // lucide:package
  estoque: (
    <>
      <path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73zm1 .27V12" />
      <path d="M3.29 7L12 12l8.71-5M7.5 4.27l9 5.15" />
    </>
  ),
  // lucide:store
  fornecedor: (
    <>
      <path d="M15 21v-5a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v5m8.774-10.69a1.12 1.12 0 0 0-1.549 0a2.5 2.5 0 0 1-3.451 0a1.12 1.12 0 0 0-1.548 0a2.5 2.5 0 0 1-3.452 0a1.12 1.12 0 0 0-1.549 0a2.5 2.5 0 0 1-3.77-3.248l2.889-4.184A2 2 0 0 1 7 2h10a2 2 0 0 1 1.653.873l2.895 4.192a2.5 2.5 0 0 1-3.774 3.244" />
      <path d="M4 10.95V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8.05" />
    </>
  ),
  // lucide:wrench
  manutencao: (
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.106-3.105c.32-.322.863-.22.983.218a6 6 0 0 1-8.259 7.057l-7.91 7.91a1 1 0 0 1-2.999-3l7.91-7.91a6 6 0 0 1 7.057-8.259c.438.12.54.662.219.984z" />
  ),
} satisfies Record<string, ReactNode>;

export type NomeIcone = keyof typeof icones;

interface IconeProps extends Omit<SVGProps<SVGSVGElement>, 'children'> {
  nome: NomeIcone;
}

export function Icone({ nome, className = 'h-4 w-4', ...props }: IconeProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      viewBox="0 0 24 24"
      {...props}
    >
      {icones[nome]}
    </svg>
  );
}
