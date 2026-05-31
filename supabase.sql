create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  user_type text not null default 'individual' check (user_type in ('individual', 'company', 'real_estate_admin')),
  role text not null default 'user' check (role in ('user', 'real_estate_admin', 'admin')),
  city text,
  state text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profile_private_data (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  document_type text not null check (document_type in ('cpf', 'cnpj')),
  document_hash text not null,
  document_encrypted text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profile_contacts (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  whatsapp text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null,
  category text not null check (category in (
    'Apartamento',
    'Casa',
    'Terreno',
    'Sala comercial',
    'Ponto comercial',
    'Chácara',
    'Imóvel financiado',
    'Outro'
  )),
  condition text not null check (condition in (
    'Novo',
    'Pronto para morar',
    'Em construção',
    'Financiado',
    'Quitado',
    'Precisa reforma'
  )),
  state text not null default 'PB',
  city text not null,
  neighborhood text not null,
  trade_preferences text not null,
  status text not null default 'available' check (status in ('available', 'traded', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.item_images (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items(id) on delete cascade,
  storage_path text not null,
  public_url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.item_private_locations (
  item_id uuid primary key references public.items(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  street text not null,
  number text not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.exchange_proposals (
  id uuid primary key default gen_random_uuid(),
  requested_item_id uuid not null references public.items(id) on delete cascade,
  offered_item_id uuid not null references public.items(id) on delete cascade,
  requester_id uuid not null references public.profiles(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  cash_difference numeric(12, 2) not null default 0,
  cash_direction text not null default 'none' check (cash_direction in ('none', 'requester_pays', 'owner_pays')),
  message text,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected', 'cancelled', 'failed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint exchange_items_different check (requested_item_id <> offered_item_id),
  constraint exchange_users_different check (requester_id <> owner_id)
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  target_type text not null check (target_type in ('item', 'user')),
  target_item_id uuid references public.items(id) on delete set null,
  target_user_id uuid references public.profiles(id) on delete set null,
  reason text not null,
  status text not null default 'open' check (status in ('open', 'reviewed', 'dismissed')),
  created_at timestamptz not null default now()
);

create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.real_estate_agencies (
  id uuid primary key default gen_random_uuid(),
  legal_name text not null,
  trade_name text not null,
  cnpj_hash text,
  creci text,
  phone text,
  whatsapp text,
  email text,
  leads_email text,
  responsible_name text,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles
  add column if not exists user_type text not null default 'individual',
  add column if not exists role text not null default 'user',
  add column if not exists city text,
  add column if not exists state text;

alter table public.items
  add column if not exists state text not null default 'PB';

alter table public.items drop constraint if exists items_state_check;
alter table public.items
  add constraint items_state_check
  check (state in ('PB'));

alter table public.profiles drop constraint if exists profiles_user_type_check;
alter table public.profiles
  add constraint profiles_user_type_check
  check (user_type in ('individual', 'company', 'real_estate_admin'));

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check
  check (role in ('user', 'real_estate_admin', 'admin'));

alter table public.items drop constraint if exists items_category_check;
alter table public.items
  add constraint items_category_check
  check (category in (
    'Apartamento',
    'Casa',
    'Terreno',
    'Sala comercial',
    'Ponto comercial',
    'Chácara',
    'Imóvel financiado',
    'Outro',
    'Eletrônicos',
    'Roupas',
    'Livros',
    'Esporte',
    'Ferramentas',
    'Brinquedos',
    'Outros'
  ));

alter table public.items drop constraint if exists items_condition_check;
alter table public.items
  add constraint items_condition_check
  check (condition in (
    'Novo',
    'Pronto para morar',
    'Em construção',
    'Financiado',
    'Quitado',
    'Precisa reforma',
    'Muito bom',
    'Bom',
    'Usado',
    'Precisa reparo'
  ));

create index if not exists items_status_city_idx on public.items(status, city, neighborhood);
create index if not exists profile_private_document_hash_idx on public.profile_private_data(document_hash);
create index if not exists items_owner_idx on public.items(owner_id);
create index if not exists item_images_item_idx on public.item_images(item_id);
create index if not exists item_private_locations_owner_idx on public.item_private_locations(owner_id);
create index if not exists exchange_requester_idx on public.exchange_proposals(requester_id);
create index if not exists exchange_owner_idx on public.exchange_proposals(owner_id);
create index if not exists exchange_requested_item_idx on public.exchange_proposals(requested_item_id);
create index if not exists exchange_offered_item_idx on public.exchange_proposals(offered_item_id);
create index if not exists audit_events_actor_idx on public.audit_events(actor_id, created_at desc);
create index if not exists audit_events_entity_idx on public.audit_events(entity_type, entity_id);
create index if not exists real_estate_agencies_status_idx on public.real_estate_agencies(status);

insert into public.real_estate_agencies (
  legal_name,
  trade_name,
  creci,
  responsible_name,
  status
)
select
  'Imobiliária parceira inicial',
  'Imobiliária parceira inicial',
  'A informar',
  'Responsável pela intermediação',
  'active'
where not exists (
  select 1 from public.real_estate_agencies where status = 'active'
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists profile_contacts_set_updated_at on public.profile_contacts;
create trigger profile_contacts_set_updated_at
before update on public.profile_contacts
for each row execute function public.set_updated_at();

drop trigger if exists profile_private_data_set_updated_at on public.profile_private_data;
create trigger profile_private_data_set_updated_at
before update on public.profile_private_data
for each row execute function public.set_updated_at();

drop trigger if exists item_private_locations_set_updated_at on public.item_private_locations;
create trigger item_private_locations_set_updated_at
before update on public.item_private_locations
for each row execute function public.set_updated_at();

drop trigger if exists items_set_updated_at on public.items;
create trigger items_set_updated_at
before update on public.items
for each row execute function public.set_updated_at();

drop trigger if exists exchange_proposals_set_updated_at on public.exchange_proposals;
create trigger exchange_proposals_set_updated_at
before update on public.exchange_proposals
for each row execute function public.set_updated_at();

drop trigger if exists real_estate_agencies_set_updated_at on public.real_estate_agencies;
create trigger real_estate_agencies_set_updated_at
before update on public.real_estate_agencies
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.profile_private_data enable row level security;
alter table public.profile_contacts enable row level security;
alter table public.items enable row level security;
alter table public.item_images enable row level security;
alter table public.item_private_locations enable row level security;
alter table public.exchange_proposals enable row level security;
alter table public.reports enable row level security;
alter table public.audit_events enable row level security;
alter table public.real_estate_agencies enable row level security;

drop policy if exists "profiles public read" on public.profiles;
create policy "profiles public read"
  on public.profiles
  for select
  using (true);

drop policy if exists "profiles own insert" on public.profiles;
create policy "profiles own insert"
  on public.profiles
  for insert
  with check (id = auth.uid());

drop policy if exists "profiles own update" on public.profiles;
create policy "profiles own update"
  on public.profiles
  for update
  using (id = auth.uid())
  with check (id = auth.uid());

drop policy if exists "profile private own read" on public.profile_private_data;
create policy "profile private own read"
  on public.profile_private_data
  for select
  using (user_id = auth.uid());

drop policy if exists "profile private own insert" on public.profile_private_data;
create policy "profile private own insert"
  on public.profile_private_data
  for insert
  with check (user_id = auth.uid());

drop policy if exists "profile private own update" on public.profile_private_data;
create policy "profile private own update"
  on public.profile_private_data
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "contacts allowed read" on public.profile_contacts;
create policy "contacts allowed read"
  on public.profile_contacts
  for select
  using (
    user_id = auth.uid()
    or exists (
      select 1
      from public.exchange_proposals ep
      where ep.status = 'accepted'
        and (
          (ep.requester_id = auth.uid() and ep.owner_id = profile_contacts.user_id)
          or (ep.owner_id = auth.uid() and ep.requester_id = profile_contacts.user_id)
        )
    )
  );

drop policy if exists "contacts own insert" on public.profile_contacts;
create policy "contacts own insert"
  on public.profile_contacts
  for insert
  with check (user_id = auth.uid());

drop policy if exists "contacts own update" on public.profile_contacts;
create policy "contacts own update"
  on public.profile_contacts
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "items visible read" on public.items;
create policy "items visible read"
  on public.items
  for select
  using (
    status = 'available'
    or owner_id = auth.uid()
    or exists (
      select 1
      from public.exchange_proposals ep
      where (ep.requested_item_id = items.id or ep.offered_item_id = items.id)
        and (ep.requester_id = auth.uid() or ep.owner_id = auth.uid())
    )
  );

drop policy if exists "items own insert" on public.items;
create policy "items own insert"
  on public.items
  for insert
  with check (owner_id = auth.uid());

drop policy if exists "items own update" on public.items;
create policy "items own update"
  on public.items
  for update
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

drop policy if exists "items own delete" on public.items;
create policy "items own delete"
  on public.items
  for delete
  using (owner_id = auth.uid());

drop policy if exists "item images visible read" on public.item_images;
create policy "item images visible read"
  on public.item_images
  for select
  using (
    exists (
      select 1
      from public.items i
      where i.id = item_images.item_id
        and (
          i.status = 'available'
          or i.owner_id = auth.uid()
          or exists (
            select 1
            from public.exchange_proposals ep
            where (ep.requested_item_id = i.id or ep.offered_item_id = i.id)
              and (ep.requester_id = auth.uid() or ep.owner_id = auth.uid())
          )
        )
    )
  );

drop policy if exists "item images own insert" on public.item_images;
create policy "item images own insert"
  on public.item_images
  for insert
  with check (
    exists (
      select 1
      from public.items i
      where i.id = item_images.item_id
        and i.owner_id = auth.uid()
    )
  );

drop policy if exists "item images own delete" on public.item_images;
create policy "item images own delete"
  on public.item_images
  for delete
  using (
    exists (
      select 1
      from public.items i
      where i.id = item_images.item_id
        and i.owner_id = auth.uid()
    )
  );

drop policy if exists "item private locations own read" on public.item_private_locations;
create policy "item private locations own read"
  on public.item_private_locations
  for select
  using (owner_id = auth.uid());

drop policy if exists "item private locations own insert" on public.item_private_locations;
create policy "item private locations own insert"
  on public.item_private_locations
  for insert
  with check (owner_id = auth.uid());

drop policy if exists "item private locations own update" on public.item_private_locations;
create policy "item private locations own update"
  on public.item_private_locations
  for update
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

drop policy if exists "proposals participant read" on public.exchange_proposals;
create policy "proposals participant read"
  on public.exchange_proposals
  for select
  using (requester_id = auth.uid() or owner_id = auth.uid());

drop policy if exists "proposals valid insert" on public.exchange_proposals;
create policy "proposals valid insert"
  on public.exchange_proposals
  for insert
  with check (
    requester_id = auth.uid()
    and exists (
      select 1
      from public.items offered
      where offered.id = offered_item_id
        and offered.owner_id = auth.uid()
        and offered.status = 'available'
    )
    and exists (
      select 1
      from public.items requested
      where requested.id = requested_item_id
        and requested.owner_id = owner_id
        and requested.owner_id <> auth.uid()
        and requested.status = 'available'
    )
  );

drop policy if exists "reports own insert" on public.reports;
create policy "reports own insert"
  on public.reports
  for insert
  with check (reporter_id = auth.uid());

drop policy if exists "reports own read" on public.reports;
create policy "reports own read"
  on public.reports
  for select
  using (reporter_id = auth.uid());

drop policy if exists "audit own read" on public.audit_events;
create policy "audit own read"
  on public.audit_events
  for select
  using (actor_id = auth.uid());

drop policy if exists "audit authenticated insert" on public.audit_events;
create policy "audit authenticated insert"
  on public.audit_events
  for insert
  with check (actor_id = auth.uid());

drop policy if exists "real estate agencies public active read" on public.real_estate_agencies;
create policy "real estate agencies public active read"
  on public.real_estate_agencies
  for select
  using (status = 'active');

insert into storage.buckets (id, name, public)
values ('item-images', 'item-images', true)
on conflict (id) do update set public = true;

drop policy if exists "item images storage public read" on storage.objects;
create policy "item images storage public read"
  on storage.objects
  for select
  using (bucket_id = 'item-images');

drop policy if exists "item images storage own insert" on storage.objects;
create policy "item images storage own insert"
  on storage.objects
  for insert
  with check (
    bucket_id = 'item-images'
    and auth.uid() is not null
    and name like auth.uid()::text || '/%'
  );

drop policy if exists "item images storage own delete" on storage.objects;
create policy "item images storage own delete"
  on storage.objects
  for delete
  using (
    bucket_id = 'item-images'
    and auth.uid() is not null
    and name like auth.uid()::text || '/%'
  );

create or replace function public.accept_exchange_proposal(p_proposal_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_proposal public.exchange_proposals;
begin
  select *
  into v_proposal
  from public.exchange_proposals
  where id = p_proposal_id
  for update;

  if not found then
    raise exception 'Proposta não encontrada.';
  end if;

  if v_proposal.owner_id <> auth.uid() then
    raise exception 'Apenas o anunciante do imóvel pode aceitar a proposta.';
  end if;

  if v_proposal.status <> 'pending' then
    raise exception 'A proposta não está pendente.';
  end if;

  update public.exchange_proposals
  set status = 'accepted'
  where id = p_proposal_id;

  update public.items
  set status = 'traded'
  where id in (v_proposal.requested_item_id, v_proposal.offered_item_id);

  update public.exchange_proposals
  set status = 'rejected'
  where id <> p_proposal_id
    and status = 'pending'
    and (
      requested_item_id in (v_proposal.requested_item_id, v_proposal.offered_item_id)
      or offered_item_id in (v_proposal.requested_item_id, v_proposal.offered_item_id)
    );
end;
$$;

create or replace function public.reject_exchange_proposal(p_proposal_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.exchange_proposals
  set status = 'rejected'
  where id = p_proposal_id
    and owner_id = auth.uid()
    and status = 'pending';

  if not found then
    raise exception 'Não foi possível recusar a proposta.';
  end if;
end;
$$;

create or replace function public.cancel_exchange_proposal(p_proposal_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.exchange_proposals
  set status = 'cancelled'
  where id = p_proposal_id
    and requester_id = auth.uid()
    and status = 'pending';

  if not found then
    raise exception 'Não foi possível cancelar a proposta.';
  end if;
end;
$$;

create or replace function public.mark_exchange_failed(p_proposal_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_proposal public.exchange_proposals;
begin
  select *
  into v_proposal
  from public.exchange_proposals
  where id = p_proposal_id
  for update;

  if not found then
    raise exception 'Proposta não encontrada.';
  end if;

  if auth.uid() not in (v_proposal.requester_id, v_proposal.owner_id) then
    raise exception 'Apenas participantes podem reabrir a negociação.';
  end if;

  if v_proposal.status <> 'accepted' then
    raise exception 'Apenas propostas aceitas podem ser marcadas como não realizadas.';
  end if;

  update public.exchange_proposals
  set status = 'failed'
  where id = p_proposal_id;

  update public.items
  set status = 'available'
  where id in (v_proposal.requested_item_id, v_proposal.offered_item_id);
end;
$$;
