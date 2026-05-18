import { createBrowserRouter } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { RotaPrivada } from '@/components/RotaPrivada';
import { LoginPage } from '@/features/autenticacao/LoginPage';
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
          { path: '/estoque', element: <PaginaPlaceholder titulo="Estoque" /> },
          { path: '/compras', element: <PaginaPlaceholder titulo="Compras" /> },
          { path: '/cotacoes', element: <PaginaPlaceholder titulo="Cotacoes" /> },
          { path: '/contratos', element: <PaginaPlaceholder titulo="Contratos" /> },
          { path: '/usuarios', element: <PaginaPlaceholder titulo="Usuarios" /> },
          {
            path: '/configuracoes',
            element: <PaginaPlaceholder titulo="Configuracoes" />,
          },
        ],
      },
    ],
  },
]);
