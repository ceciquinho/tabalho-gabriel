# Controle Financeiro

Aplicativo responsivo construído com Ionic Vue, Vue 3 Composition API, TypeScript, Supabase Auth/Postgres e Vue ApexCharts.

## Configuração

1. Instale Node.js (20 ou superior) e dependências com `npm install`.
2. Crie um projeto Supabase e execute [`supabase/schema.sql`](supabase/schema.sql) no SQL Editor.
3. Copie `.env.example` para `.env` e preencha `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` com os dados de Project Settings → API.
4. Execute `npm run dev` para desenvolvimento ou `npm run build` para gerar a versão de produção em `dist/`.

A URL e a chave anon são utilizadas no cliente. Nunca coloque a `service_role` no aplicativo. A sessão é persistida pelo Supabase Auth. Se a confirmação de e-mail estiver ativa, confirme o cadastro antes de entrar.

## Funcionalidades

- Cadastro e login via Supabase Auth, sessão persistente e logout.
- CRUD de receitas e despesas com validação e confirmação antes de excluir.
- Dashboard com totais, saldo, maior categoria, número de lançamentos e percentual de despesas, além de gráficos por categoria e mês.
- Atualização do dashboard ao carregar e via Supabase Realtime; alterações feitas pelo próprio app também são refletidas após salvar.
- RLS limita operações ao `user_id` do usuário autenticado. O script cria as tabelas e políticas necessárias.

## Git e GitHub

Para versionar, use `git init`, `git add .`, `git commit -m "Implementa controle financeiro"` e conecte o repositório GitHub com `git remote add origin <url>` e `git push -u origin main`. O arquivo `.env` não deve ser enviado ao repositório.
