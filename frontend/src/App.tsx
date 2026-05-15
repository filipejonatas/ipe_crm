import type { Perfil } from '@ipe_crm/shared';
import { PERFIS } from '@ipe_crm/shared';

const perfilExemplo: Perfil = PERFIS.ADMIN;

export default function App() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <p className="text-2xl font-semibold text-slate-900">IPÊ CRM</p>
      <span className="sr-only">Perfil de referência: {perfilExemplo}</span>
    </div>
  );
}
