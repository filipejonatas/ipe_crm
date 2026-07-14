# Configuracao de deploy do frontend

O frontend e uma aplicacao React/Vite. O build gera arquivos estaticos em `frontend/dist`.

## Estado atual

- O CI ja gera o artefato `frontend-dist` usando `actions/upload-artifact`.
- O frontend nao depende mais de `http://localhost:3001` fixo no codigo.
- A URL da API agora vem de `VITE_API_URL`.
- Ainda falta escolher a plataforma de hospedagem para implementar o job real de deploy.

## Configuracao recomendada na Vercel

Ao importar o repositorio na Vercel, use o projeto a partir da raiz do monorepo. O arquivo `vercel.json` define:

```json
{
  "framework": "vite",
  "installCommand": "npm ci",
  "buildCommand": "npm run build --workspace=frontend",
  "outputDirectory": "frontend/dist"
}
```

A regra de `rewrites` tambem esta configurada para suportar rotas do React Router, como `/login` e `/estoque`, apontando para `/index.html`.
## Variavel obrigatoria

Configure esta variavel na plataforma de deploy do frontend:

```env
VITE_API_URL=https://sua-api-publica.example.com
```

Para desenvolvimento local, o fallback do codigo continua sendo:

```env
VITE_API_URL=http://localhost:3001
```

Tambem ha um exemplo em `frontend/.env.example`.

## Onde configurar por plataforma

### Vercel

- Project Settings > Environment Variables
- Adicionar `VITE_API_URL`
- Build command: `npm run build --workspace=frontend`
- Output directory: `frontend/dist`

### Netlify

- Site configuration > Environment variables
- Adicionar `VITE_API_URL`
- Build command: `npm run build --workspace=frontend`
- Publish directory: `frontend/dist`

### GitHub Actions com artefato

Se o deploy for feito pelo GitHub Actions, o job de deploy deve:

1. depender do job `frontend`;
2. baixar o artefato `frontend-dist`;
3. publicar os arquivos na plataforma escolhida.

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

## Observacao sobre build

Variaveis `VITE_*` sao embutidas no build do Vite. Isso significa que a URL correta da API precisa estar configurada antes do comando de build da versao que sera publicada.

## Proximo passo

Escolher a plataforma de deploy. Depois disso, implementar o job `deploy-frontend` ou configurar a integracao nativa da plataforma.