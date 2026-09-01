import { PERFIS } from '@ipe_crm/shared';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { RotaPrivada } from '@/components/RotaPrivada';
import { LoginPage } from '@/features/autenticacao/LoginPage';
import { EstoquePage } from '@/features/estoque/EstoquePage';
import { FornecedoresPage } from '@/features/fornecedores/FornecedoresPage';
import { ManutencoesPage } from '@/features/manutencoes/ManutencoesPage';
import { VeiculosPage } from '@/features/veiculos/VeiculosPage';
import { useAutenticacaoStore } from '@/store/autenticacao.store';

function RedirecionamentoInicial() {
  const perfil = useAutenticacaoStore((state) => state.usuario?.perfil);

  if (perfil === PERFIS.ADMINISTRATIVO) {
    return <Navigate to="/fornecedores" replace />;
  }

  return <Navigate to="/estoque" replace />;
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    element: <RotaPrivada />,
    children: [
      {
        element: <Layout />,
        children: [
          { path: '/', element: <RedirecionamentoInicial /> },
          {
            element: (
              <RotaPrivada
                perfis={[PERFIS.ADMIN, PERFIS.OFICINA, PERFIS.COMPRAS, PERFIS.GERENTE]}
              />
            ),
            children: [
              { path: '/estoque', element: <EstoquePage /> },
              { path: '/veiculos', element: <VeiculosPage /> },
            ],
          },
          {
            element: <RotaPrivada perfis={[PERFIS.ADMIN, PERFIS.OFICINA]} />,
            children: [{ path: '/manutencoes', element: <ManutencoesPage /> }],
          },
          {
            element: (
              <RotaPrivada
                perfis={[PERFIS.ADMIN, PERFIS.COMPRAS, PERFIS.ADMINISTRATIVO, PERFIS.GERENTE]}
              />
            ),
            children: [{ path: '/fornecedores', element: <FornecedoresPage /> }],
          },
          { path: '*', element: <Navigate to="/" replace /> },
        ],
      },
    ],
  },
]);
