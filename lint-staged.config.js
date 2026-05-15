/**
 * ESLint 9 usa flat config (`eslint.config.mjs`) por pasta de workspace.
 * Rodar `eslint` na raiz sem `--config` falha (não há eslint.config na raiz).
 */
module.exports = {
  'frontend/**/*.{ts,tsx}': [
    'eslint --fix --config frontend/eslint.config.mjs',
    'prettier --write',
  ],
  'backend/**/*.ts': [
    'eslint --fix --config backend/eslint.config.mjs',
    'prettier --write',
  ],
  'packages/shared/**/*.ts': [
    'eslint --fix --config packages/shared/eslint.config.mjs',
    'prettier --write',
  ],
};
