import React, { useEffect, useMemo, useState } from 'react'
import { View, Text, TextInput, Pressable, Image, ScrollView, ActivityIndicator, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StyleSheet } from 'react-native-unistyles'
import { Ionicons } from '@expo/vector-icons'
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native'
import type { RootStackParamList } from '@/navigation/AppNavigator'
import { useAuth } from '@/providers/AuthProvider'
import {
  fetchOrganizationById,
  fetchOrganizationInvites,
  fetchOrganizationMembers,
  inviteToOrganization,
  leaveOrganization,
  updateOrganization,
  type OrganizationMemberWithProfile,
} from '@/lib/orgs'

type ManageOrgRoute = RouteProp<RootStackParamList, 'ManageOrganization'>

export const ManageOrganizationScreen: React.FC = () => {
  const navigation = useNavigation()
  const { params } = useRoute<ManageOrgRoute>()
  const { user } = useAuth()

  const organizationId = params?.organizationId

  const [orgName, setOrgName] = useState('')
  const [savingName, setSavingName] = useState(false)

  const [members, setMembers] = useState<OrganizationMemberWithProfile[]>([])
  const [loadingMembers, setLoadingMembers] = useState(true)

  const [invites, setInvites] = useState<any[]>([])
  const [loadingInvites, setLoadingInvites] = useState(true)

  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteUsername, setInviteUsername] = useState('')
  const [inviting, setInviting] = useState(false)

  const currentUserRole = useMemo(() => {
    return members.find((m) => m.user_id === user?.id)?.role
  }, [members, user?.id])

  useEffect(() => {
    if (!organizationId) return
    ;(async () => {
      const [{ organization }, { members }, { invites }] = await Promise.all([
        fetchOrganizationById(organizationId),
        fetchOrganizationMembers(organizationId),
        fetchOrganizationInvites(organizationId),
      ])
      if (organization?.name) setOrgName(organization.name)
      setMembers(members || [])
      setLoadingMembers(false)
      setInvites(invites || [])
      setLoadingInvites(false)
    })()
  }, [organizationId])

  const handleSaveName = async () => {
    if (!organizationId) return
    const name = orgName.trim()
    if (!name) return
    setSavingName(true)
    const { error } = await updateOrganization({ organizationId, name })
    if (error) Alert.alert('Error', error)
    setSavingName(false)
  }

  const handleInvite = async () => {
    if (!organizationId || !user?.id) return
    if (!inviteEmail && !inviteUsername) return
    setInviting(true)
    const { error } = await inviteToOrganization({
      organizationId,
      invitedEmail: inviteEmail || undefined,
      invitedUsername: inviteUsername || undefined,
      createdBy: user.id,
    })
    if (error) Alert.alert('Error', error)
    else {
      const { invites } = await fetchOrganizationInvites(organizationId)
      setInvites(invites || [])
      setInviteEmail('')
      setInviteUsername('')
    }
    setInviting(false)
  }

  const handleLeave = async () => {
    if (!organizationId || !user?.id) return
    Alert.alert('Leave organization', 'Are you sure you want to leave this organization?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Leave',
        style: 'destructive',
        onPress: async () => {
          const { error } = await leaveOrganization({ organizationId, userId: user.id })
          if (error) Alert.alert('Error', error)
          else navigation.goBack()
        },
      },
    ])
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.7 }]}>
          <Ionicons name="chevron-back" size={20} color="#374151" />
        </Pressable>
        <Text style={styles.headerTitle}>Manage Organization</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Organization</Text>
          <View style={styles.row}>
            <TextInput
              value={orgName}
              onChangeText={setOrgName}
              placeholder="Organization name"
              style={styles.input}
            />
            <Pressable onPress={handleSaveName} disabled={savingName} style={({ pressed }) => [styles.saveButton, pressed && { opacity: 0.8 }, savingName && { opacity: 0.6 }]}>
              {savingName ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Save</Text>}
            </Pressable>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Members</Text>
          {loadingMembers ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator />
              <Text style={styles.loadingText}>Loading members…</Text>
            </View>
          ) : members.length === 0 ? (
            <Text style={styles.emptyText}>No members yet</Text>
          ) : (
            members.map((m) => (
              <View key={m.user_id} style={styles.memberRow}>
                {m.profile?.avatar_url ? (
                  <Image source={{ uri: m.profile.avatar_url }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Ionicons name="person" size={16} color="#9ca3af" />
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={styles.memberName}>{m.profile?.display_name || m.profile?.username || 'User'}</Text>
                  <Text style={styles.memberSub}>{m.role}</Text>
                </View>
                {m.user_id === user?.id && <Text style={styles.youPill}>You</Text>}
              </View>
            ))
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Invite</Text>
          <Text style={styles.helperText}>Invite by email or username</Text>
          <View style={styles.row}>
            <TextInput
              value={inviteEmail}
              onChangeText={setInviteEmail}
              placeholder="Email (optional)"
              style={styles.input}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>
          <View style={styles.row}>
            <TextInput
              value={inviteUsername}
              onChangeText={setInviteUsername}
              placeholder="Username (optional)"
              style={styles.input}
              autoCapitalize="none"
            />
            <Pressable onPress={handleInvite} disabled={inviting} style={({ pressed }) => [styles.saveButton, pressed && { opacity: 0.8 }, inviting && { opacity: 0.6 }]}>
              {inviting ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Send</Text>}
            </Pressable>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Pending invites</Text>
          {loadingInvites ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator />
              <Text style={styles.loadingText}>Loading invites…</Text>
            </View>
          ) : invites.length === 0 ? (
            <Text style={styles.emptyText}>No pending invites</Text>
          ) : (
            invites.map((inv) => (
              <View key={inv.id} style={styles.inviteRow}>
                <Text style={styles.inviteText}>{inv.invited_email || inv.invited_username}</Text>
                {!inv.accepted_at && <Text style={styles.invitePending}>Pending</Text>}
              </View>
            ))
          )}
        </View>

        {currentUserRole !== 'owner' && (
          <Pressable onPress={handleLeave} style={({ pressed }) => [styles.leaveButton, pressed && { opacity: 0.9 }]}>
            <Ionicons name="log-out-outline" size={16} color="#fff" />
            <Text style={styles.leaveText}>Leave organization</Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray200,
    backgroundColor: theme.colors.white,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.gray100,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.gray900,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  card: {
    borderWidth: 1,
    borderColor: theme.colors.gray200,
    borderRadius: 12,
    backgroundColor: theme.colors.white,
    padding: 12,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.gray800,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: theme.colors.gray300,
    borderRadius: 8,
    paddingHorizontal: 12,
    color: theme.colors.gray900,
  },
  saveButton: {
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgb(99, 102, 241)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    color: theme.colors.gray600,
    fontSize: 14,
  },
  emptyText: {
    color: theme.colors.gray500,
    fontSize: 14,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.gray200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberName: {
    fontSize: 14,
    color: theme.colors.gray900,
  },
  memberSub: {
    fontSize: 12,
    color: theme.colors.gray500,
  },
  youPill: {
    fontSize: 12,
    color: theme.colors.gray700,
    backgroundColor: theme.colors.gray100,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  helperText: {
    fontSize: 12,
    color: theme.colors.gray500,
  },
  inviteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inviteText: {
    fontSize: 14,
    color: theme.colors.gray900,
  },
  invitePending: {
    fontSize: 12,
    color: theme.colors.gray500,
  },
  leaveButton: {
    marginTop: 8,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgb(239, 68, 68)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  leaveText: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
}))

 