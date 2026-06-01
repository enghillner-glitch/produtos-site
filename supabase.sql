create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  user_type text not null default 'individual' check (user_type in ('individual', 'company', 'real_estate_admin')),
  role text not null default 'user' check (role in ('user', 'real_estate_admin', 'admin')),
  account_status text not null default 'active' check (account_status in ('active', 'inactive')),
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
  transfer_amount numeric(12, 2) not null default 0,
  outstanding_balance numeric(12, 2) not null default 0,
  monthly_payment numeric(12, 2) not null default 0,
  installments_remaining integer not null default 0,
  legitimacy_confirmed boolean not null default false,
  moderation_status text not null default 'pending' check (moderation_status in ('pending', 'approved', 'rejected')),
  moderation_note text,
  moderation_updated_at timestamptz,
  status text not null default 'available' check (status in ('available', 'traded', 'inactive', 'expired')),
  expires_at timestamptz not null default (now() + interval '30 days'),
  renewed_at timestamptz,
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
  offered_item_id uuid references public.items(id) on delete cascade,
  offered_item_2_id uuid references public.items(id) on delete cascade,
  proposal_type text not null default 'item' check (proposal_type in ('cash', 'item', 'mixed')),
  requester_id uuid not null references public.profiles(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  created_by uuid not null references public.profiles(id) on delete cascade,
  responder_id uuid not null references public.profiles(id) on delete cascade,
  cash_difference numeric(12, 2) not null default 0,
  cash_direction text not null default 'none' check (cash_direction in ('none', 'requester_pays', 'owner_pays')),
  message text,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected', 'cancelled', 'failed', 'expired', 'countered')),
  parent_proposal_id uuid references public.exchange_proposals(id) on delete set null,
  version integer not null default 1,
  expires_at timestamptz not null default (now() + interval '7 days'),
  reserved_until timestamptz not null default (now() + interval '2 days'),
  accepted_at timestamptz,
  accepted_snapshot jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint exchange_items_different check (
    (offered_item_id is null or requested_item_id <> offered_item_id)
    and (offered_item_2_id is null or requested_item_id <> offered_item_2_id)
    and (offered_item_id is null or offered_item_2_id is null or offered_item_id <> offered_item_2_id)
  ),
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

create table if not exists public.negotiation_leads (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null unique references public.exchange_proposals(id) on delete cascade,
  agency_id uuid references public.real_estate_agencies(id) on delete set null,
  requested_item_id uuid not null references public.items(id) on delete cascade,
  requester_id uuid not null references public.profiles(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'new' check (status in ('new', 'contacted', 'document_review', 'negotiation', 'final_agreement', 'closed', 'cancelled')),
  assigned_to uuid references public.profiles(id) on delete set null,
  internal_notes text,
  summary jsonb not null default '{}'::jsonb,
  email_summary_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.agreement_cancellations (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references public.exchange_proposals(id) on delete cascade,
  requested_by uuid not null references public.profiles(id) on delete cascade,
  reason text not null,
  status text not null default 'requested' check (status in ('requested', 'approved', 'rejected')),
  resolution_notes text,
  resolved_by uuid references public.profiles(id) on delete set null,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.final_agreement_terms (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references public.exchange_proposals(id) on delete cascade,
  version integer not null default 1,
  terms_text text not null,
  status text not null default 'requested' check (status in ('requested', 'accepted', 'finalized', 'cancelled')),
  created_by uuid not null references public.profiles(id) on delete cascade,
  requester_accepted_at timestamptz,
  owner_accepted_at timestamptz,
  finalized_by uuid references public.profiles(id) on delete set null,
  finalized_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (proposal_id, version)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  title text not null,
  body text not null,
  entity_type text,
  entity_id uuid,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.email_queue (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  to_email text,
  subject text not null,
  body text not null,
  status text not null default 'queued' check (status in ('queued', 'sent', 'failed', 'skipped')),
  related_entity_type text,
  related_entity_id uuid,
  created_at timestamptz not null default now(),
  processed_at timestamptz
);

create table if not exists public.consent_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  consent_type text not null,
  version text not null,
  text_hash text not null,
  accepted_at timestamptz not null default now(),
  unique (user_id, consent_type, version)
);

create table if not exists public.favorite_items (
  user_id uuid not null references public.profiles(id) on delete cascade,
  item_id uuid not null references public.items(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, item_id)
);

alter table public.profiles
  add column if not exists user_type text not null default 'individual',
  add column if not exists role text not null default 'user',
  add column if not exists account_status text not null default 'active',
  add column if not exists city text,
  add column if not exists state text;

alter table public.items
  add column if not exists state text not null default 'PB';
alter table public.items
  add column if not exists transfer_amount numeric(12, 2) not null default 0;
alter table public.items
  add column if not exists outstanding_balance numeric(12, 2) not null default 0;
alter table public.items
  add column if not exists monthly_payment numeric(12, 2) not null default 0;
alter table public.items
  add column if not exists installments_remaining integer not null default 0;
alter table public.items
  add column if not exists legitimacy_confirmed boolean not null default false;
alter table public.items
  add column if not exists moderation_status text not null default 'pending';
alter table public.items
  add column if not exists moderation_note text;
alter table public.items
  add column if not exists moderation_updated_at timestamptz;
alter table public.items
  add column if not exists expires_at timestamptz not null default (now() + interval '30 days');
alter table public.items
  add column if not exists renewed_at timestamptz;

update public.items
set moderation_status = 'approved',
    moderation_updated_at = coalesce(moderation_updated_at, now())
where moderation_updated_at is null;

update public.items
set expires_at = coalesce(expires_at, created_at + interval '30 days')
where expires_at is null;

alter table public.items drop constraint if exists items_state_check;
alter table public.items
  add constraint items_state_check
  check (state in ('PB'));

alter table public.items drop constraint if exists items_financial_values_check;
alter table public.items
  add constraint items_financial_values_check
  check (
    transfer_amount >= 0
    and outstanding_balance >= 0
    and monthly_payment >= 0
    and installments_remaining >= 0
  );

alter table public.items drop constraint if exists items_moderation_status_check;
alter table public.items
  add constraint items_moderation_status_check
  check (moderation_status in ('pending', 'approved', 'rejected'));

alter table public.items drop constraint if exists items_status_check;
alter table public.items
  add constraint items_status_check
  check (status in ('available', 'traded', 'inactive', 'expired'));

alter table public.exchange_proposals
  add column if not exists offered_item_2_id uuid references public.items(id) on delete cascade,
  add column if not exists proposal_type text not null default 'item',
  add column if not exists created_by uuid references public.profiles(id) on delete cascade,
  add column if not exists responder_id uuid references public.profiles(id) on delete cascade,
  add column if not exists parent_proposal_id uuid references public.exchange_proposals(id) on delete set null,
  add column if not exists version integer not null default 1,
  add column if not exists expires_at timestamptz not null default (now() + interval '7 days'),
  add column if not exists reserved_until timestamptz not null default (now() + interval '2 days'),
  add column if not exists accepted_at timestamptz,
  add column if not exists accepted_snapshot jsonb;

alter table public.exchange_proposals
  alter column offered_item_id drop not null;

update public.exchange_proposals
set created_by = coalesce(created_by, requester_id),
    responder_id = coalesce(responder_id, owner_id),
    proposal_type = coalesce(proposal_type, 'item'),
    expires_at = coalesce(expires_at, created_at + interval '7 days'),
    reserved_until = coalesce(reserved_until, created_at + interval '2 days')
where created_by is null
   or responder_id is null
   or proposal_type is null
   or expires_at is null
   or reserved_until is null;

alter table public.exchange_proposals
  alter column created_by set not null,
  alter column responder_id set not null;

alter table public.exchange_proposals drop constraint if exists exchange_proposals_status_check;
alter table public.exchange_proposals
  add constraint exchange_proposals_status_check
  check (status in ('pending', 'accepted', 'rejected', 'cancelled', 'failed', 'expired', 'countered'));

alter table public.exchange_proposals drop constraint if exists exchange_proposals_proposal_type_check;
alter table public.exchange_proposals
  add constraint exchange_proposals_proposal_type_check
  check (proposal_type in ('cash', 'item', 'mixed'));

alter table public.exchange_proposals drop constraint if exists exchange_items_different;
alter table public.exchange_proposals
  add constraint exchange_items_different
  check (
    (offered_item_id is null or requested_item_id <> offered_item_id)
    and (offered_item_2_id is null or requested_item_id <> offered_item_2_id)
    and (offered_item_id is null or offered_item_2_id is null or offered_item_id <> offered_item_2_id)
  );

alter table public.exchange_proposals drop constraint if exists exchange_offer_type_check;
alter table public.exchange_proposals
  add constraint exchange_offer_type_check
  check (
    (
      proposal_type = 'cash'
      and offered_item_id is null
      and offered_item_2_id is null
      and cash_difference > 0
      and cash_direction <> 'none'
    )
    or (
      proposal_type = 'item'
      and offered_item_id is not null
    )
    or (
      proposal_type = 'mixed'
      and offered_item_id is not null
      and cash_difference > 0
      and cash_direction <> 'none'
    )
  );

alter table public.exchange_proposals drop constraint if exists exchange_responder_participant_check;
alter table public.exchange_proposals
  add constraint exchange_responder_participant_check
  check (responder_id in (requester_id, owner_id));

alter table public.exchange_proposals drop constraint if exists exchange_creator_participant_check;
alter table public.exchange_proposals
  add constraint exchange_creator_participant_check
  check (created_by in (requester_id, owner_id));

alter table public.negotiation_leads
  add column if not exists agency_id uuid references public.real_estate_agencies(id) on delete set null,
  add column if not exists assigned_to uuid references public.profiles(id) on delete set null,
  add column if not exists internal_notes text,
  add column if not exists summary jsonb not null default '{}'::jsonb,
  add column if not exists email_summary_sent_at timestamptz;

alter table public.negotiation_leads drop constraint if exists negotiation_leads_status_check;
alter table public.negotiation_leads
  add constraint negotiation_leads_status_check
  check (status in ('new', 'contacted', 'document_review', 'negotiation', 'final_agreement', 'closed', 'cancelled'));

alter table public.agreement_cancellations
  add column if not exists resolution_notes text,
  add column if not exists resolved_by uuid references public.profiles(id) on delete set null,
  add column if not exists resolved_at timestamptz;

alter table public.agreement_cancellations drop constraint if exists agreement_cancellations_status_check;
alter table public.agreement_cancellations
  add constraint agreement_cancellations_status_check
  check (status in ('requested', 'approved', 'rejected'));

alter table public.final_agreement_terms
  add column if not exists finalized_by uuid references public.profiles(id) on delete set null,
  add column if not exists finalized_at timestamptz;

alter table public.final_agreement_terms drop constraint if exists final_agreement_terms_status_check;
alter table public.final_agreement_terms
  add constraint final_agreement_terms_status_check
  check (status in ('requested', 'accepted', 'finalized', 'cancelled'));

alter table public.profiles drop constraint if exists profiles_user_type_check;
alter table public.profiles
  add constraint profiles_user_type_check
  check (user_type in ('individual', 'company', 'real_estate_admin'));

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check
  check (role in ('user', 'real_estate_admin', 'admin'));

alter table public.profiles drop constraint if exists profiles_account_status_check;
alter table public.profiles
  add constraint profiles_account_status_check
  check (account_status in ('active', 'inactive'));

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
create index if not exists items_expiration_idx on public.items(status, expires_at);
create index if not exists items_moderation_status_idx on public.items(moderation_status, updated_at desc);
create index if not exists profile_private_document_hash_idx on public.profile_private_data(document_hash);
create unique index if not exists profile_private_document_unique_idx on public.profile_private_data(document_type, document_hash);
create index if not exists items_owner_idx on public.items(owner_id);
create index if not exists item_images_item_idx on public.item_images(item_id);
create index if not exists item_private_locations_owner_idx on public.item_private_locations(owner_id);
create index if not exists exchange_requester_idx on public.exchange_proposals(requester_id);
create index if not exists exchange_owner_idx on public.exchange_proposals(owner_id);
create index if not exists exchange_requested_item_idx on public.exchange_proposals(requested_item_id);
create index if not exists exchange_offered_item_idx on public.exchange_proposals(offered_item_id);
create index if not exists exchange_offered_item_2_idx on public.exchange_proposals(offered_item_2_id);
create index if not exists exchange_responder_pending_idx on public.exchange_proposals(responder_id, status, expires_at);
create index if not exists exchange_pending_reservation_idx on public.exchange_proposals(requester_id, status, reserved_until);
create index if not exists audit_events_actor_idx on public.audit_events(actor_id, created_at desc);
create index if not exists audit_events_entity_idx on public.audit_events(entity_type, entity_id);
create index if not exists real_estate_agencies_status_idx on public.real_estate_agencies(status);
create index if not exists negotiation_leads_status_idx on public.negotiation_leads(status, updated_at desc);
create index if not exists negotiation_leads_participants_idx on public.negotiation_leads(requester_id, owner_id);
create index if not exists negotiation_leads_assigned_idx on public.negotiation_leads(assigned_to, status);
create index if not exists agreement_cancellations_proposal_idx on public.agreement_cancellations(proposal_id, status);
create index if not exists agreement_cancellations_requested_idx on public.agreement_cancellations(requested_by, created_at desc);
create index if not exists final_agreement_terms_proposal_idx on public.final_agreement_terms(proposal_id, version desc);
create index if not exists final_agreement_terms_status_idx on public.final_agreement_terms(status, updated_at desc);
create index if not exists notifications_user_idx on public.notifications(user_id, created_at desc);
create index if not exists email_queue_status_idx on public.email_queue(status, created_at asc);
create index if not exists consent_records_user_idx on public.consent_records(user_id, accepted_at desc);
create index if not exists favorite_items_item_idx on public.favorite_items(item_id, created_at desc);

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

create or replace function public.protect_profile_role_fields()
returns trigger
language plpgsql
as $$
begin
  if auth.uid() = old.id then
    new.role = old.role;

    if new.user_type = 'real_estate_admin' and old.user_type <> 'real_estate_admin' then
      new.user_type = old.user_type;
    end if;
  end if;

  return new;
end;
$$;

create or replace function public.protect_item_moderation_fields()
returns trigger
language plpgsql
as $$
declare
  v_is_moderator boolean;
  v_content_changed boolean;
begin
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role in ('real_estate_admin', 'admin')
      and p.account_status = 'active'
  ) into v_is_moderator;

  if coalesce(v_is_moderator, false) then
    return new;
  end if;

  if auth.uid() = new.owner_id then
    if tg_op = 'INSERT' then
      new.moderation_status = 'pending';
      new.moderation_note = null;
      new.moderation_updated_at = now();
      return new;
    end if;

    v_content_changed =
      old.title is distinct from new.title
      or old.description is distinct from new.description
      or old.category is distinct from new.category
      or old.condition is distinct from new.condition
      or old.state is distinct from new.state
      or old.city is distinct from new.city
      or old.neighborhood is distinct from new.neighborhood
      or old.trade_preferences is distinct from new.trade_preferences
      or old.transfer_amount is distinct from new.transfer_amount
      or old.outstanding_balance is distinct from new.outstanding_balance
      or old.monthly_payment is distinct from new.monthly_payment
      or old.installments_remaining is distinct from new.installments_remaining
      or old.legitimacy_confirmed is distinct from new.legitimacy_confirmed;

    if v_content_changed then
      new.moderation_status = 'pending';
      new.moderation_note = null;
      new.moderation_updated_at = now();
    else
      new.moderation_status = old.moderation_status;
      new.moderation_note = old.moderation_note;
      new.moderation_updated_at = old.moderation_updated_at;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists profiles_protect_role_fields on public.profiles;
create trigger profiles_protect_role_fields
before update on public.profiles
for each row execute function public.protect_profile_role_fields();

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

drop trigger if exists items_protect_moderation_fields on public.items;
create trigger items_protect_moderation_fields
before insert or update on public.items
for each row execute function public.protect_item_moderation_fields();

drop trigger if exists exchange_proposals_set_updated_at on public.exchange_proposals;
create trigger exchange_proposals_set_updated_at
before update on public.exchange_proposals
for each row execute function public.set_updated_at();

drop trigger if exists real_estate_agencies_set_updated_at on public.real_estate_agencies;
create trigger real_estate_agencies_set_updated_at
before update on public.real_estate_agencies
for each row execute function public.set_updated_at();

drop trigger if exists negotiation_leads_set_updated_at on public.negotiation_leads;
create trigger negotiation_leads_set_updated_at
before update on public.negotiation_leads
for each row execute function public.set_updated_at();

drop trigger if exists agreement_cancellations_set_updated_at on public.agreement_cancellations;
create trigger agreement_cancellations_set_updated_at
before update on public.agreement_cancellations
for each row execute function public.set_updated_at();

drop trigger if exists final_agreement_terms_set_updated_at on public.final_agreement_terms;
create trigger final_agreement_terms_set_updated_at
before update on public.final_agreement_terms
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
alter table public.negotiation_leads enable row level security;
alter table public.agreement_cancellations enable row level security;
alter table public.final_agreement_terms enable row level security;
alter table public.notifications enable row level security;
alter table public.email_queue enable row level security;
alter table public.consent_records enable row level security;
alter table public.favorite_items enable row level security;

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
    (status = 'available' and moderation_status = 'approved')
    or owner_id = auth.uid()
    or exists (
      select 1
      from public.profiles moderator
      where moderator.id = auth.uid()
        and moderator.role in ('real_estate_admin', 'admin')
        and moderator.account_status = 'active'
    )
    or exists (
      select 1
      from public.exchange_proposals ep
          where (ep.requested_item_id = items.id or ep.offered_item_id = items.id or ep.offered_item_2_id = items.id)
        and (ep.requester_id = auth.uid() or ep.owner_id = auth.uid())
    )
  );

drop policy if exists "items own insert" on public.items;
create policy "items own insert"
  on public.items
  for insert
  with check (
    owner_id = auth.uid()
    and moderation_status = 'pending'
    and exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.account_status = 'active'
    )
  );

drop policy if exists "items own update" on public.items;
create policy "items own update"
  on public.items
  for update
  using (owner_id = auth.uid())
  with check (
    owner_id = auth.uid()
    and exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.account_status = 'active'
    )
  );

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
          (i.status = 'available' and i.moderation_status = 'approved')
          or i.owner_id = auth.uid()
          or exists (
            select 1
            from public.profiles moderator
            where moderator.id = auth.uid()
              and moderator.role in ('real_estate_admin', 'admin')
              and moderator.account_status = 'active'
          )
          or exists (
            select 1
            from public.exchange_proposals ep
            where (ep.requested_item_id = i.id or ep.offered_item_id = i.id or ep.offered_item_2_id = i.id)
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

drop policy if exists "items moderator update" on public.items;
create policy "items moderator update"
  on public.items
  for update
  using (
    exists (
      select 1
      from public.profiles moderator
      where moderator.id = auth.uid()
        and moderator.role in ('real_estate_admin', 'admin')
        and moderator.account_status = 'active'
    )
  )
  with check (
    exists (
      select 1
      from public.profiles moderator
      where moderator.id = auth.uid()
        and moderator.role in ('real_estate_admin', 'admin')
        and moderator.account_status = 'active'
    )
  );

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
    and created_by = auth.uid()
    and responder_id = owner_id
    and status = 'pending'
    and parent_proposal_id is null
    and version = 1
    and cash_difference >= 0
    and expires_at > now()
    and expires_at <= now() + interval '30 days'
    and reserved_until > now()
    and reserved_until <= expires_at
    and exists (
      select 1
      from public.profiles requester
      where requester.id = auth.uid()
        and requester.account_status = 'active'
    )
    and exists (
      select 1
      from public.profiles owner_profile
      where owner_profile.id = owner_id
        and owner_profile.account_status = 'active'
    )
    and (
      proposal_type = 'cash'
      and offered_item_id is null
      and offered_item_2_id is null
      and cash_difference > 0
      and cash_direction <> 'none'
      or proposal_type in ('item', 'mixed')
    )
    and (
      offered_item_id is null
      or exists (
      select 1
      from public.items offered
      where offered.id = offered_item_id
        and offered.owner_id = auth.uid()
        and offered.status = 'available'
        and offered.moderation_status = 'approved'
      )
    )
    and (
      offered_item_2_id is null
      or exists (
        select 1
        from public.items offered2
        where offered2.id = offered_item_2_id
          and offered2.owner_id = auth.uid()
          and offered2.status = 'available'
          and offered2.moderation_status = 'approved'
      )
    )
    and exists (
      select 1
      from public.items requested
      where requested.id = requested_item_id
        and requested.owner_id = owner_id
        and requested.owner_id <> auth.uid()
        and requested.status = 'available'
        and requested.moderation_status = 'approved'
    )
    and not exists (
      select 1
      from public.exchange_proposals active
      where active.requester_id = auth.uid()
        and active.requested_item_id = exchange_proposals.requested_item_id
        and active.status = 'pending'
        and active.expires_at > now()
    )
    and not exists (
      select 1
      from public.exchange_proposals active
      where active.requester_id = auth.uid()
        and active.status = 'pending'
        and active.reserved_until > now()
        and (
          (exchange_proposals.offered_item_id is not null and exchange_proposals.offered_item_id in (active.offered_item_id, active.offered_item_2_id))
          or (exchange_proposals.offered_item_2_id is not null and exchange_proposals.offered_item_2_id in (active.offered_item_id, active.offered_item_2_id))
        )
    )
    and (
      select count(*)
      from public.exchange_proposals recent
      where recent.requester_id = auth.uid()
        and recent.created_at > now() - interval '24 hours'
    ) < 10
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
  using (
    reporter_id = auth.uid()
    or exists (
      select 1
      from public.profiles moderator
      where moderator.id = auth.uid()
        and moderator.role in ('real_estate_admin', 'admin')
        and moderator.account_status = 'active'
    )
  );

drop policy if exists "reports admin update" on public.reports;
create policy "reports admin update"
  on public.reports
  for update
  using (
    exists (
      select 1
      from public.profiles moderator
      where moderator.id = auth.uid()
        and moderator.role in ('real_estate_admin', 'admin')
        and moderator.account_status = 'active'
    )
  )
  with check (
    exists (
      select 1
      from public.profiles moderator
      where moderator.id = auth.uid()
        and moderator.role in ('real_estate_admin', 'admin')
        and moderator.account_status = 'active'
    )
  );

drop policy if exists "audit own read" on public.audit_events;
create policy "audit own read"
  on public.audit_events
  for select
  using (
    actor_id = auth.uid()
    or exists (
      select 1
      from public.profiles moderator
      where moderator.id = auth.uid()
        and moderator.role in ('real_estate_admin', 'admin')
        and moderator.account_status = 'active'
    )
  );

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

drop policy if exists "real estate agencies admin insert" on public.real_estate_agencies;
create policy "real estate agencies admin insert"
  on public.real_estate_agencies
  for insert
  with check (
    exists (
      select 1
      from public.profiles moderator
      where moderator.id = auth.uid()
        and moderator.role in ('real_estate_admin', 'admin')
        and moderator.account_status = 'active'
    )
  );

drop policy if exists "real estate agencies admin update" on public.real_estate_agencies;
create policy "real estate agencies admin update"
  on public.real_estate_agencies
  for update
  using (
    exists (
      select 1
      from public.profiles moderator
      where moderator.id = auth.uid()
        and moderator.role in ('real_estate_admin', 'admin')
        and moderator.account_status = 'active'
    )
  )
  with check (
    exists (
      select 1
      from public.profiles moderator
      where moderator.id = auth.uid()
        and moderator.role in ('real_estate_admin', 'admin')
        and moderator.account_status = 'active'
    )
  );

drop policy if exists "negotiation leads admin read" on public.negotiation_leads;
create policy "negotiation leads admin read"
  on public.negotiation_leads
  for select
  using (
    exists (
      select 1
      from public.profiles moderator
      where moderator.id = auth.uid()
        and moderator.role in ('real_estate_admin', 'admin')
        and moderator.account_status = 'active'
    )
  );

drop policy if exists "negotiation leads admin update" on public.negotiation_leads;
create policy "negotiation leads admin update"
  on public.negotiation_leads
  for update
  using (
    exists (
      select 1
      from public.profiles moderator
      where moderator.id = auth.uid()
        and moderator.role in ('real_estate_admin', 'admin')
        and moderator.account_status = 'active'
    )
  )
  with check (
    exists (
      select 1
      from public.profiles moderator
      where moderator.id = auth.uid()
        and moderator.role in ('real_estate_admin', 'admin')
        and moderator.account_status = 'active'
    )
  );

drop policy if exists "agreement cancellations participant read" on public.agreement_cancellations;
create policy "agreement cancellations participant read"
  on public.agreement_cancellations
  for select
  using (
    requested_by = auth.uid()
    or exists (
      select 1
      from public.exchange_proposals ep
      where ep.id = agreement_cancellations.proposal_id
        and auth.uid() in (ep.requester_id, ep.owner_id)
    )
    or exists (
      select 1
      from public.profiles moderator
      where moderator.id = auth.uid()
        and moderator.role in ('real_estate_admin', 'admin')
        and moderator.account_status = 'active'
    )
  );

drop policy if exists "agreement cancellations admin update" on public.agreement_cancellations;
create policy "agreement cancellations admin update"
  on public.agreement_cancellations
  for update
  using (
    exists (
      select 1
      from public.profiles moderator
      where moderator.id = auth.uid()
        and moderator.role in ('real_estate_admin', 'admin')
        and moderator.account_status = 'active'
    )
  )
  with check (
    exists (
      select 1
      from public.profiles moderator
      where moderator.id = auth.uid()
        and moderator.role in ('real_estate_admin', 'admin')
        and moderator.account_status = 'active'
    )
  );

drop policy if exists "final agreements participant read" on public.final_agreement_terms;
create policy "final agreements participant read"
  on public.final_agreement_terms
  for select
  using (
    exists (
      select 1
      from public.exchange_proposals ep
      where ep.id = final_agreement_terms.proposal_id
        and auth.uid() in (ep.requester_id, ep.owner_id)
    )
    or exists (
      select 1
      from public.profiles moderator
      where moderator.id = auth.uid()
        and moderator.role in ('real_estate_admin', 'admin')
        and moderator.account_status = 'active'
    )
  );

drop policy if exists "notifications own read" on public.notifications;
create policy "notifications own read"
  on public.notifications
  for select
  using (user_id = auth.uid());

drop policy if exists "notifications own update" on public.notifications;
create policy "notifications own update"
  on public.notifications
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "email queue admin read" on public.email_queue;
create policy "email queue admin read"
  on public.email_queue
  for select
  using (
    exists (
      select 1
      from public.profiles moderator
      where moderator.id = auth.uid()
        and moderator.role in ('real_estate_admin', 'admin')
        and moderator.account_status = 'active'
    )
  );

drop policy if exists "consent own read" on public.consent_records;
create policy "consent own read"
  on public.consent_records
  for select
  using (user_id = auth.uid());

drop policy if exists "consent own insert" on public.consent_records;
create policy "consent own insert"
  on public.consent_records
  for insert
  with check (user_id = auth.uid());

drop policy if exists "consent own update" on public.consent_records;
create policy "consent own update"
  on public.consent_records
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "favorite own read" on public.favorite_items;
create policy "favorite own read"
  on public.favorite_items
  for select
  using (user_id = auth.uid());

drop policy if exists "favorite own insert" on public.favorite_items;
create policy "favorite own insert"
  on public.favorite_items
  for insert
  with check (user_id = auth.uid());

drop policy if exists "favorite own delete" on public.favorite_items;
create policy "favorite own delete"
  on public.favorite_items
  for delete
  using (user_id = auth.uid());

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

create or replace function public.create_notification(
  p_user_id uuid,
  p_type text,
  p_title text,
  p_body text,
  p_entity_type text default null,
  p_entity_id uuid default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_user_id is null then
    return;
  end if;

  insert into public.notifications (
    user_id,
    type,
    title,
    body,
    entity_type,
    entity_id
  )
  values (
    p_user_id,
    p_type,
    p_title,
    p_body,
    p_entity_type,
    p_entity_id
  );
end;
$$;

create or replace function public.enqueue_email(
  p_user_id uuid,
  p_subject text,
  p_body text,
  p_entity_type text default null,
  p_entity_id uuid default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_to_email text;
begin
  if p_user_id is null then
    return;
  end if;

  select email
  into v_to_email
  from auth.users
  where id = p_user_id;

  insert into public.email_queue (
    user_id,
    to_email,
    subject,
    body,
    related_entity_type,
    related_entity_id,
    status
  )
  values (
    p_user_id,
    v_to_email,
    p_subject,
    p_body,
    p_entity_type,
    p_entity_id,
    'queued'
  );
end;
$$;

create or replace function public.log_audit_event(
  p_action text,
  p_entity_type text,
  p_entity_id uuid default null,
  p_metadata jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    return;
  end if;

  insert into public.audit_events (
    actor_id,
    action,
    entity_type,
    entity_id,
    metadata
  )
  values (
    auth.uid(),
    left(coalesce(nullif(trim(p_action), ''), 'unknown'), 120),
    left(coalesce(nullif(trim(p_entity_type), ''), 'unknown'), 80),
    p_entity_id,
    coalesce(p_metadata, '{}'::jsonb)
  );
end;
$$;

create or replace function public.expire_exchange_proposals()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  update public.exchange_proposals
  set status = 'expired'
  where status = 'pending'
    and expires_at <= now();

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

create or replace function public.expire_items()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  update public.items
  set status = 'expired'
  where status = 'available'
    and expires_at <= now();

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

create or replace function public.run_scheduled_maintenance()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_expired integer;
  v_expired_items integer;
  v_marked integer;
begin
  v_expired := public.expire_exchange_proposals();
  v_expired_items := public.expire_items();

  update public.email_queue
  set status = 'skipped',
      processed_at = now()
  where status = 'queued'
    and to_email is null;

  get diagnostics v_marked = row_count;

  return jsonb_build_object(
    'expired_proposals', v_expired,
    'expired_items', v_expired_items,
    'emails_without_destination_marked', v_marked
  );
end;
$$;

create or replace function public.get_my_lead_updates()
returns table (
  proposal_id uuid,
  status text,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    lead.proposal_id,
    lead.status,
    lead.created_at,
    lead.updated_at
  from public.negotiation_leads lead
  where auth.uid() in (lead.requester_id, lead.owner_id);
$$;

create or replace function public.accept_exchange_proposal(p_proposal_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_proposal public.exchange_proposals;
  v_item_ids uuid[];
  v_required_count integer;
  v_rejected_count integer;
begin
  perform public.expire_exchange_proposals();

  select *
  into v_proposal
  from public.exchange_proposals
  where id = p_proposal_id
  for update;

  if not found then
    raise exception 'Proposta não encontrada.';
  end if;

  if v_proposal.responder_id <> auth.uid() then
    raise exception 'Apenas quem recebeu a proposta pode aceitar.';
  end if;

  if v_proposal.status <> 'pending' then
    raise exception 'A proposta não está pendente.';
  end if;

  if v_proposal.expires_at <= now() then
    update public.exchange_proposals set status = 'expired' where id = p_proposal_id;
    raise exception 'A proposta expirou.';
  end if;

  if (
    select count(*)
    from public.profiles p
    where p.id in (v_proposal.requester_id, v_proposal.owner_id)
      and p.account_status = 'active'
  ) <> 2 then
    raise exception 'A proposta possui participante inativo.';
  end if;

  v_item_ids := array_remove(array[
    v_proposal.requested_item_id,
    v_proposal.offered_item_id,
    v_proposal.offered_item_2_id
  ], null);
  v_required_count := coalesce(array_length(v_item_ids, 1), 0);

  if (
    select count(*)
    from public.items i
    where i.id = any(v_item_ids)
      and i.status = 'available'
      and i.moderation_status = 'approved'
  ) <> v_required_count then
    raise exception 'Os imóveis da proposta precisam estar disponíveis.';
  end if;

  update public.exchange_proposals
  set status = 'accepted',
      accepted_at = now(),
      accepted_snapshot = jsonb_build_object(
        'proposal_id', id,
        'requested_item_id', requested_item_id,
        'offered_item_id', offered_item_id,
        'offered_item_2_id', offered_item_2_id,
        'proposal_type', proposal_type,
        'requester_id', requester_id,
        'owner_id', owner_id,
        'cash_difference', cash_difference,
        'cash_direction', cash_direction,
        'message', message,
        'version', version,
        'accepted_by', auth.uid(),
        'accepted_at', now()
      )
  where id = p_proposal_id;

  update public.items
  set status = 'traded'
  where id = any(v_item_ids);

  insert into public.negotiation_leads (
    proposal_id,
    agency_id,
    requested_item_id,
    requester_id,
    owner_id,
    status,
    summary
  )
  values (
    v_proposal.id,
    (select id from public.real_estate_agencies where status = 'active' order by created_at asc limit 1),
    v_proposal.requested_item_id,
    v_proposal.requester_id,
    v_proposal.owner_id,
    'new',
    jsonb_build_object(
      'cash_difference', v_proposal.cash_difference,
      'cash_direction', v_proposal.cash_direction,
      'proposal_type', v_proposal.proposal_type,
      'version', v_proposal.version
    )
  )
  on conflict (proposal_id) do nothing;

  perform public.create_notification(
    v_proposal.requester_id,
    'proposal_accepted',
    'Acordo inicial aceito',
    'Uma proposta foi aceita e seguirá para acompanhamento da imobiliária.',
    'exchange_proposal',
    v_proposal.id
  );
  perform public.create_notification(
    v_proposal.owner_id,
    'proposal_accepted',
    'Acordo inicial aceito',
    'Você aceitou uma proposta e ela seguirá para acompanhamento da imobiliária.',
    'exchange_proposal',
    v_proposal.id
  );

  update public.exchange_proposals
  set status = 'rejected'
  where id <> p_proposal_id
    and status = 'pending'
    and (
      requested_item_id = any(v_item_ids)
      or offered_item_id = any(v_item_ids)
      or offered_item_2_id = any(v_item_ids)
    );

  get diagnostics v_rejected_count = row_count;

  perform public.log_audit_event(
    'proposal_accepted',
    'exchange_proposal',
    v_proposal.id,
    jsonb_build_object(
      'requested_item_id', v_proposal.requested_item_id,
      'offered_item_id', v_proposal.offered_item_id,
      'offered_item_2_id', v_proposal.offered_item_2_id,
      'proposal_type', v_proposal.proposal_type,
      'version', v_proposal.version,
      'rejected_competing_proposals', v_rejected_count
    )
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
  perform public.expire_exchange_proposals();

  update public.exchange_proposals
  set status = 'rejected'
  where id = p_proposal_id
    and responder_id = auth.uid()
    and status = 'pending';

  if not found then
    raise exception 'Não foi possível recusar a proposta.';
  end if;

  perform public.log_audit_event(
    'proposal_rejected',
    'exchange_proposal',
    p_proposal_id,
    '{}'::jsonb
  );
end;
$$;

create or replace function public.cancel_exchange_proposal(p_proposal_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.expire_exchange_proposals();

  update public.exchange_proposals
  set status = 'cancelled'
  where id = p_proposal_id
    and created_by = auth.uid()
    and status = 'pending';

  if not found then
    raise exception 'Não foi possível cancelar a proposta.';
  end if;

  perform public.log_audit_event(
    'proposal_cancelled',
    'exchange_proposal',
    p_proposal_id,
    '{}'::jsonb
  );
end;
$$;

create or replace function public.counter_exchange_proposal(
  p_proposal_id uuid,
  p_cash_difference numeric default 0,
  p_cash_direction text default 'none',
  p_message text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_proposal public.exchange_proposals;
  v_new_id uuid;
  v_next_responder uuid;
begin
  perform public.expire_exchange_proposals();

  select *
  into v_proposal
  from public.exchange_proposals
  where id = p_proposal_id
  for update;

  if not found then
    raise exception 'Proposta não encontrada.';
  end if;

  if v_proposal.responder_id <> auth.uid() then
    raise exception 'Apenas quem recebeu a proposta pode contrapropor.';
  end if;

  if v_proposal.status <> 'pending' then
    raise exception 'A proposta não está pendente.';
  end if;

  if p_cash_difference < 0 then
    raise exception 'A diferença financeira não pode ser negativa.';
  end if;

  if v_proposal.proposal_type = 'cash' and p_cash_difference <= 0 then
    raise exception 'Contraproposta somente em dinheiro precisa ter valor maior que zero.';
  end if;

  if p_cash_difference > 0 and p_cash_direction not in ('requester_pays', 'owner_pays') then
    raise exception 'Informe quem pagaria a diferença.';
  end if;

  if p_cash_difference = 0 then
    p_cash_direction := 'none';
  end if;

  v_next_responder := case
    when auth.uid() = v_proposal.requester_id then v_proposal.owner_id
    else v_proposal.requester_id
  end;

  update public.exchange_proposals
  set status = 'countered'
  where id = p_proposal_id;

  insert into public.exchange_proposals (
    requested_item_id,
    offered_item_id,
    offered_item_2_id,
    proposal_type,
    requester_id,
    owner_id,
    created_by,
    responder_id,
    cash_difference,
    cash_direction,
    message,
    status,
    parent_proposal_id,
    version,
    expires_at,
    reserved_until
  )
  values (
    v_proposal.requested_item_id,
    v_proposal.offered_item_id,
    v_proposal.offered_item_2_id,
    v_proposal.proposal_type,
    v_proposal.requester_id,
    v_proposal.owner_id,
    auth.uid(),
    v_next_responder,
    p_cash_difference,
    p_cash_direction,
    nullif(trim(coalesce(p_message, '')), ''),
    'pending',
    v_proposal.id,
    coalesce(v_proposal.version, 1) + 1,
    now() + interval '7 days',
    now() + interval '2 days'
  )
  returning id into v_new_id;

  perform public.log_audit_event(
    'proposal_countered',
    'exchange_proposal',
    v_new_id,
    jsonb_build_object(
      'parent_proposal_id', v_proposal.id,
      'proposal_type', v_proposal.proposal_type,
      'version', coalesce(v_proposal.version, 1) + 1,
      'cash_difference', p_cash_difference,
      'cash_direction', p_cash_direction
    )
  );

  return v_new_id;
end;
$$;

create or replace function public.request_final_agreement(
  p_proposal_id uuid,
  p_terms_text text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_proposal public.exchange_proposals;
  v_next_version integer;
  v_id uuid;
begin
  if not exists (
    select 1
    from public.profiles moderator
    where moderator.id = auth.uid()
      and moderator.role in ('real_estate_admin', 'admin')
      and moderator.account_status = 'active'
  ) then
    raise exception 'Apenas a administração pode solicitar acordo final.';
  end if;

  select *
  into v_proposal
  from public.exchange_proposals
  where id = p_proposal_id
  for update;

  if not found then
    raise exception 'Proposta não encontrada.';
  end if;

  if v_proposal.status <> 'accepted' then
    raise exception 'Acordo final exige acordo inicial aceito.';
  end if;

  if nullif(trim(coalesce(p_terms_text, '')), '') is null then
    raise exception 'Informe os termos finais.';
  end if;

  select coalesce(max(version), 0) + 1
  into v_next_version
  from public.final_agreement_terms
  where proposal_id = p_proposal_id;

  update public.final_agreement_terms
  set status = 'cancelled'
  where proposal_id = p_proposal_id
    and status = 'requested';

  insert into public.final_agreement_terms (
    proposal_id,
    version,
    terms_text,
    status,
    created_by
  )
  values (
    p_proposal_id,
    v_next_version,
    trim(p_terms_text),
    'requested',
    auth.uid()
  )
  returning id into v_id;

  update public.negotiation_leads
  set status = 'final_agreement'
  where proposal_id = p_proposal_id
    and status <> 'closed';

  perform public.create_notification(v_proposal.requester_id, 'final_agreement_requested', 'Acordo final solicitado', 'A imobiliária enviou os termos finais para seu aceite.', 'final_agreement', v_id);
  perform public.create_notification(v_proposal.owner_id, 'final_agreement_requested', 'Acordo final solicitado', 'A imobiliária enviou os termos finais para seu aceite.', 'final_agreement', v_id);
  perform public.enqueue_email(v_proposal.requester_id, 'Acordo final solicitado', 'Acesse o painel do repassecomrepasse para revisar os termos finais.', 'final_agreement', v_id);
  perform public.enqueue_email(v_proposal.owner_id, 'Acordo final solicitado', 'Acesse o painel do repassecomrepasse para revisar os termos finais.', 'final_agreement', v_id);

  perform public.log_audit_event(
    'final_agreement_requested',
    'final_agreement',
    v_id,
    jsonb_build_object(
      'proposal_id', p_proposal_id,
      'version', v_next_version
    )
  );

  return v_id;
end;
$$;

create or replace function public.accept_final_agreement(p_terms_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_terms public.final_agreement_terms;
  v_proposal public.exchange_proposals;
begin
  select *
  into v_terms
  from public.final_agreement_terms
  where id = p_terms_id
  for update;

  if not found then
    raise exception 'Termos finais não encontrados.';
  end if;

  if v_terms.status <> 'requested' then
    raise exception 'Estes termos não estão aguardando aceite.';
  end if;

  select *
  into v_proposal
  from public.exchange_proposals
  where id = v_terms.proposal_id;

  if auth.uid() = v_proposal.requester_id then
    update public.final_agreement_terms
    set requester_accepted_at = coalesce(requester_accepted_at, now())
    where id = p_terms_id;
  elsif auth.uid() = v_proposal.owner_id then
    update public.final_agreement_terms
    set owner_accepted_at = coalesce(owner_accepted_at, now())
    where id = p_terms_id;
  else
    raise exception 'Apenas participantes podem aceitar os termos finais.';
  end if;

  update public.final_agreement_terms
  set status = 'accepted'
  where id = p_terms_id
    and requester_accepted_at is not null
    and owner_accepted_at is not null;

  perform public.create_notification(
    case when auth.uid() = v_proposal.requester_id then v_proposal.owner_id else v_proposal.requester_id end,
    'final_agreement_acceptance',
    'Aceite de acordo final registrado',
    'A outra parte registrou aceite dos termos finais.',
    'final_agreement',
    p_terms_id
  );

  perform public.log_audit_event(
    'final_agreement_accepted',
    'final_agreement',
    p_terms_id,
    jsonb_build_object(
      'proposal_id', v_terms.proposal_id,
      'accepted_as', case when auth.uid() = v_proposal.requester_id then 'requester' else 'owner' end
    )
  );
end;
$$;

create or replace function public.finalize_final_agreement(p_terms_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_terms public.final_agreement_terms;
begin
  if not exists (
    select 1
    from public.profiles moderator
    where moderator.id = auth.uid()
      and moderator.role in ('real_estate_admin', 'admin')
      and moderator.account_status = 'active'
  ) then
    raise exception 'Apenas a administração pode formalizar conclusão.';
  end if;

  select *
  into v_terms
  from public.final_agreement_terms
  where id = p_terms_id
  for update;

  if not found then
    raise exception 'Termos finais não encontrados.';
  end if;

  if v_terms.status <> 'accepted' then
    raise exception 'A formalização exige aceite das duas partes.';
  end if;

  update public.final_agreement_terms
  set status = 'finalized',
      finalized_by = auth.uid(),
      finalized_at = now()
  where id = p_terms_id;

  update public.negotiation_leads
  set status = 'closed'
  where proposal_id = v_terms.proposal_id;

  select *
  into v_terms
  from public.final_agreement_terms
  where id = p_terms_id;

  perform public.create_notification(ep.requester_id, 'final_agreement_finalized', 'Acordo final formalizado', 'A imobiliária formalizou a conclusão administrativa.', 'final_agreement', p_terms_id)
  from public.exchange_proposals ep
  where ep.id = v_terms.proposal_id;
  perform public.create_notification(ep.owner_id, 'final_agreement_finalized', 'Acordo final formalizado', 'A imobiliária formalizou a conclusão administrativa.', 'final_agreement', p_terms_id)
  from public.exchange_proposals ep
  where ep.id = v_terms.proposal_id;

  perform public.log_audit_event(
    'final_agreement_finalized',
    'final_agreement',
    p_terms_id,
    jsonb_build_object('proposal_id', v_terms.proposal_id)
  );
end;
$$;

create or replace function public.request_agreement_cancellation(
  p_proposal_id uuid,
  p_reason text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_proposal public.exchange_proposals;
  v_id uuid;
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
    raise exception 'Apenas participantes podem solicitar cancelamento.';
  end if;

  if v_proposal.status <> 'accepted' then
    raise exception 'Somente acordo inicial aceito pode receber pedido de cancelamento.';
  end if;

  if nullif(trim(coalesce(p_reason, '')), '') is null then
    raise exception 'Informe o motivo do cancelamento.';
  end if;

  if exists (
    select 1
    from public.agreement_cancellations cancellation
    where cancellation.proposal_id = p_proposal_id
      and cancellation.status = 'requested'
  ) then
    raise exception 'Já existe pedido de cancelamento pendente para este acordo.';
  end if;

  insert into public.agreement_cancellations (
    proposal_id,
    requested_by,
    reason
  )
  values (
    p_proposal_id,
    auth.uid(),
    trim(p_reason)
  )
  returning id into v_id;

  perform public.create_notification(
    case when auth.uid() = v_proposal.requester_id then v_proposal.owner_id else v_proposal.requester_id end,
    'agreement_cancellation_requested',
    'Cancelamento solicitado',
    'A outra parte solicitou cancelamento do acordo inicial. A administração fará a análise.',
    'agreement_cancellation',
    v_id
  );

  perform public.log_audit_event(
    'agreement_cancellation_requested',
    'agreement_cancellation',
    v_id,
    jsonb_build_object('proposal_id', p_proposal_id)
  );

  return v_id;
end;
$$;

create or replace function public.resolve_agreement_cancellation(
  p_cancellation_id uuid,
  p_approved boolean,
  p_notes text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cancellation public.agreement_cancellations;
  v_proposal public.exchange_proposals;
  v_item_ids uuid[];
begin
  if not exists (
    select 1
    from public.profiles moderator
    where moderator.id = auth.uid()
      and moderator.role in ('real_estate_admin', 'admin')
      and moderator.account_status = 'active'
  ) then
    raise exception 'Apenas a administração pode resolver cancelamentos.';
  end if;

  select *
  into v_cancellation
  from public.agreement_cancellations
  where id = p_cancellation_id
  for update;

  if not found then
    raise exception 'Pedido de cancelamento não encontrado.';
  end if;

  if v_cancellation.status <> 'requested' then
    raise exception 'Pedido de cancelamento já resolvido.';
  end if;

  select *
  into v_proposal
  from public.exchange_proposals
  where id = v_cancellation.proposal_id
  for update;

  if not found then
    raise exception 'Proposta vinculada não encontrada.';
  end if;

  update public.agreement_cancellations
  set status = case when p_approved then 'approved' else 'rejected' end,
      resolution_notes = nullif(trim(coalesce(p_notes, '')), ''),
      resolved_by = auth.uid(),
      resolved_at = now()
  where id = p_cancellation_id;

  if p_approved then
    v_item_ids := array_remove(array[
      v_proposal.requested_item_id,
      v_proposal.offered_item_id,
      v_proposal.offered_item_2_id
    ], null);

    update public.exchange_proposals
    set status = 'failed'
    where id = v_proposal.id;

    update public.items
    set status = 'available'
    where id = any(v_item_ids);

    update public.negotiation_leads
    set status = 'cancelled'
    where proposal_id = v_proposal.id;
  else
    update public.negotiation_leads
    set status = 'negotiation'
    where proposal_id = v_proposal.id
      and status <> 'closed';
  end if;

  perform public.create_notification(
    v_proposal.requester_id,
    'agreement_cancellation_resolved',
    'Cancelamento analisado',
    case when p_approved then 'O cancelamento foi aprovado e os imóveis foram liberados.' else 'O pedido foi retornado para ajustes.' end,
    'agreement_cancellation',
    p_cancellation_id
  );
  perform public.create_notification(
    v_proposal.owner_id,
    'agreement_cancellation_resolved',
    'Cancelamento analisado',
    case when p_approved then 'O cancelamento foi aprovado e os imóveis foram liberados.' else 'O pedido foi retornado para ajustes.' end,
    'agreement_cancellation',
    p_cancellation_id
  );

  perform public.log_audit_event(
    case when p_approved then 'agreement_cancellation_approved' else 'agreement_cancellation_rejected' end,
    'agreement_cancellation',
    p_cancellation_id,
    jsonb_build_object(
      'proposal_id', v_proposal.id,
      'approved', p_approved
    )
  );
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
  v_item_ids uuid[];
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

  v_item_ids := array_remove(array[
    v_proposal.requested_item_id,
    v_proposal.offered_item_id,
    v_proposal.offered_item_2_id
  ], null);

  update public.exchange_proposals
  set status = 'failed'
  where id = p_proposal_id;

  update public.items
  set status = 'available'
  where id = any(v_item_ids);

  perform public.log_audit_event(
    'exchange_marked_failed',
    'exchange_proposal',
    p_proposal_id,
    jsonb_build_object('reopened_items_count', coalesce(array_length(v_item_ids, 1), 0))
  );
end;
$$;

revoke execute on function public.set_updated_at() from public;
revoke execute on function public.protect_profile_role_fields() from public;
revoke execute on function public.protect_item_moderation_fields() from public;
revoke execute on function public.create_notification(uuid, text, text, text, text, uuid) from public;
revoke execute on function public.enqueue_email(uuid, text, text, text, uuid) from public;
revoke execute on function public.log_audit_event(text, text, uuid, jsonb) from public;
revoke execute on function public.expire_exchange_proposals() from public;
revoke execute on function public.expire_items() from public;
revoke execute on function public.run_scheduled_maintenance() from public;
revoke execute on function public.get_my_lead_updates() from public;
revoke execute on function public.accept_exchange_proposal(uuid) from public;
revoke execute on function public.reject_exchange_proposal(uuid) from public;
revoke execute on function public.cancel_exchange_proposal(uuid) from public;
revoke execute on function public.counter_exchange_proposal(uuid, numeric, text, text) from public;
revoke execute on function public.request_final_agreement(uuid, text) from public;
revoke execute on function public.accept_final_agreement(uuid) from public;
revoke execute on function public.finalize_final_agreement(uuid) from public;
revoke execute on function public.request_agreement_cancellation(uuid, text) from public;
revoke execute on function public.resolve_agreement_cancellation(uuid, boolean, text) from public;
revoke execute on function public.mark_exchange_failed(uuid) from public;

grant execute on function public.log_audit_event(text, text, uuid, jsonb) to authenticated;
grant execute on function public.get_my_lead_updates() to authenticated;
grant execute on function public.accept_exchange_proposal(uuid) to authenticated;
grant execute on function public.reject_exchange_proposal(uuid) to authenticated;
grant execute on function public.cancel_exchange_proposal(uuid) to authenticated;
grant execute on function public.counter_exchange_proposal(uuid, numeric, text, text) to authenticated;
grant execute on function public.request_final_agreement(uuid, text) to authenticated;
grant execute on function public.accept_final_agreement(uuid) to authenticated;
grant execute on function public.finalize_final_agreement(uuid) to authenticated;
grant execute on function public.request_agreement_cancellation(uuid, text) to authenticated;
grant execute on function public.resolve_agreement_cancellation(uuid, boolean, text) to authenticated;
grant execute on function public.mark_exchange_failed(uuid) to authenticated;

grant execute on function public.run_scheduled_maintenance() to service_role;
