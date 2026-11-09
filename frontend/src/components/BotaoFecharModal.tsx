import { Icone } from './Icone';

interface BotaoFecharModalProps {
  onClick: () => void;
}

export function BotaoFecharModal({ onClick }: BotaoFecharModalProps) {
  return (
    <button
      aria-label="Fechar"
      className="btn-icone"
      onClick={onClick}
      title="Fechar"
      type="button"
    >
      <Icone className="h-5 w-5" nome="fechar" />
    </button>
  );
}
