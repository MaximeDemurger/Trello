import { supabase } from '@/lib/supabase'

export type Organization = {
  id: string
  name: string
  created_by: string
  created_at?: string
}

export type OrganizationMember = {
  organization_id: string
  user_id: string
  role: 'owner' | 'admin' | 'member'
  created_at?: string
}

export async function createOrganization(params: { name: string; userId: string }) {
  const { name, userId } = params
  const { data, error } = await supabase
    .from('organizations')
    .insert({ name, created_by: userId })
    .select('*')
    .single()
  if (error) return { error: error.message }
  const org = data as Organization
  // add owner as member
  const { error: memberError } = await supabase
    .from('organization_members')
    .insert({ organization_id: org.id, user_id: userId, role: 'owner' })
  if (memberError) return { error: memberError.message }
  return { organization: org }
}

export async function fetchOrganizationById(organizationId: string) {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', organizationId)
    .maybeSingle()
  if (error) return { error: error.message }
  return { organization: (data as Organization) ?? null }
}

export async function updateOrganization(params: { organizationId: string; name: string }) {
  const { organizationId, name } = params
  const { data, error } = await supabase
    .from('organizations')
    .update({ name })
    .eq('id', organizationId)
    .select('*')
    .maybeSingle()
  if (error) return { error: error.message }
  return { organization: data as Organization }
}

export type OrganizationMemberWithProfile = OrganizationMember & {
  profile: {
    id: string
    username: string | null
    display_name: string | null
    avatar_url: string | null
  }
}

export async function fetchOrganizationMembers(organizationId: string) {
  const { data: rows, error } = await supabase
    .from('organization_members')
    .select('organization_id, user_id, role, created_at')
    .eq('organization_id', organizationId)
  if (error) return { error: error.message }
  const memberIds = (rows ?? []).map((r: any) => r.user_id)
  if (memberIds.length === 0) return { members: [] as OrganizationMemberWithProfile[] }
  const { data: profiles, error: profErr } = await supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url')
    .in('id', memberIds)
  if (profErr) return { error: profErr.message }
  const members = (rows ?? []).map((r: any) => ({
    organization_id: r.organization_id,
    user_id: r.user_id,
    role: r.role,
    created_at: r.created_at,
    profile: profiles?.find((p: any) => p.id === r.user_id) ?? null,
  })) as OrganizationMemberWithProfile[]
  return { members }
}

export async function fetchOrganizationInvites(organizationId: string) {
  const { data, error } = await supabase
    .from('organization_invites')
    .select('*, organizations(name)')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })
  if (error) return { error: error.message }
  return { invites: data || [] }
}

export async function fetchUserOrganizations(userId: string) {
  const { data, error } = await supabase
    .from('organization_members')
    .select('organizations(*)')
    .eq('user_id', userId)
  if (error) return { error: error.message }
  const organizations = (data || []).map((row: any) => row.organizations as Organization)
  return { organizations }
}

export async function leaveOrganization(params: { organizationId: string; userId: string }) {
  const { organizationId, userId } = params
  const { error } = await supabase
    .from('organization_members')
    .delete()
    .eq('organization_id', organizationId)
    .eq('user_id', userId)
  if (error) return { error: error.message }
  return {}
}

export async function inviteToOrganization(params: { organizationId: string; invitedEmail?: string; invitedUsername?: string; createdBy: string }) {
  const { organizationId, invitedEmail, invitedUsername, createdBy } = params
  const code = Math.random().toString(36).slice(2, 8).toUpperCase()
  const { error } = await supabase.from('organization_invites').insert({
    organization_id: organizationId,
    invited_email: invitedEmail ?? null,
    invited_username: invitedUsername ?? null,
    code,
    created_by: createdBy,
  })
  if (error) return { error: error.message }
  return { code }
}

export async function joinOrganizationByCode(params: { code: string; userId: string }) {
  const { code, userId } = params
  const { data: invite, error } = await supabase
    .from('organization_invites')
    .select('*')
    .eq('code', code)
    .is('accepted_at', null)
    .maybeSingle()
  if (error) return { error: error.message }
  if (!invite) return { error: 'Code invalide' }

  const orgId = (invite as any).organization_id as string
  const { error: memberError } = await supabase
    .from('organization_members')
    .insert({ organization_id: orgId, user_id: userId, role: 'member' })
  if (memberError) return { error: memberError.message }

  await supabase
    .from('organization_invites')
    .update({ accepted_at: new Date().toISOString() })
    .eq('id', (invite as any).id)

  return { organizationId: orgId }
}

export async function fetchInvitesForUser(params: { userId: string; email?: string | null; username?: string | null }) {
  const { userId, email, username } = params
  const { data, error } = await supabase
    .from('organization_invites')
    .select('*, organizations(name)')
    .or(
      [
        `created_by.eq.${userId}`,
        email ? `invited_email.eq.${email}` : '',
        username ? `invited_username.eq.${username}` : '',
      ]
        .filter(Boolean)
        .join(',')
    )
    .order('created_at', { ascending: false })
  if (error) return { error: error.message }
  return { invites: data || [] }
}


