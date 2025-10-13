import { supabase } from '@/lib/supabase'
import { Database } from '../../supabase/types'

export type BoardRow = Database['public']['Tables']['boards']['Row']

export type BoardWithStats = {
  id: string
  title: string
  description: string | null
  color: string | null
  updated_at: string | null
  progress: number
  totalItems: number
  completedItems: number
  totalComments: number
  members: {
    id: string
    avatar_url: string | null
    display_name: string | null
  }[]
}

export async function fetchBoardsWithStatsForUser(userId: string): Promise<{
  boards?: BoardWithStats[]
  error?: string
}> {
  try {
    // First get user's organizations
    const { data: memberOrgs, error: orgsError } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', userId)

    if (orgsError) return { error: orgsError.message }
    if (!memberOrgs || memberOrgs.length === 0) return { boards: [] }

    const orgIds = memberOrgs.map((m) => m.organization_id)

    // Fetch boards with groups and items
    const { data: boards, error: boardsError } = await supabase
      .from('boards')
      .select(`
        id,
        title,
        description,
        color,
        updated_at,
        organization_id,
        groups(
          id,
          items(
            id,
            archived,
            assigned_member_ids
          )
        )
      `)
      .in('organization_id', orgIds)
      .order('updated_at', { ascending: false })

    if (boardsError) return { error: boardsError.message }
    if (!boards) return { boards: [] }

    // Get all unique member IDs from all boards
    const allMemberIds = new Set<string>()
    boards.forEach((board: any) => {
      board.groups?.forEach((group: any) => {
        group.items?.forEach((item: any) => {
          item.assigned_member_ids?.forEach((id: string) => {
            allMemberIds.add(id)
          })
        })
      })
    })

    // Fetch all member profiles at once
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, avatar_url, display_name')
      .in('id', Array.from(allMemberIds))

    const profilesMap = new Map(profiles?.map((p) => [p.id, p]) || [])

    // Calculate stats for each board
    const boardsWithStats: BoardWithStats[] = boards.map((board: any) => {
      const allItems = board.groups?.flatMap((g: any) => g.items || []) || []
      const activeItems = allItems.filter((item: any) => !item.archived)
      const totalItems = allItems.length
      
      // Consider archived items as completed (can be adjusted based on your logic)
      const completedItems = allItems.filter((item: any) => item.archived).length
      const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

      // Get unique members from items
      const memberIds = new Set<string>()
      allItems.forEach((item: any) => {
        item.assigned_member_ids?.forEach((id: string) => memberIds.add(id))
      })

      const members = Array.from(memberIds)
        .map((id) => profilesMap.get(id))
        .filter((p) => p) as any[]

      return {
        id: board.id,
        title: board.title,
        description: board.description,
        color: board.color,
        updated_at: board.updated_at,
        progress,
        totalItems,
        completedItems,
        totalComments: 0, // We can add comments table later
        members: members.slice(0, 10), // Limit to first 10
      }
    })

    return { boards: boardsWithStats }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export async function fetchBoardsForUser(userId: string) {
  // Fetch boards in orgs where the user is a member
  const { data, error } = await supabase
    .from('boards')
    .select('*')
    .in(
      'organization_id',
      (
        await supabase
          .from('organization_members')
          .select('organization_id')
          .eq('user_id', userId)
      ).data?.map((m) => m.organization_id) || []
    )

  if (error) return { error: error.message }
  return { boards: (data || []) as BoardRow[] }
}

export async function createBoard(params: { organizationId: string; title: string; description?: string; color?: string; userId: string }) {
  const { organizationId, title, description, color, userId } = params
  const { data, error } = await supabase
    .from('boards')
    .insert({ organization_id: organizationId, title, description: description ?? null, color: color ?? null, created_by: userId })
    .select('*')
    .single()
  if (error) return { error: error.message }
  return { board: data as BoardRow }
}

export async function updateBoard(params: { id: string; title?: string; description?: string | null; color?: string | null }) {
  const { id, title, description, color } = params
  const updates: any = {}
  if (typeof title !== 'undefined') updates.title = title
  if (typeof description !== 'undefined') updates.description = description
  if (typeof color !== 'undefined') updates.color = color
  const { data, error } = await supabase
    .from('boards')
    .update(updates)
    .eq('id', id)
    .select('*')
    .maybeSingle()
  if (error) return { error: error.message }
  return { board: data as BoardRow }
}

export async function fetchBoardById(boardId: string): Promise<{
  board?: { id: string; title: string; description: string | null; color: string | null; organization_id: string }
  error?: string
}> {
  const { data, error } = await supabase
    .from('boards')
    .select('id, title, description, color, organization_id')
    .eq('id', boardId)
    .maybeSingle()
  if (error) return { error: error.message }
  if (!data) return { error: 'Board not found' }
  return { board: data as any }
}

export async function searchBoardsForUser(params: { userId: string; query: string }) {
  const { userId, query } = params
  const orgIds = (
    await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', userId)
  ).data?.map((m) => m.organization_id) || []
  if (orgIds.length === 0) return { boards: [] as BoardRow[] }
  const { data, error } = await supabase
    .from('boards')
    .select('*')
    .in('organization_id', orgIds)
    .ilike('title', `%${query}%`)
    .limit(20)
  if (error) return { error: error.message }
  return { boards: (data || []) as BoardRow[] }
}

export async function getUserBoardStats(userId: string): Promise<{
  stats?: {
    totalBoards: number
    totalItems: number
    completedItems: number
    completionRate: number
  }
  error?: string
}> {
  try {
    const { boards, error } = await fetchBoardsWithStatsForUser(userId)
    if (error) return { error }
    if (!boards) return { stats: { totalBoards: 0, totalItems: 0, completedItems: 0, completionRate: 0 } }

    const totalBoards = boards.length
    const totalItems = boards.reduce((sum, board) => sum + board.totalItems, 0)
    const completedItems = boards.reduce((sum, board) => sum + board.completedItems, 0)
    const completionRate = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

    return {
      stats: {
        totalBoards,
        totalItems,
        completedItems,
        completionRate,
      },
    }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unknown error' }
  }
}


