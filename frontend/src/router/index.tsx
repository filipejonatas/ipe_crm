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
          { path: '/estoque', element: <EstoquePage /> },
          { path: '/compras', element: <PaginaPlaceholder titulo="Compras" /> },
          { path: '/cotacoes', element: <PaginaPlaceholder titulo="Cotacoes" /> },
          { path: '/contratos', element: <PaginaPlaceholder titulo="Contratos" /> },
          { path: '/fornecedores', element: <FornecedoresPage /> },
          { path: '/veiculos', element: <VeiculosPage /> },
          { path: '/usuarios', element: <PaginaPlaceholder titulo="Usuarios" /> },
          {
            path: '/configuracoes',
            element: <ConfiguracoesPage />,
          },
        ],
      },
    ],
  },
]);
