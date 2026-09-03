import { NavLink, useNavigate } from 'react-router-dom';
import type { CriarManutencaoVeiculoDto } from '@/services/manutencoes.service';
import { ManutencaoFormModal } from './ManutencaoFormModal';
import { useCriarManutencao } from './hooks/useManutencoes';

export function NovaManutencaoPage() {
  const navigate = useNavigate();
  const criar = useCriarManutencao();

  function voltarParaLista() {
    navigate('/manutencoes');
  }

  async function salvar(dto: CriarManutencaoVeiculoDto) {
    await criar.mutateAsync(dto);
    voltarParaLista();
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-col justify-between gap-3 border-b border-zinc-200 pb-4 sm:flex-row sm:items-end">
        <div className="space-y-1">
          <nav className="text-xs font-medium text-zinc-500" aria-label="Breadcrumb">
            <NavLink className="hover:text-emerald-700" to="/manutencoes">
              Manutencoes
            </NavLink>
            <span className="px-2">/</span>
            <span className="text-zinc-700">Nova manutencao</span>
          </nav>
          <h1 className="text-2xl font-semibold text-zinc-950">Nova manutencao</h1>
          <p className="text-sm text-zinc-500">
            Registre o servico, vincule pecas do estoque e confira os totais antes de salvar.
          </p>
        </div>
        <button
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
          type="button"
          onClick={voltarParaLista}
        >
          Voltar
        </button>
      </div>

      <ManutencaoFormModal
        aberto
        variante="pagina"
        erro={criar.error}
        salvando={criar.isPending}
        onFechar={voltarParaLista}
        onSalvar={salvar}
      />
    </section>
  );
}
