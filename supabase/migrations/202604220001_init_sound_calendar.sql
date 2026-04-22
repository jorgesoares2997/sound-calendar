create table if not exists public.members (
  id text primary key,
  name text not null,
  role text not null default '',
  telegram_id text not null default '',
  email text not null default '',
  phone text not null default '',
  color text not null default '#22c55e',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.shifts (
  id text primary key,
  date date not null,
  title text not null,
  type text not null,
  start_time text not null,
  end_time text not null,
  member_ids text[] not null default '{}',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists shifts_unique_slot_idx on public.shifts (date, start_time, type);
create index if not exists shifts_date_idx on public.shifts (date);

create table if not exists public.settings (
  id int primary key default 1 check (id = 1),
  bot_token text not null default '',
  group_chat_id text not null default '',
  team_name text not null default 'Sound Team',
  reminder_message text not null default '🎛️ Lembrete de escala!\n\n{member} você está na escala de *{date}* ({shift}).\n\nFique atento ao horário! 🙏',
  default_reminder_hours int not null default 24,
  updated_at timestamptz not null default now()
);

create table if not exists public.notification_logs (
  id bigserial primary key,
  summary_type text not null,
  channel text not null,
  recipients jsonb not null default '[]'::jsonb,
  status text not null,
  error text not null default '',
  created_at timestamptz not null default now()
);

insert into public.members (id, name, role, telegram_id, email, phone, color, active)
values
  ('1', 'Jorge Soares', 'Líder de Som', 'jorge', 'jorgesoares2997@gmail.com', '+55 81 98759-4291', '#7c3aed', true),
  ('2', 'Laís Vitória', 'Técnico Senior', 'laisvitoria890', 'laisv940@gmail.com', '+55 81 99332-3696', '#22c55e', true),
  ('3', 'Vitor Cajueirinho', 'Técnico Pleno', 'vitor', 'brvictor556@gmail.com', '+55 81 98754-8374', '#22c55e', true),
  ('4', 'Ihago', 'Técnico Pleno', 'ihago', 'ihagoluissilva@gmail.com', '+55 81 99697-7614', '#22c55e', true),
  ('5', 'Matheus Eliaquim', 'Técnico Senior', 'matheus', 'matheuswesley31@gmail.com', '+55 81 99543-3971', '#22c55e', true)
on conflict (id) do nothing;

insert into public.settings (id)
values (1)
on conflict (id) do nothing;
