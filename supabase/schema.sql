-- Ensure required extensions
create extension if not exists pgcrypto;

-- Profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  display_name text,
  avatar_url text,
  onboarding_completed boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- Organizations
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now()
);

alter table public.organizations enable row level security;
create policy "Org members can select org" on public.organizations for select using (
  exists(select 1 from public.organization_members m where m.organization_id = id and m.user_id = auth.uid())
);
create policy "Owners can update org" on public.organizations for update using (
  exists(select 1 from public.organization_members m where m.organization_id = id and m.user_id = auth.uid() and m.role = 'owner')
);
create policy "Any user can create org" on public.organizations for insert with check (auth.uid() = created_by);

-- Organization members
create table if not exists public.organization_members (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner','admin','member')),
  created_at timestamptz default now(),
  primary key (organization_id, user_id)
);

alter table public.organization_members enable row level security;
create policy "Members can select their membership" on public.organization_members for select using (user_id = auth.uid());
create policy "Users can insert self membership" on public.organization_members for insert with check (user_id = auth.uid());
create policy "Users can delete self membership" on public.organization_members for delete using (user_id = auth.uid());

-- Organization invites
create table if not exists public.organization_invites (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  invited_email text,
  invited_username text,
  code text not null,
  created_by uuid not null references auth.users(id) on delete cascade,
  accepted_at timestamptz,
  created_at timestamptz default now()
);

alter table public.organization_invites enable row level security;
create policy "Members can manage invites" on public.organization_invites for all using (
  exists(select 1 from public.organization_members m where m.organization_id = organization_id and m.user_id = auth.uid())
);
create policy "Invited user can view their invite" on public.organization_invites for select using (
  (invited_email is not null and (auth.jwt() ->> 'email') = invited_email)
  or (invited_username is not null and exists(select 1 from public.profiles p where p.id = auth.uid() and p.username = invited_username))
);

-- Boards
create table if not exists public.boards (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  title text not null,
  description text,
  color text,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.boards enable row level security;
create policy "Org members can read boards" on public.boards for select using (
  exists(select 1 from public.organization_members m where m.organization_id = organization_id and m.user_id = auth.uid())
);
create policy "Org members can create boards" on public.boards for insert with check (
  exists(select 1 from public.organization_members m where m.organization_id = boards.organization_id and m.user_id = auth.uid())
);
create policy "Creators can update boards" on public.boards for update using (created_by = auth.uid());
create policy "Creators can delete boards" on public.boards for delete using (created_by = auth.uid());

-- Groups (columns)
create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.boards(id) on delete cascade,
  title text not null,
  "order" int not null default 0,
  created_at timestamptz default now()
);

alter table public.groups enable row level security;
create policy "Members can read groups" on public.groups for select using (
  exists(select 1 from public.boards b join public.organization_members m on m.organization_id = b.organization_id where b.id = groups.board_id and m.user_id = auth.uid())
);
create policy "Members can create groups" on public.groups for insert with check (
  exists(select 1 from public.boards b join public.organization_members m on m.organization_id = b.organization_id where b.id = groups.board_id and m.user_id = auth.uid())
);
create policy "Members can update groups" on public.groups for update using (
  exists(select 1 from public.boards b join public.organization_members m on m.organization_id = b.organization_id where b.id = groups.board_id and m.user_id = auth.uid())
);
create policy "Members can delete groups" on public.groups for delete using (
  exists(select 1 from public.boards b join public.organization_members m on m.organization_id = b.organization_id where b.id = groups.board_id and m.user_id = auth.uid())
);

-- Items (cards)
create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.boards(id) on delete cascade,
  group_id uuid not null references public.groups(id) on delete cascade,
  title text not null,
  description text,
  "order" int not null default 0,
  priority text,
  labels text[] default '{}',
  assigned_member_ids uuid[] default '{}',
  due_date timestamptz,
  archived boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.items enable row level security;
create policy "Members can read items" on public.items for select using (
  exists(select 1 from public.boards b join public.organization_members m on m.organization_id = b.organization_id where b.id = items.board_id and m.user_id = auth.uid())
);
create policy "Members can manage items" on public.items for all using (
  exists(select 1 from public.boards b join public.organization_members m on m.organization_id = b.organization_id where b.id = items.board_id and m.user_id = auth.uid())
);


