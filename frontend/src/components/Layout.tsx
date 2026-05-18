import type { Perfil } from '@ipe_crm/shared';
import { PERFIS } from '@ipe_crm/shared';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAutenticacaoStore } from '@/store/autenticacao.store';

interface MenuItem {
  nome: string;
  caminho: string;
  perfis: Perfil[];
}

const menus: MenuItem[] = [
  {
    nome: 'Estoque',
    caminho: '/estoque',
    perfis: [PERFIS.ADMIN, PERFIS.OFICINA, PERFIS.COMPRAS],
  },
  { nome: 'Compras', caminho: '/compras', perfis: [PERFIS.ADMIN, PERFIS.COMPRAS] },
  { nome: 'Cotacoes', caminho: '/cotacoes', perfis: [PERFIS.ADMIN, PERFIS.COMPRAS] },
  {
    nome: 'Contratos',
    caminho: '/contratos',
    perfis: [PERFIS.ADMIN, PERFIS.ADMINISTRATIVO, PERFIS.GERENTE],
  },
  { nome: 'Usuarios', caminho: '/usuarios', perfis: [PERFIS.ADMIN] },
  { nome: 'Configuracoes', caminho: '/configuracoes', perfis: [PERFIS.ADMIN] },
];

export function Layout() {
  const navigate = useNavigate();
  const usuario = useAutenticacaoStore((state) => state.usuario);
  const logout = useAutenticacaoStore((state) => state.logout);
  const menusVisiveis = menus.filter(
    (menu) => usuario?.perfil && menu.perfis.includes(usuario.perfil),
  );

  function sair() {
    logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-950">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-zinc-200 bg-white p-5 md:flex md:flex-col">
        <NavLink className="text-xl font-semibold text-emerald-800" to="/">
          IPE CRM
        </NavLink>

        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {menusVisiveis.map((menu) => (
            <NavLink
              className={({ isActive }) =>
                [
                  'rounded-md px-3 py-2 text-sm font-medium transition',
                  isActive
                    ? 'bg-emerald-50 text-emerald-800'
                    : 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950',
                ].join(' ')
              }
              key={menu.caminho}
              to={menu.caminho}
            >
              {menu.nome}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-zinc-200 pt-4">
          <p className="text-sm font-medium text-zinc-950">{usuario?.nome}</p>
          <p className="text-xs text-zinc-500">{usuario?.perfil}</p>
          <button
            className="mt-4 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
            type="button"
            onClick={sair}
          >
            Sair
          </button>
        </div>
      </aside>

      <div className="md:pl-64">
        <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-3 md:hidden">
          <NavLink className="font-semibold text-emerald-800" to="/">
            IPE CRM
          </NavLink>
          <button className="text-sm font-medium text-zinc-700" type="button" onClick={sair}>
            Sair
          </button>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
