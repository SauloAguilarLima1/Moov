# Moov — Finanças pessoais

App web de finanças pessoais (multiusuário) inspirado na estrutura do Organizze, com identidade
visual **azul marinho premium**. Cada usuário cria sua conta e enxerga **só os próprios dados**
(isolamento por `user_id` via Row Level Security no Supabase).

- **Frontend:** React + Vite + TypeScript (SPA estática, hospedada no GitHub Pages).
- **Backend/dados:** Supabase (Postgres + Auth + RLS).
- **Design:** ver [`SYSTEM-DESIGN.md`](./SYSTEM-DESIGN.md) e [`REGRAS-FRONTEND.md`](./REGRAS-FRONTEND.md).

## Telas

- **Landing/Login** — entrar e criar conta (e-mail + senha).
- **Dashboard** — saldo geral, contas, cartões, gastos do mês.
- **Fluxo de caixa** — lançamentos por mês, com entradas/saídas/saldo.
- **Relatórios** — Categorias (rosca), Balanço (barras) e Tags (ranking).
- **Perfil** — editar perfil, gerenciar Contas/Cartões/Categorias/Tags, exportar CSV, sair.

## Rodar localmente

```bash
npm install
npm run dev
```

As credenciais do Supabase (URL + anon key) já vêm em `src/lib/config.ts`. A anon key é **pública
por design** — a proteção real é a RLS no banco. Para sobrescrever em dev, copie `.env.example` para
`.env`.

## Build e deploy

`npm run build` gera a pasta `dist/`. O deploy para o GitHub Pages é automático via GitHub Actions
(`.github/workflows/deploy.yml`) a cada push na branch `main`. O `base` do Vite é `/Moov/`
(nome do repositório).

## Banco de dados

Tabelas: `profiles`, `accounts`, `cards`, `categories`, `tags`, `transactions`, `transaction_tags`.
Todas com RLS por usuário. Ao criar uma conta, um trigger cria o perfil e 8 categorias padrão.
Valores monetários são guardados em **centavos** (inteiro).
