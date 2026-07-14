# Configuracao de CI/CD com Supabase

O banco do projeto esta no Supabase, ou seja, PostgreSQL online. A pipeline de CI atual nao deve conectar nesse banco para lint, build e testes, porque os testes e2e do backend usam controllers/services mockados e nao sobem o `AppModule` com TypeORM real.

## Decisao atual

- Nao usar service container PostgreSQL no GitHub Actions agora.
- Nao conectar o CI ao Supabase durante lint/build/test.
- Usar envs seguros de teste no job `Backend`.
- Guardar credenciais reais apenas em GitHub Secrets ou na plataforma de deploy.

## Envs de teste no CI

O job `Backend` usa valores nao sensiveis:

```yaml
NODE_ENV: test
PORT: 3001
FRONTEND_URL: http://localhost:3000
JWT_SECRET: ci-jwt-secret
JWT_EXPIRES_IN: 1h
DB_SSL: "false"
```

Esses valores existem para deixar o ambiente previsivel durante build/test. Eles nao representam producao.

## Secrets para cadastrar no GitHub quando houver deploy

Cadastre estes valores em `Settings > Secrets and variables > Actions` no repositorio GitHub, quando o deploy ou migrations passarem a usar Supabase:

| Secret | Uso |
| --- | --- |
| `SUPABASE_DATABASE_URL` | Connection string do banco PostgreSQL/Supabase. |
| `SUPABASE_DB_SSL` | Normalmente `true` para Supabase. |
| `JWT_SECRET` | Chave real para assinar tokens em producao/staging. |
| `JWT_EXPIRES_IN` | Tempo de expiracao do token, exemplo `8h`. |
| `FRONTEND_URL` | URL publica do frontend para CORS da API. |
| `API_URL` | URL publica da API, caso algum job de smoke test precise chamar a API. |

Tambem e possivel usar campos separados em vez de `SUPABASE_DATABASE_URL`:

| Secret | Uso |
| --- | --- |
| `SUPABASE_DB_HOST` | Host do pooler Supabase. |
| `SUPABASE_DB_PORT` | Porta do pooler, geralmente `6543`. |
| `SUPABASE_DB_USER` | Usuario, exemplo `postgres.<PROJECT_REF>`. |
| `SUPABASE_DB_PASS` | Senha do banco. |
| `SUPABASE_DB_NAME` | Nome do banco, normalmente `postgres`. |

Preferencia recomendada: usar `SUPABASE_DATABASE_URL`, porque reduz a quantidade de variaveis.

## Envs para deploy do backend

Na plataforma de deploy, a API precisa receber:

```env
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://seu-frontend.example.com
DATABASE_URL=postgresql://...
DB_SSL=true
JWT_SECRET=...
JWT_EXPIRES_IN=8h
```

Nunca versionar esses valores reais.

## Migrations

Ainda nao foi definido se migrations serao automaticas. Opcoes:

- Manual: executar `npm run migration:run --workspace=backend` conscientemente antes/depois do deploy.
- Staging automatico: rodar migrations somente em ambiente de staging.
- Producao com aprovacao: usar GitHub Environment com aprovacao manual antes de rodar migrations em producao.

Recomendacao inicial: nao rodar migrations automaticamente em producao ate o fluxo de deploy estar validado.

## Quando adicionar PostgreSQL no CI

Adicionar service container PostgreSQL apenas se surgirem testes de integracao que carreguem `AppModule`, TypeORM e repositories reais.

Enquanto os testes continuarem mockados, manter o CI sem banco deixa a pipeline mais rapida e evita tocar no Supabase online durante validacoes de codigo.