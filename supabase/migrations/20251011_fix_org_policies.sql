-- Ensure organizations RLS policies allow creators to read their new org rows
-- This fixes errors like: "new row violates row-level security policy for table organizations"

-- Recreate permissive INSERT policy to be explicit
alter table if exists public.organizations enable row level security;
drop policy if exists "Any user can create org" on public.organizations;
create policy "Any user can create org" on public.organizations
  for insert
  with check (auth.uid() = created_by);

-- Allow creators to SELECT orgs they created (even before membership exists)
drop policy if exists "Creators can select org" on public.organizations;
create policy "Creators can select org" on public.organizations
  for select
  using (created_by = auth.uid());

-- Keep owners update policy intact (recreate defensively)
drop policy if exists "Owners can update org" on public.organizations;
create policy "Owners can update org" on public.organizations
  for update
  using (
    exists(
      select 1
      from public.organization_members m
      where m.organization_id = organizations.id
        and m.user_id = auth.uid()
        and m.role = 'owner'
    )
  );

-- Keep members select policy intact (recreate defensively)
drop policy if exists "Org members can select org" on public.organizations;
create policy "Org members can select org" on public.organizations
  for select
  using (
    exists(
      select 1
      from public.organization_members m
      where m.organization_id = organizations.id
        and m.user_id = auth.uid()
    )
  );


