import { Navigate, Outlet } from 'react-router-dom';
import { useAutenticacaoStore } from '@/store/autenticacao.store';

export function RotaPrivada() {
  const autenticado = useAutenticacaoStore((state) => state.autenticado);

  if (!autenticado) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
