import { PERFIS } from '@ipe_crm/shared';
import { createBrowserRouter } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { RotaPrivada } from '@/components/RotaPrivada';
import { LoginPage } from '@/features/autenticacao/LoginPage';
import { ConfiguracoesPage } from '@/features/configuracoes/ConfiguracoesPage';
import { EstoquePage } from '@/features/estoque/EstoquePage';
import { FornecedoresPage } from '@/features/fornecedores/FornecedoresPage';
import { VeiculosPage } from '@/features/veiculos/VeiculosPage';
import { PaginaPlaceholder } from '@/pages/PaginaPlaceholder';

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
          { path: '/', element: <PaginaPlaceholder titulo="Dashboard" /> },
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
            element: <RotaPrivada perfis={[PERFIS.ADMIN, PERFIS.COMPRAS]} />,
            children: [
              { path: '/compras', element: <PaginaPlaceholder titulo="Compras" /> },
              { path: '/cotacoes', element: <PaginaPlaceholder titulo="Cotacoes" /> },
            ],
          },
          {
            element: (
              <RotaPrivada
                perfis={[PERFIS.ADMIN, PERFIS.COMPRAS, PERFIS.ADMINISTRATIVO, PERFIS.GERENTE]}
              />
            ),
            children: [{ path: '/fornecedores', element: <FornecedoresPage /> }],
          },
          {
            element: <RotaPrivada perfis={[PERFIS.ADMIN, PERFIS.ADMINISTRATIVO, PERFIS.GERENTE]} />,
            children: [{ path: '/contratos', element: <PaginaPlaceholder titulo="Contratos" /> }],
          },
          {
            element: <RotaPrivada perfis={[PERFIS.ADMIN]} />,
            children: [{ path: '/usuarios', element: <PaginaPlaceholder titulo="Usuarios" /> }],
          },
          {
            path: '/configuracoes',
            element: <RotaPrivada perfis={[PERFIS.ADMIN]} />,
            children: [{ index: true, element: <ConfiguracoesPage /> }],
          },
        ],
      },
    ],
  },
]);
