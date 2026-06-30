-- Schema inicial - Oportunidades Próximas
-- Aplicar em um projeto Supabase novo ou após backup completo.

create extension if not exists pgcrypto;

create table if not exists business_users (
  id uuid primary key default gen_random_uuid(),
  google_account_id text,
  email text not null unique,
  display_name text not null,
  role text not null default 'OWNER',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_login_at timestamptz
);

create table if not exists business_profile_bindings (
  id uuid primary key default gen_random_uuid(),
  business_user_id uuid references business_users(id) on delete cascade,
  google_account_email text,
  google_business_account_id text,
  google_location_id text,
  google_place_id text,
  location_title text not null,
  address text not null,
  latitude numeric(10,7),
  longitude numeric(10,7),
  primary_category text,
  phone text,
  website_url text,
  verification_state text not null default 'manual_verified',
  is_verified boolean not null default false,
  is_eligible_for_publishing boolean not null default false,
  binding_status text not null default 'manual_verified',
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  revoked_at timestamptz
);

create table if not exists places_of_interest (
  id uuid primary key default gen_random_uuid(),
  business_profile_binding_id uuid references business_profile_bindings(id) on delete set null,
  name text not null,
  category_id text not null,
  address text not null,
  neighborhood text,
  latitude numeric(10,7),
  longitude numeric(10,7),
  phone text,
  website_url text,
  opening_hours jsonb not null default '{}'::jsonb,
  status text not null default 'active',
  is_verified boolean not null default false,
  is_eligible_for_publishing boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists interest_categories (
  id text primary key,
  parent_id text references interest_categories(id),
  name text not null,
  display_name text not null,
  description text,
  icon_name text,
  is_active boolean not null default true,
  is_sensitive boolean not null default false,
  is_mobile_allowed boolean not null default true,
  is_mobile_alert_allowed boolean not null default true,
  is_android_auto_allowed boolean not null default false,
  requires_human_review boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists benefit_alerts (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references places_of_interest(id) on delete cascade,
  created_by_user_id uuid references business_users(id) on delete set null,
  title_internal text not null,
  benefit_type text not null,
  primary_interest_category_id text not null references interest_categories(id),
  valid_from date not null,
  valid_until date not null,
  active_days text[] not null default array[]::text[],
  active_start_time time,
  active_end_time time,
  mobile_list_enabled boolean not null default true,
  mobile_alert_enabled boolean not null default false,
  web_enabled boolean not null default true,
  android_auto_poi_requested boolean not null default false,
  android_auto_poi_eligible boolean not null default false,
  android_auto_poi_published boolean not null default false,
  email_enabled boolean not null default false,
  external_link_enabled boolean not null default false,
  external_link_url text,
  external_link_domain text,
  external_link_status text not null default 'not_applicable',
  button_text text,
  generated_mobile_title text not null,
  generated_mobile_summary text not null,
  car_safe_title text,
  car_safe_summary text,
  moderation_status text not null default 'pending',
  link_moderation_status text not null default 'not_applicable',
  is_mobile_safe boolean not null default true,
  is_car_safe boolean not null default false,
  requires_human_review boolean not null default true,
  main_status text not null default 'draft',
  temporal_status text not null default 'scheduled',
  mobile_list_status text not null default 'enabled',
  mobile_alert_status text not null default 'disabled',
  android_auto_poi_status text not null default 'disabled',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  paused_at timestamptz,
  expired_at timestamptz,
  archived_at timestamptz,
  deleted_at timestamptz,
  constraint benefit_alerts_validity_check check (valid_until >= valid_from),
  constraint benefit_alerts_android_disabled_check check (
    android_auto_poi_published = false and android_auto_poi_status = 'disabled'
  )
);

create table if not exists opportunity_interest_categories (
  id uuid primary key default gen_random_uuid(),
  benefit_alert_id uuid not null references benefit_alerts(id) on delete cascade,
  interest_category_id text not null references interest_categories(id),
  is_primary boolean not null default false,
  relevance_weight integer not null default 1,
  created_at timestamptz not null default now(),
  unique (benefit_alert_id, interest_category_id)
);

create table if not exists consumer_profiles (
  id uuid primary key default gen_random_uuid(),
  google_account_id text,
  email text unique,
  display_name text,
  status text not null default 'active',
  max_distance_meters integer not null default 5000,
  mobile_list_enabled boolean not null default true,
  mobile_alerts_enabled boolean not null default false,
  android_auto_poi_enabled boolean not null default false,
  allow_foreground_location boolean not null default false,
  allow_background_location boolean not null default false,
  quiet_hours_enabled boolean not null default true,
  quiet_hours_start time default '22:00',
  quiet_hours_end time default '07:00',
  daily_alert_limit integer not null default 3,
  consent_version text,
  consent_accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint consumer_no_background_location check (allow_background_location = false),
  constraint consumer_no_android_auto_mvp check (android_auto_poi_enabled = false)
);

create table if not exists consumer_category_preferences (
  id uuid primary key default gen_random_uuid(),
  consumer_profile_id uuid not null references consumer_profiles(id) on delete cascade,
  interest_category_id text not null references interest_categories(id),
  preference_level text not null default 'NORMAL',
  channel_mobile_enabled boolean not null default true,
  channel_mobile_alerts_enabled boolean not null default false,
  channel_android_auto_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (consumer_profile_id, interest_category_id),
  constraint consumer_pref_no_android_auto_mvp check (channel_android_auto_enabled = false)
);

create table if not exists opportunity_history (
  id uuid primary key default gen_random_uuid(),
  consumer_profile_id uuid not null references consumer_profiles(id) on delete cascade,
  benefit_alert_id uuid not null references benefit_alerts(id) on delete cascade,
  place_id uuid references places_of_interest(id) on delete set null,
  delivery_channel text not null,
  delivery_context text,
  delivery_reason text,
  matched_category_ids text[] not null default array[]::text[],
  relevance_score numeric(8,3) not null default 0,
  delivered_at timestamptz not null default now(),
  viewed_at timestamptz,
  saved_at timestamptz,
  dismissed_at timestamptz,
  hidden_at timestamptz,
  reported_at timestamptz,
  expired_at timestamptz,
  last_interaction_at timestamptz,
  status text not null default 'DELIVERED',
  user_action text,
  distance_meters_at_delivery integer,
  location_precision_used text,
  retention_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists alert_metrics_daily (
  id uuid primary key default gen_random_uuid(),
  benefit_alert_id uuid not null references benefit_alerts(id) on delete cascade,
  metric_date date not null,
  views integer not null default 0,
  route_starts integer not null default 0,
  link_clicks integer not null default 0,
  saves integer not null default 0,
  reports integer not null default 0,
  unique (benefit_alert_id, metric_date)
);

insert into interest_categories (id, name, display_name, description, icon_name, sort_order)
values
  ('supermarkets', 'supermarkets', 'Supermercados', 'Compras do dia a dia, alimentos, bebidas e limpeza.', 'shopping_cart', 10),
  ('offers', 'offers', 'Ofertas e Descontos', 'Promoções, descontos e condições especiais.', 'local_offer', 20),
  ('promotion', 'promotion', 'Produtos em Promoção', 'Destaques e promoções de produtos específicos.', 'percent', 30),
  ('bakeries', 'bakeries', 'Padarias', 'Pães, bolos, doces e produtos de padaria.', 'bakery_dining', 40),
  ('fuel', 'fuel', 'Postos de Combustível', 'Combustível, loja de conveniência e serviços rápidos.', 'local_gas_station', 50),
  ('parking', 'parking', 'Estacionamentos', 'Vagas e condições especiais de estacionamento.', 'local_parking', 60)
on conflict (id) do nothing;
