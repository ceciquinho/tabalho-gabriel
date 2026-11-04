-- Execute no SQL Editor do Supabase.
create table if not exists public.receitas (
  id uuid primary key default gen_random_uuid(),
  descricao text not null,
  valor numeric(12,2) not null check (valor > 0),
  categoria text not null check (categoria in ('Salário', 'Freelance', 'Investimentos', 'Outros')),
  data date not null,
  user_id uuid not null references auth.users(id) on delete cascade
);

create table if not exists public.despesas (
  id uuid primary key default gen_random_uuid(),
  descricao text not null,
  valor numeric(12,2) not null check (valor > 0),
  categoria text not null check (categoria in ('Alimentação', 'Transporte', 'Moradia', 'Educação', 'Lazer', 'Saúde', 'Outros')),
  data date not null,
  user_id uuid not null references auth.users(id) on delete cascade
);

alter table public.receitas enable row level security;
alter table public.despesas enable row level security;

drop policy if exists "Usuário gerencia próprias receitas" on public.receitas;
create policy "Usuário gerencia próprias receitas" on public.receitas
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Usuário gerencia próprias despesas" on public.despesas;
create policy "Usuário gerencia próprias despesas" on public.despesas
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists receitas_user_data_idx on public.receitas(user_id, data desc);
create index if not exists despesas_user_data_idx on public.despesas(user_id, data desc);
