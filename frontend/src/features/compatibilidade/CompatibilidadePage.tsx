import { useState } from 'react';
import { useItensEstoque, useVeiculosCompativeis } from '@/features/estoque/hooks/useItensEstoque';
import { useVeiculos } from '@/features/veiculos/hooks/useVeiculos';

export function CompatibilidadePage() {
  const [modo, setModo] = useState<'veiculos' | 'filtros'>('veiculos');
  const [busca, setBusca] = useState('');
  const [pagina, setPagina] = useState(1);
  const [selecionado, setSelecionado] = useState<string>();
  const [paginaFiltros, setPaginaFiltros] = useState(1);
  const veiculos = useVeiculos({ busca, pagina, limite: 10 });
  const filtros = useItensEstoque({
    categoria: 'filtro',
    busca: modo === 'filtros' ? busca : undefined,
    veiculo_id: modo === 'veiculos' ? selecionado : undefined,
    pagina: modo === 'veiculos' ? paginaFiltros : pagina,
    limite: 10,
  });
  const compativeis = useVeiculosCompativeis(modo === 'filtros' ? selecionado : undefined);
  const lista = modo === 'veiculos' ? veiculos : filtros;

  function reiniciar() {
    setPagina(1);
    setSelecionado(undefined);
    setPaginaFiltros(1);
  }

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Filtros/Veículos</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Consulte os vínculos cadastrados no estoque, inclusive filtros sem saldo.
        </p>
      </div>
      <div className="flex gap-2" aria-label="Consultar por">
        {(['veiculos', 'filtros'] as const).map((valor) => (
          <button
            key={valor}
            type="button"
            aria-pressed={modo === valor}
            className={`rounded-md border px-4 py-2 text-sm font-medium ${modo === valor ? 'border-emerald-700 bg-emerald-700 text-white' : 'border-zinc-300 bg-white'}`}
            onClick={() => {
              setModo(valor);
              setBusca('');
              reiniciar();
            }}
          >
            {valor === 'veiculos' ? 'Veículos' : 'Filtros'}
          </button>
        ))}
      </div>
      <label className="block">
        <span className="text-sm font-medium">
          {modo === 'veiculos' ? 'Buscar veículo' : 'Buscar filtro'}
        </span>
        <input
          className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2"
          value={busca}
          placeholder={
            modo === 'veiculos' ? 'Placa, modelo ou marca' : 'Código, descrição ou marca'
          }
          onChange={(event) => {
            setBusca(event.target.value);
            reiniciar();
          }}
        />
      </label>
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-md border border-zinc-200 bg-white p-4">
          <h2 className="mb-3 font-semibold">
            {modo === 'veiculos' ? 'Veículos cadastrados' : 'Filtros do estoque'}
          </h2>
          {lista.isPending ? (
            <p role="status">Carregando...</p>
          ) : lista.isError ? (
            <p role="alert">Não foi possível carregar a lista.</p>
          ) : (
            <>
              {lista.data?.dados.length === 0 && <p>Nenhum registro encontrado.</p>}
              <div className="space-y-2">
                {(modo === 'veiculos'
                  ? veiculos.data?.dados.map((v) => ({
                      id: v.id,
                      texto: `${v.placa} — ${v.modelo} / ${v.marca}${v.ativo ? '' : ' (inativo)'}`,
                    }))
                  : filtros.data?.dados.map((f) => ({
                      id: f.id,
                      texto: `${f.codigo ?? 'Sem código'} — ${f.descricao} / ${f.marca ?? 'Sem marca'} · Saldo: ${f.saldo_atual}${f.ativo ? '' : ' (inativo)'}`,
                    }))
                )?.map((registro) => (
                  <button
                    key={registro.id}
                    type="button"
                    aria-pressed={selecionado === registro.id}
                    className={`block w-full rounded-md border p-3 text-left text-sm ${selecionado === registro.id ? 'border-emerald-700 bg-emerald-50' : 'border-zinc-200 hover:bg-zinc-50'}`}
                    onClick={() => {
                      setSelecionado(registro.id);
                      setPaginaFiltros(1);
                    }}
                  >
                    {registro.texto}
                  </button>
                ))}
              </div>
              <Paginacao
                pagina={pagina}
                total={lista.data?.total_paginas ?? 0}
                mudar={(valor) => {
                  setPagina(valor);
                  setSelecionado(undefined);
                }}
              />
            </>
          )}
        </div>
        <div className="rounded-md border border-zinc-200 bg-white p-4">
          <h2 className="mb-3 font-semibold">
            {modo === 'veiculos' ? 'Filtros compatíveis' : 'Veículos atendidos'}
          </h2>
          {!selecionado ? (
            <p className="text-sm text-zinc-500">
              Selecione {modo === 'veiculos' ? 'um veículo' : 'um filtro'} para consultar os
              vínculos.
            </p>
          ) : modo === 'veiculos' ? (
            filtros.isPending ? (
              <p role="status">Carregando...</p>
            ) : filtros.isError ? (
              <p role="alert">Não foi possível carregar os filtros.</p>
            ) : (
              <>
                {filtros.data?.dados.length === 0 && <p>Nenhum filtro vinculado a este veículo.</p>}
                <ul className="divide-y divide-zinc-200">
                  {filtros.data?.dados.map((f) => (
                    <li className="py-3 text-sm" key={f.id}>
                      {f.codigo ?? 'Sem código'} — {f.descricao} / {f.marca ?? 'Sem marca'}
                      <p className="text-zinc-500">
                        Saldo: {f.saldo_atual} {f.unidade_medida}
                        {!f.ativo && ' · Inativo'}
                      </p>
                    </li>
                  ))}
                </ul>
                <Paginacao
                  pagina={paginaFiltros}
                  total={filtros.data?.total_paginas ?? 0}
                  mudar={setPaginaFiltros}
                />
              </>
            )
          ) : compativeis.isPending ? (
            <p role="status">Carregando...</p>
          ) : compativeis.isError ? (
            <p role="alert">Não foi possível carregar os veículos.</p>
          ) : (
            <>
              {compativeis.data?.length === 0 && <p>Nenhum veículo vinculado a este filtro.</p>}
              <ul className="divide-y divide-zinc-200">
                {compativeis.data?.map((v) => (
                  <li className="py-3 text-sm" key={v.id}>
                    {v.placa} — {v.modelo} / {v.marca}
                    {!v.ativo && ' (inativo)'}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function Paginacao({
  pagina,
  total,
  mudar,
}: {
  pagina: number;
  total: number;
  mudar: (pagina: number) => void;
}) {
  if (total <= 1) return null;
  return (
    <div className="mt-4 flex items-center justify-between gap-3 text-sm">
      <button
        type="button"
        className="rounded border px-3 py-2 disabled:opacity-50"
        disabled={pagina <= 1}
        onClick={() => mudar(pagina - 1)}
      >
        Anterior
      </button>
      <span>
        Página {pagina} de {total}
      </span>
      <button
        type="button"
        className="rounded border px-3 py-2 disabled:opacity-50"
        disabled={pagina >= total}
        onClick={() => mudar(pagina + 1)}
      >
        Próxima
      </button>
    </div>
  );
}
