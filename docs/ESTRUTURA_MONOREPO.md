# IPÊ CRM — Estrutura do monorepo (documentação interna)

Este documento descreve **onde fica cada parte do projeto**, **por que existem arquivos na raiz** e **como dependências e Git hooks se organizam**. Destina-se à equipe Ipê (onboarding e alinhamento técnico).

---

## 1. Visão geral

O repositório **ipe_crm** é um **monorepo** gerido com **npm workspaces**: um único `package.json` na raiz referencia vários pacotes internos (`workspaces`). Um `npm install` na raiz instala e liga todos os pacotes.

| Pacote (npm)      | Pasta              | Papel |
|-------------------|--------------------|--------|
| `ipe_crm`         | raiz do repositório | Orquestra workspaces, scripts agregados, qualidade (ESLint/Prettier/Husky). |
| `@ipe_crm/web`    | `frontend/`        | Interface (React + Vite + TypeScript + Tailwind). |
| `@ipe_crm/api`    | `backend/`         | API (NestJS + TypeORM + MySQL). |
| `@ipe_crm/shared` | `packages/shared/` | Código compartilhado (tipos e constantes de negócio). |

---

## 2. Árvore conceitual (o que fica onde)

```
ipe_crm/
├── package.json              # workspaces + scripts da raiz
├── package-lock.json
├── tsconfig.base.json        # TypeScript base (estendido pelos pacotes)
├── .eslintrc.base.json       # ESLint base (referência dos pacotes)
├── .prettierrc / .prettierignore
├── lint-staged.config.js     # o que roda no pre-commit (staged files)
├── .gitignore
├── .husky/                   # hooks Git (ex.: pre-commit)
├── docs/                     # documentação interna (este arquivo)
├── frontend/                 # @ipe_crm/web
├── backend/                  # @ipe_crm/api
└── packages/
    └── shared/               # @ipe_crm/shared
```

Pastas como `node_modules/` e artefatos de build (`dist/`, `build/`) aparecem conforme o `.gitignore`; não precisam ser listadas aqui.

---

## 3. Por que há arquivos “fora” de `frontend/` e `backend/`?

A **raiz do Git** é o **contrato do monorepo**:

- Um repositório, um fluxo de instalação, hooks e padrões comuns.
- Configurações **transversais** (Prettier, base TS/ESLint, lint-staged, Husky) servem **todos** os workspaces; por isso ficam na raiz, não duplicadas dentro de cada app.

Isso **não mistura** o código de negócio da web com o da API: o código de cada app continua em `frontend/src` e `backend/src`. A raiz só centraliza **ferramentas e políticas** do repositório.

---

## 4. `frontend/` — `@ipe_crm/web`

- **Stack:** React, Vite, TypeScript, Tailwind, TanStack Query, React Hook Form, Zod, Zustand, Axios, React Router (conforme `frontend/package.json`).
- **Dev:** servidor Vite em **http://localhost:3000**; proxy **`/api` → http://localhost:3001** (requisições do browser para a API passam pelo Vite em desenvolvimento).
- **Aliases:** `@/*` → `frontend/src/*`; `@ipe_crm/shared` → fontes em `packages/shared/src` (via `vite.config.ts` e `tsconfig.json`), para desenvolvimento ágil sem publicar pacote no npm.

---

## 5. `backend/` — `@ipe_crm/api`

- **Stack:** NestJS, TypeORM, MySQL, validação global (`ValidationPipe`), `ConfigModule`, prefixo global **`api/v1`**.
- **Porta:** `PORT` no `.env` (padrão **3001**). CORS alinhado a `FRONTEND_URL` (padrão `http://localhost:3000`).
- **Banco:** variáveis `DB_*` no `.env`; **não** versionar `.env` (está no `.gitignore`). Usar **`backend/.env.example`** como modelo para novos ambientes.
- **Migrations:** TypeORM com `synchronize: false`; scripts `migration:*` no `package.json` do backend apontam para `src/config/data-source.ts`.

---

## 6. `packages/` — pacotes internos

### `packages/shared/` — `@ipe_crm/shared`

- **Função:** tipos e constantes de **domínio** compartilhados entre web e API (ex.: perfis, respostas padronizadas).
- **Consumo:** o backend declara `"@ipe_crm/shared": "*"` e usa o artefato compilado em `dist/` após `npm run build` no shared (há script `prepare` que compila na instalação). O frontend pode continuar apontando o alias para **fontes** em `src` durante o desenvolvimento com Vite.
- **Nome `@ipe_crm/...`:** é o **escopo npm** do pacote interno, **não** é uma pasta chamada `@` no disco.

Não confundir com o alias **`@/`** do frontend, que é só atalho para `frontend/src`.

---

## 7. Dependências: estão “separadas”?

**Sim, na declaração.** Cada workspace tem seu próprio `package.json`:

- Só o **frontend** declara React, Vite, Tailwind, etc.
- Só o **backend** declara Nest, TypeORM, `mysql2`, etc.
- Só o **shared** declara o mínimo para compilar e passar lint (TypeScript, ESLint, Prettier).

**No disco**, o npm workspaces pode **elevar (hoist)** dependências para `node_modules/` na **raiz** para deduplicar. Isso é esperado: continua valendo o `package.json` de cada pasta como fonte de verdade do que cada app **precisa** e **pode importar**.

A **raiz** declara apenas dependências de **tooling do monorepo** (Husky, lint-staged, ESLint/Prettier/TypeScript usados de forma transversal), não a stack de produção da web ou da API.

---

## 8. `.husky/` e qualidade

- **Husky:** pasta onde ficam os **hooks do Git** (por exemplo `.husky/pre-commit`).
- **lint-staged:** definido em `lint-staged.config.js` na raiz; no pre-commit roda **ESLint --fix** e **Prettier --write** em arquivos `.ts` / `.tsx` **staged**.
- **Scripts agregados** (na raiz): `npm run lint`, `npm run format`, `npm run build` percorrem os workspaces que expõem esses scripts.

---

## 9. Comandos úteis (a partir da raiz `ipe_crm/`)

| Comando | Efeito |
|---------|--------|
| `npm install` | Instala todas as dependências dos workspaces e prepara hooks (Husky) e build do shared quando aplicável. |
| `npm run dev:web` | Sobe o frontend (Vite) na porta 3000. |
| `npm run dev:api` | Sobe a API Nest em modo watch (porta conforme `.env`). |
| `npm run lint` | ESLint em cada workspace que define o script. |
| `npm run format` | Prettier em cada workspace que define o script. |
| `npm run build` | Build de cada workspace que define o script. |

---

## 10. Convenção de nomenclatura (Ipê)

- **Português:** módulos de negócio, entidades, tabelas, rotas e enums de domínio.
- **Inglês:** termos de framework e ecossistema (componentes React, pipes Nest, etc.), salvo alinhamento explícito do time.

---

## 11. Manutenção deste documento

Ao adicionar um novo workspace em `package.json` da raiz, **atualize a tabela da seção 1** e, se fizer sentido, acrescente uma subseção em **§2–6**. Ao mudar portas, proxy ou prefixo da API, ajuste **§4** e **§5**.
