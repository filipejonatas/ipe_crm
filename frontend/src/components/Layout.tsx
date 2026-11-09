import type { Perfil } from '@ipe_crm/shared';
import { PERFIS } from '@ipe_crm/shared';
import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Icone, type NomeIcone } from '@/components/Icone';
import { useAutenticacaoStore } from '@/store/autenticacao.store';

interface MenuItem {
  nome: string;
  caminho: string;
  icone: NomeIcone;
  perfis: Perfil[];
}

const menus: MenuItem[] = [
  {
    nome: 'Trocas de óleo',
    caminho: '/trocas-oleo',
    icone: 'oleo',
    perfis: [PERFIS.ADMIN, PERFIS.OFICINA],
  },
  {
    nome: 'Filtros/Veículos',
    caminho: '/compatibilidade',
    icone: 'compatibilidade',
    perfis: [PERFIS.ADMIN, PERFIS.OFICINA],
  },
  {
    nome: 'Estoque',
    caminho: '/estoque',
    icone: 'estoque',
    perfis: [PERFIS.ADMIN, PERFIS.OFICINA, PERFIS.COMPRAS, PERFIS.GERENTE],
  },
  {
    nome: 'Fornecedores',
    caminho: '/fornecedores',
    icone: 'fornecedor',
    perfis: [PERFIS.ADMIN, PERFIS.COMPRAS, PERFIS.ADMINISTRATIVO, PERFIS.GERENTE],
  },
  {
    nome: 'Veículos',
    caminho: '/veiculos',
    icone: 'veiculo',
    perfis: [PERFIS.ADMIN, PERFIS.OFICINA, PERFIS.COMPRAS, PERFIS.GERENTE],
  },
  {
    nome: 'Manutenções',
    caminho: '/manutencoes',
    icone: 'manutencao',
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

  const larguraDesktop = menuExpandido ? 'md:w-64' : 'md:w-20';
  const recuoConteudo = menuExpandido ? 'md:pl-64' : 'md:pl-20';

  return (
    <div className="min-h-screen bg-concreto text-grafite">
      {menuAberto ? (
        <button
          aria-label="Fechar menu"
          className="fixed inset-0 z-30 bg-grafite/40 md:hidden"
          type="button"
          onClick={fecharMenuMobile}
        />
      ) : null}

      <aside
        className={[
          'fixed inset-y-0 left-0 z-40 flex w-64 -translate-x-full flex-col bg-grafite p-4 text-concreto transition-all duration-200 md:translate-x-0',
          menuAberto ? 'translate-x-0' : '',
          larguraDesktop,
          menuExpandido ? 'md:p-4' : 'md:p-3',
        ].join(' ')}
      >
        <div
          className={[
            'flex items-center gap-2',
            menuExpandido ? '' : 'md:justify-center md:gap-0',
          ].join(' ')}
        >
          <button
            aria-label={menuExpandido ? 'Recolher menu lateral' : 'Expandir menu lateral'}
            className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-md text-grafite-300 transition-colors hover:bg-grafite-700 hover:text-white focus-visible:outline-ipe md:flex"
            title={menuExpandido ? 'Recolher menu' : 'Expandir menu'}
            type="button"
            onClick={() => setMenuExpandido((valor) => !valor)}
          >
            <Icone className="h-5 w-5" nome={menuExpandido ? 'recolherMenu' : 'expandirMenu'} />
          </button>
          <button
            aria-label="Fechar menu"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-grafite-300 transition-colors hover:bg-grafite-700 hover:text-white focus-visible:outline-ipe md:hidden"
            type="button"
            onClick={fecharMenuMobile}
          >
            <Icone className="h-5 w-5" nome="fechar" />
          </button>
          <NavLink
            className={[
              'truncate text-xl font-bold tracking-tight text-white [font-stretch:87.5%]',
              menuExpandido ? '' : 'md:hidden',
            ].join(' ')}
            to="/"
            onClick={fecharMenuMobile}
          >
            Ipê CRM
          </NavLink>
        </div>

        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {menusVisiveis.map((menu) => (
            <NavLink
              aria-label={menu.nome}
              className={({ isActive }) =>
                [
                  'flex min-h-10 items-center gap-3 rounded-md text-sm font-medium transition-colors focus-visible:outline-ipe',
                  menuExpandido ? 'px-3 py-2' : 'justify-center px-0 py-2',
                  isActive
                    ? 'bg-grafite-700 text-white shadow-[inset_3px_0_0_theme(colors.ipe.DEFAULT)]'
                    : 'text-grafite-300 hover:bg-grafite-700/60 hover:text-white',
                ].join(' ')
              }
              key={menu.caminho}
              title={menu.nome}
              to={menu.caminho}
              onClick={fecharMenuMobile}
            >
              <Icone className="h-5 w-5 shrink-0" nome={menu.icone} />
              <span className={menuExpandido ? 'truncate' : 'truncate md:hidden'}>{menu.nome}</span>
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-grafite-700 pt-4">
          <div className={menuExpandido ? '' : 'md:hidden'}>
            <p className="truncate text-sm font-medium text-white">{usuario?.nome}</p>
            <p className="truncate text-xs capitalize text-grafite-300">
              {usuario?.perfil?.toLowerCase()}
            </p>
          </div>
          <button
            aria-label="Sair"
            className={[
              'mt-4 flex h-10 w-full items-center justify-center rounded-md border border-grafite-500 text-sm font-medium text-grafite-300 transition-colors hover:border-grafite-300 hover:text-white focus-visible:outline-ipe',
              menuExpandido ? 'px-3' : 'px-0',
            ].join(' ')}
            title="Sair"
            type="button"
            onClick={sair}
          >
            {menuExpandido ? 'Sair' : <Icone className="h-5 w-5" nome="sair" />}
          </button>
        </div>
      </aside>

      <div className={['transition-all duration-200', recuoConteudo].join(' ')}>
        <header className="flex items-center justify-between bg-grafite px-4 py-3 text-concreto md:hidden">
          <div className="flex items-center gap-3">
            <button
              aria-label="Abrir menu"
              className="flex h-9 w-9 items-center justify-center rounded-md text-grafite-300 transition-colors hover:bg-grafite-700 hover:text-white focus-visible:outline-ipe"
              type="button"
              onClick={() => setMenuAberto(true)}
            >
              <Icone className="h-5 w-5" nome="menu" />
            </button>
            <NavLink className="font-bold tracking-tight text-white [font-stretch:87.5%]" to="/">
              Ipê CRM
            </NavLink>
          </div>
          <button
            className="text-sm font-medium text-grafite-300 hover:text-white"
            type="button"
            onClick={sair}
          >
            Sair
          </button>
        </header>

        <main className="px-4 py-8 sm:px-6 lg:px-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
