import React, { useEffect, useState } from 'react'
import { View, Text, Pressable, ScrollView, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StyleSheet } from 'react-native-unistyles'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native'
import type { RootStackParamList } from '@/navigation/AppNavigator'
import { fetchBoardById } from '@/lib/boards'
import { fetchOrganizationMembers, type OrganizationMemberWithProfile } from '@/lib/orgs'
import { useBoardStore } from '@/stores/useBoardStore'

type RouteP = RouteProp<RootStackParamList, 'BoardMembers'>

export const BoardMembersScreen: React.FC = () => {
  const navigation = useNavigation()
  const { params } = useRoute<RouteP>()
  const { boardId } = params

  const { getBoardWithGroups } = useBoardStore()
  const board = getBoardWithGroups(boardId)

  const [orgMembers, setOrgMembers] = useState<OrganizationMemberWithProfile[]>([])
  const [loading, setLoading] = useState(true)

  // Get current board members
  const boardMemberIds = new Set(board?.members || [])
  const currentMembers = orgMembers.filter(m => boardMemberIds.has(m.user_id))

  useEffect(() => {
    ;(async () => {
      const { board } = await fetchBoardById(boardId)
      if (board?.organization_id) {
        const { members } = await fetchOrganizationMembers(board.organization_id)
        setOrgMembers(members || [])
      }
      setLoading(false)
    })()
  }, [boardId])

  const totalItems = board?.groups?.reduce((sum, g) => sum + g.items.length, 0) || 0

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.7 }]}>
          <Ionicons name="chevron-back" size={20} color="#374151" />
        </Pressable>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Board Members</Text>
          <Text style={styles.headerSubtitle}>{totalItems} items • {currentMembers.length} members</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Current Members Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Current Members</Text>
            <Text style={styles.memberCount}>{currentMembers.length} members</Text>
          </View>

          {loading ? (
            <Text style={styles.loadingText}>Loading members…</Text>
          ) : currentMembers.length === 0 ? (
            <Text style={styles.emptyText}>No members assigned to this board</Text>
          ) : (
            <View style={styles.membersList}>
              {currentMembers.map((m) => {
                const profile = m.profile
                const displayName = profile?.display_name || profile?.username || 'User'
                const role = m.role
                const subtitle = profile?.username ? `@${profile.username}` : role
                const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

                return (
                  <View key={m.user_id} style={styles.memberRow}>
                    <View style={styles.avatarContainer}>
                      {profile?.avatar_url ? (
                        <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
                      ) : (
                        <View style={[styles.avatarPlaceholder, { backgroundColor: '#6366f1' }]}>
                          <Text style={styles.avatarText}>{initials}</Text>
                        </View>
                      )}
                    </View>
                    
                    <View style={styles.memberInfo}>
                      <Text style={styles.memberName}>{displayName}</Text>
                      <Text style={styles.memberSubtitle}>{subtitle}</Text>
                    </View>

                    <View style={[styles.roleBadge, role === 'owner' || role === 'admin' ? styles.roleBadgeAdmin : styles.roleBadgeMember]}>
                      <Text style={[styles.roleText, role === 'owner' || role === 'admin' ? styles.roleTextAdmin : styles.roleTextMember]}>
                        {role === 'owner' ? 'Admin' : role === 'admin' ? 'Admin' : 'Member'}
                      </Text>
                    </View>
                  </View>
                )
              })}
            </View>
          )}
        </View>

        {/* Invite Button */}
        <Pressable 
          onPress={() => {
            // TODO: Navigate to invite screen or show invite modal
            console.log('Invite member')
          }}
          style={({ pressed }) => [styles.inviteButton, pressed && { opacity: 0.9 }]}
        >
          <Text style={styles.inviteButtonText}>Invite member</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create((theme) => ({
  container: { 
    flex: 1, 
    backgroundColor: '#f9fafb',
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: theme.colors.white,
    gap: 12,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: { 
    fontSize: 18, 
    fontWeight: '600', 
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  
  // Content
  content: { 
    padding: 16,
  },
  
  // Section
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: '600', 
    color: '#111827',
  },
  memberCount: {
    fontSize: 14,
    color: '#6b7280',
  },
  
  loadingText: {
    color: '#6b7280',
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 20,
  },
  
  // Members List
  membersList: {
    gap: 12,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    gap: 12,
  },
  
  // Avatar
  avatarContainer: {
    width: 40,
    height: 40,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Member Info
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  memberSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  
  // Role Badge
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  roleBadgeAdmin: {
    backgroundColor: '#e0e7ff',
  },
  roleBadgeMember: {
    backgroundColor: '#f3f4f6',
  },
  roleText: {
    fontSize: 12,
    fontWeight: '500',
  },
  roleTextAdmin: {
    color: '#4f46e5',
  },
  roleTextMember: {
    color: '#4b5563',
  },
  
  // Invite Button
  inviteButton: {
    height: 48,
    borderRadius: 8,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inviteButtonText: { 
    color: theme.colors.white, 
    fontSize: 16, 
    fontWeight: '500',
  },
}))
