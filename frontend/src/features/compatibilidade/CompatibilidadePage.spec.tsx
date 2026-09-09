import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect } from 'vitest';
import { useItensEstoque } from '@/features/estoque/hooks/useItensEstoque';
import { CompatibilidadePage } from './CompatibilidadePage';

vi.mock('@/features/veiculos/hooks/useVeiculos', () => ({
  useVeiculos: () => ({
    data: {
      dados: [{ id: 'v1', placa: 'ABC1234', modelo: 'Uno', marca: 'Fiat', ativo: true }],
      total_paginas: 1,
    },
  }),
}));
vi.mock('@/features/estoque/hooks/useItensEstoque', () => ({
  useItensEstoque: vi.fn(() => ({
    data: {
      dados: [
        {
          id: 'f1',
          codigo: '01',
          descricao: 'Filtro de óleo',
          marca: 'Tecfil',
          saldo_atual: 0,
          unidade_medida: 'un',
          ativo: true,
        },
      ],
      total_paginas: 1,
    },
  })),
  useVeiculosCompativeis: (id?: string) => ({
    data: id ? [{ id: 'v1', placa: 'ABC1234', modelo: 'Uno', marca: 'Fiat', ativo: true }] : [],
  }),
}));

describe('CompatibilidadePage', () => {
  it('consulta filtros por veículo e veículos por filtro, incluindo saldo zero', async () => {
    const user = userEvent.setup();
    render(<CompatibilidadePage />);
    await user.click(screen.getByRole('button', { name: /ABC1234/ }));
    expect(useItensEstoque).toHaveBeenLastCalledWith(
      expect.objectContaining({ categoria: 'filtro', veiculo_id: 'v1' }),
    );
    expect(screen.getByText('Saldo: 0 un')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Filtros' }));
    expect(screen.getByText('Selecione um filtro para consultar os vínculos.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Filtro de óleo/ }));
    expect(screen.getByText('ABC1234 — Uno / Fiat')).toBeInTheDocument();
  });
});
