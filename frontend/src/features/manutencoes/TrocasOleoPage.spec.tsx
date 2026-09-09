import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { manutencoesService } from '@/services/manutencoes.service';
import { TrocasOleoPage } from './TrocasOleoPage';

vi.mock('@/services/manutencoes.service', () => ({
  manutencoesService: { listarTrocasOleo: vi.fn() },
}));

function abrir() {
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <MemoryRouter>
        <TrocasOleoPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

it('exibe os prazos formatados e destaca a troca vencida', async () => {
  vi.mocked(manutencoesService.listarTrocasOleo).mockResolvedValue({
    dados: [
      {
        id: 'm1',
        placa: 'ABC1234',
        data_manutencao: '2020-01-01',
        proxima_troca_oleo: '2020-07-01',
        proxima_troca_oleo_km: 60000,
      },
    ],
    total_paginas: 1,
  } as never);
  abrir();
  expect(await screen.findByText('ABC1234')).toBeInTheDocument();
  expect(screen.getByText('01/07/2020')).toBeInTheDocument();
  expect(screen.getByText('Vencida')).toBeInTheDocument();
  expect(screen.getByText('60.000 km')).toBeInTheDocument();
});

it('orienta o cadastro quando não há trocas registradas', async () => {
  vi.mocked(manutencoesService.listarTrocasOleo).mockResolvedValue({
    dados: [],
    total_paginas: 0,
  } as never);
  abrir();
  expect(await screen.findByText(/Nenhuma troca de óleo encontrada/)).toBeInTheDocument();
});
