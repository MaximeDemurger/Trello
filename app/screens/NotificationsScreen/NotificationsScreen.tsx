import React, { useEffect, useState } from 'react'
import { View, Text, FlatList } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StyleSheet } from 'react-native-unistyles'
import { useAuth } from '@/providers/AuthProvider'
import { fetchInvitesForUser } from '@/lib/orgs'

export const NotificationsScreen: React.FC = () => {
  const { user, profile } = useAuth()
  const [invites, setInvites] = useState<any[]>([])

  useEffect(() => {
    if (!user?.id) return
    ;(async () => {
      const { invites } = await fetchInvitesForUser({ userId: user.id, email: user.email, username: profile?.username ?? null })
      setInvites(invites ?? [])
    })()
  }, [user?.id, user?.email, profile?.username])

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.content}>
        <Text style={styles.title}>Notifications</Text>
        {invites.length === 0 ? (
          <Text style={styles.subtitle}>Aucune invitation pour le moment</Text>
        ) : (
          <FlatList
            data={invites}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.inviteRow}>
                <Text style={styles.inviteText}>
                  Invitation pour {item.organizations?.name ?? 'une organisation'} — Code {item.code}
                </Text>
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create((theme) => ({
  container: { flex: 1, backgroundColor: theme.colors.white },
  content: { padding: theme.spacing.xl },
  title: { fontSize: theme.typography.fontSize.xxl, fontWeight: theme.typography.fontWeight.bold },
  subtitle: { marginTop: theme.spacing.sm, color: theme.colors.gray600 },
  inviteRow: { marginTop: theme.spacing.md, paddingVertical: theme.spacing.sm, borderBottomWidth: 1, borderColor: theme.colors.gray100 },
  inviteText: { color: theme.colors.gray800 },
}))


