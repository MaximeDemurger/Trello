-- Allow organization members to read all membership rows for their organization
alter table if exists public.organization_members enable row level security;
drop policy if exists "Members can select their membership" on public.organization_members;
create policy "Org members can read memberships" on public.organization_members
  for select
  using (
    exists(
      select 1
      from public.organization_members m
      where m.organization_id = organization_members.organization_id
        and m.user_id = auth.uid()
    )
  );

-- Keep insert/delete self rules
drop policy if exists "Users can insert self membership" on public.organization_members;
create policy "Users can insert self membership" on public.organization_members
  for insert
  with check (user_id = auth.uid());

drop policy if exists "Users can delete self membership" on public.organization_members;
create policy "Users can delete self membership" on public.organization_members
  for delete
  using (user_id = auth.uid());



