import type { Perfil } from '@ipe_crm/shared';
import { PERFIS } from '@ipe_crm/shared';
import { useState } from 'react';
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
    perfis: [PERFIS.ADMIN, PERFIS.OFICINA, PERFIS.COMPRAS, PERFIS.GERENTE],
  },
  {
    nome: 'Fornecedores',
    caminho: '/fornecedores',
    perfis: [PERFIS.ADMIN, PERFIS.COMPRAS, PERFIS.ADMINISTRATIVO, PERFIS.GERENTE],
  },
  {
    nome: 'Veículos',
    caminho: '/veiculos',
    perfis: [PERFIS.ADMIN, PERFIS.OFICINA, PERFIS.COMPRAS, PERFIS.GERENTE],
  },
  {
    nome: 'Manutenções',
    caminho: '/manutencoes',
    perfis: [PERFIS.ADMIN, PERFIS.OFICINA],
  },
];

export function Layout() {
  const navigate = useNavigate();
  const usuario = useAutenticacaoStore((state) => state.usuario);
  const logout = useAutenticacaoStore((state) => state.logout);
  const [menuAberto, setMenuAberto] = useState(false);
  const [menuExpandido, setMenuExpandido] = useState(true);
  const menusVisiveis = menus.filter(
    (menu) => usuario?.perfil && menu.perfis.includes(usuario.perfil),
  );

  function sair() {
    logout();
    navigate('/login');
  }

  function fecharMenuMobile() {
    setMenuAberto(false);
  }

  const larguraDesktop = menuExpandido ? 'md:w-64' : 'md:w-16';
  const recuoConteudo = menuExpandido ? 'md:pl-64' : 'md:pl-16';

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-950">
      {menuAberto ? (
        <button
          aria-label="Fechar menu"
          className="fixed inset-0 z-30 bg-zinc-950/30 md:hidden"
          type="button"
          onClick={fecharMenuMobile}
        />
      ) : null}

      <aside
        className={[
          'fixed inset-y-0 left-0 z-40 flex w-64 -translate-x-full flex-col border-r border-zinc-200 bg-white p-4 transition-all duration-200 md:translate-x-0',
          menuAberto ? 'translate-x-0 shadow-xl' : '',
          larguraDesktop,
        ].join(' ')}
      >
        <div className="flex items-center gap-2">
          <button
            aria-label={menuExpandido ? 'Recolher menu lateral' : 'Expandir menu lateral'}
            className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-md border border-zinc-300 text-zinc-700 transition hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-200 md:flex"
            title={menuExpandido ? 'Recolher menu' : 'Expandir menu'}
            type="button"
            onClick={() => setMenuExpandido((valor) => !valor)}
          >
            <svg
              aria-hidden="true"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M4 6h16" />
              <path d="M4 12h16" />
              <path d="M4 18h16" />
            </svg>
          </button>
          <button
            aria-label="Fechar menu"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-zinc-300 text-zinc-700 transition hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-200 md:hidden"
            type="button"
            onClick={fecharMenuMobile}
          >
            <svg
              aria-hidden="true"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M4 6h16" />
              <path d="M4 12h16" />
              <path d="M4 18h16" />
            </svg>
          </button>
          <NavLink
            className={[
              'truncate text-xl font-semibold text-emerald-800',
              menuExpandido ? '' : 'md:hidden',
            ].join(' ')}
            to="/"
            onClick={fecharMenuMobile}
          >
            IPE CRM
          </NavLink>
          {!menuExpandido ? (
            <NavLink
              aria-label="IPE CRM"
              className="hidden text-lg font-semibold text-emerald-800 md:block"
              title="IPE CRM"
              to="/"
            >
              IPE CRM
            </NavLink>
          ) : null}
        </div>

        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {menusVisiveis.map((menu) => (
            <NavLink
              aria-label={menu.nome}
              className={({ isActive }) =>
                [
                  'flex min-h-10 items-center rounded-md text-sm font-medium transition',
                  menuExpandido ? 'px-3 py-2' : 'justify-center px-0 py-2',
                  isActive
                    ? 'bg-emerald-50 text-emerald-800'
                    : 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950',
                ].join(' ')
              }
              key={menu.caminho}
              title={menu.nome}
              to={menu.caminho}
              onClick={fecharMenuMobile}
            >
              <span className={menuExpandido ? 'truncate' : 'truncate md:hidden'}>{menu.nome}</span>
              {!menuExpandido ? (
                <span className="hidden md:inline">{menu.nome.charAt(0)}</span>
              ) : null}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-zinc-200 pt-4">
          <div className={menuExpandido ? '' : 'md:hidden'}>
            <p className="truncate text-sm font-medium text-zinc-950">{usuario?.nome}</p>
            <p className="truncate text-xs text-zinc-500">{usuario?.perfil}</p>
          </div>
          <button
            aria-label="Sair"
            className={[
              'mt-4 flex h-10 w-full items-center justify-center rounded-md border border-zinc-300 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-200',
              menuExpandido ? 'px-3' : 'px-0',
            ].join(' ')}
            title="Sair"
            type="button"
            onClick={sair}
          >
            {menuExpandido ? (
              'Sair'
            ) : (
              <svg
                aria-hidden="true"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <path d="M16 17l5-5-5-5" />
                <path d="M21 12H9" />
              </svg>
            )}
          </button>
        </div>
      </aside>

      <div className={['transition-all duration-200', recuoConteudo].join(' ')}>
        <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-3 md:hidden">
          <div className="flex items-center gap-3">
            <button
              aria-label="Abrir menu"
              className="flex h-9 w-9 items-center justify-center rounded-md border border-zinc-300 text-zinc-700 transition hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              type="button"
              onClick={() => setMenuAberto(true)}
            >
              <svg
                aria-hidden="true"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M4 6h16" />
                <path d="M4 12h16" />
                <path d="M4 18h16" />
              </svg>
            </button>
            <NavLink className="font-semibold text-emerald-800" to="/">
              IPE CRM
            </NavLink>
          </div>
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
