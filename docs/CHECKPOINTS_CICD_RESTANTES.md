# Checkpoints restantes de CI/CD

Este documento parte do estado atual da pipeline:

- Checkpoint 1 concluido: higiene inicial do CI, cache npm, build e testes em modo CI.
- Checkpoint 2 concluido: jobs separados para `shared`, `frontend` e `backend`.
- Checkpoint 3 concluido: frontend com lint, build, testes e artefato `frontend-dist`.
- Checkpoint 4 concluido: backend com lint sem `--fix`, build, testes unitarios/e2e e artefato `backend-dist`.
- Checkpoint 5 preparado: CI sem conexao ao Supabase em testes, envs seguros no job `Backend` e documentacao de secrets em `docs/CONFIGURACAO_CICD_SUPABASE.md`.
- Checkpoint 6 preparado: frontend usa `VITE_API_URL`, possui `frontend/.env.example` e documentacao em `docs/CONFIGURACAO_DEPLOY_FRONTEND.md`.

## Checkpoint 5: Banco e variaveis de ambiente


Status: preparado para o estado atual. O banco esta no Supabase online, mas lint/build/test nao conectam nele. Ver detalhes em docs/CONFIGURACAO_CICD_SUPABASE.md.

Objetivo: preparar CI/CD para usar configuracoes sensiveis sem versionar segredos.

Tarefas:

- Mapear variaveis usadas pelo backend:
  - `DATABASE_URL` ou `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME`
  - `DB_SSL`
  - `JWT_SECRET`
  - `JWT_EXPIRES_IN`
  - `FRONTEND_URL`
- Confirmar variaveis futuras do frontend, por exemplo URL publica da API.
- Revisar `backend/.env.example` e manter apenas valores ficticios.
- Garantir que `.env` e `.env.*` continuam ignorados no Git.
- Decidir se os testes e2e do backend precisam de PostgreSQL real no GitHub Actions.
- Se precisarem de banco, adicionar um service container PostgreSQL ao job `Backend`.
- Se nao precisarem de banco, documentar envs minimos usados apenas para build/test.
- Decidir politica de migrations:
  - nao rodar migrations no CI;
  - rodar migrations somente em staging;
  - rodar migrations em producao manualmente;
  - rodar migrations em producao automaticamente antes do deploy.

Exemplo de service container, caso seja necessario:

```yaml
services:
  postgres:
    image: postgres:16
    env:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: ipe_crm_test
    ports:
      - 5432:5432
    options: >-
      --health-cmd pg_isready
      --health-interval 10s
      --health-timeout 5s
      --health-retries 5
```

## Checkpoint 6: Deploy do frontend

Status: preparado parcialmente. O frontend esta pronto para receber a URL publica da API via `VITE_API_URL`. Falta escolher a plataforma de hospedagem para criar o deploy real.

Objetivo: publicar o artefato `frontend-dist` em uma plataforma de hospedagem.

Tarefas:

- Escolher plataforma:
  - Vercel;
  - Netlify;
  - GitHub Pages;
  - S3 + CloudFront;
  - outro provedor.
- Definir se o deploy sera feito pelo GitHub Actions ou pela integracao nativa da plataforma.
- Configurar variaveis de ambiente do frontend.
- Ajustar o frontend para nao depender de `http://localhost:3001` em producao.
- Se necessario, introduzir `VITE_API_URL` ou equivalente.
- Criar job `deploy-frontend` dependendo do job `frontend`.
- Baixar o artefato `frontend-dist` com `actions/download-artifact`.
- Publicar a pasta baixada.
- Validar URL publica apos deploy.

Exemplo conceitual:

```yaml
deploy-frontend:
  name: Deploy Frontend
  runs-on: ubuntu-latest
  needs: frontend
  steps:
    - name: Download frontend artifact
      uses: actions/download-artifact@v4
      with:
        name: frontend-dist
        path: frontend-dist
```

## Checkpoint 7: Deploy do backend

Objetivo: publicar a API NestJS em uma plataforma de runtime Node.js.

Tarefas:

- Escolher plataforma:
  - Render;
  - Railway;
  - Fly.io;
  - AWS;
  - VPS;
  - Docker em servidor proprio;
  - outro provedor.
- Definir comando de build:
  - `npm run build --workspace=backend`
- Definir comando de start:
  - `npm run start:prod --workspace=backend`
- Configurar secrets/envs de producao na plataforma:
  - banco PostgreSQL/Supabase;
  - JWT;
  - CORS/`FRONTEND_URL`;
  - porta, se aplicavel.
- Criar job `deploy-backend` dependendo do job `backend`.
- Baixar o artefato `backend-dist` se o deploy usar artefatos do GitHub Actions.
- Decidir como empacotar dependencias de producao.
- Definir estrategia de migrations antes/depois do deploy.
- Criar health check apos o deploy.

## Checkpoint 8: Estrategia de ambientes

Objetivo: separar fluxo de CI, staging e producao.

Tarefas:

- Manter `push` em `main` como gatilho principal enquanto houver apenas um desenvolvedor.
- Definir se futuramente havera `pull_request`.
- Definir ambientes do GitHub Actions:
  - `staging`;
  - `production`.
- Definir quando cada deploy acontece:
  - todo push na `main` para staging;
  - tag/release para producao;
  - aprovacao manual para producao.
- Usar GitHub Environments para proteger secrets de producao.
- Nomear claramente jobs de deploy por ambiente.

Exemplo conceitual:

```yaml
environment: production
```

## Checkpoint 9: Observabilidade e seguranca

Objetivo: tornar a pipeline mais confiavel depois do deploy.

Tarefas:

- Adicionar health check da API apos deploy.
- Adicionar smoke test simples contra o frontend publicado.
- Configurar alertas/logs na plataforma escolhida.
- Ativar Dependabot para dependencias npm.
- Ativar Dependabot para GitHub Actions.
- Revisar permissoes do workflow com `permissions:` quando houver deploy.
- Garantir que secrets nao aparecem em logs.
- Avaliar branch protection quando fizer sentido.

Exemplo de health check:

```yaml
- name: Check API health
  run: curl --fail https://sua-api.exemplo.com/api/v1
```

## Checkpoint 10: Limpeza e documentacao final

Objetivo: deixar o projeto facil de manter por outra maquina ou outro ambiente.

Tarefas:

- Atualizar documentacao que menciona MySQL, pois o backend esta configurado para PostgreSQL/Supabase.
- Documentar comandos principais:
  - instalar dependencias;
  - rodar frontend;
  - rodar backend;
  - rodar testes;
  - rodar migrations.
- Documentar variaveis obrigatorias por ambiente.
- Documentar como configurar secrets no GitHub.
- Documentar como fazer deploy manual emergencial, se houver.
- Confirmar que `node_modules`, `dist`, `coverage` e `.env` seguem fora do Git.
- Fazer uma execucao completa da pipeline no GitHub Actions.
- Corrigir qualquer diferenca entre Windows local e Linux do runner.

## Ordem sugerida

1. Checkpoint 5: confirmar envs, banco e migrations.
2. Checkpoint 6: escolher e plugar deploy do frontend.
3. Checkpoint 7: escolher e plugar deploy do backend.
4. Checkpoint 8: formalizar staging/producao.
5. Checkpoint 9: adicionar health checks e seguranca.
6. Checkpoint 10: fechar documentacao e limpar divergencias.
