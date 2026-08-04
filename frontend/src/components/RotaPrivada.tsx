import type { Perfil } from '@ipe_crm/shared';
import { Navigate, Outlet } from 'react-router-dom';
import { useAutenticacaoStore } from '@/store/autenticacao.store';

interface RotaPrivadaProps {
  perfis?: Perfil[];
}

export function RotaPrivada({ perfis }: RotaPrivadaProps) {
  const autenticado = useAutenticacaoStore((state) => state.autenticado);
  const usuario = useAutenticacaoStore((state) => state.usuario);

  if (!autenticado) {
    return <Navigate to="/login" replace />;
  }

  if (perfis?.length && (!usuario?.perfil || !perfis.includes(usuario.perfil))) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
