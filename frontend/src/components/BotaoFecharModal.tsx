interface BotaoFecharModalProps {
  onClick: () => void;
}

export function BotaoFecharModal({ onClick }: BotaoFecharModalProps) {
  return (
    <button
      aria-label="Fechar"
      className="inline-flex h-9 w-9 items-center justify-center rounded-md text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900"
      onClick={onClick}
      title="Fechar"
      type="button"
    >
      <svg
        aria-hidden="true"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path d="M6 6l12 12M18 6 6 18" />
      </svg>
    </button>
  );
}
