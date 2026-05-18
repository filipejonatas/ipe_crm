interface PaginaPlaceholderProps {
  titulo: string;
}

export function PaginaPlaceholder({ titulo }: PaginaPlaceholderProps) {
  return (
    <section>
      <h1 className="text-2xl font-semibold text-zinc-950">{titulo}</h1>
    </section>
  );
}
