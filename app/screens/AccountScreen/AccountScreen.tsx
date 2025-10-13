import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, TextInput, Alert, Image, Switch, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';
import { useAuth } from '@/providers/AuthProvider';
import {
  createOrganization,
  fetchUserOrganizations,
  inviteToOrganization,
  joinOrganizationByCode,
  leaveOrganization,
} from '@/lib/orgs';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { getUserBoardStats } from '@/lib/boards';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import type { RootStackParamList } from '@/navigation/AppNavigator';

export const AccountScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { user, profile, signOut, updateProfile } = useAuth();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [displayName, setDisplayName] = useState(profile?.display_name ?? '');
  const [jobTitle, setJobTitle] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [pushNotif, setPushNotif] = useState(true);
  const [emailNotif, setEmailNotif] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [organizations, setOrganizations] = useState<{ id: string; name: string }[]>([]);
  const [newOrgName, setNewOrgName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteUsername, setInviteUsername] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [stats, setStats] = useState<{
    totalBoards: number;
    totalItems: number;
    completionRate: number;
  }>({ totalBoards: 0, totalItems: 0, completionRate: 0 });

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      const { organizations: orgs } = await fetchUserOrganizations(user.id);
      setOrganizations(orgs ?? []);
      const { stats: s } = await getUserBoardStats(user.id);
      if (s)
        setStats({
          totalBoards: s.totalBoards,
          totalItems: s.totalItems,
          completionRate: s.completionRate,
        });
    })();
  }, [user?.id]);

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const { error } = await updateProfile({ display_name: displayName.trim() || null });
      if (error) Alert.alert('Error', error);
      else Alert.alert('Success', 'Profile updated');
    } finally {
      setIsSaving(false);
    }
  };

  const displayEmail = user?.email || '—';
  const headerName = displayName || profile?.username || 'User';

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={[styles.container]}>
      {/* Header gradient with avatar */}
      <LinearGradient
        colors={['#6366f1', '#8b5cf6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.headerGradient, { paddingTop: insets.top + 24 }]}
      >
        <View style={styles.avatarWrapper}>
          {profile?.avatar_url ? (
            <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Ionicons name="person" size={28} color="white" />
            </View>
          )}
          <View style={styles.cameraBadge}>
            <Ionicons name="camera" size={12} color="white" />
          </View>
        </View>
        <Text style={styles.headerName}>{headerName}</Text>
        <Text style={styles.headerEmail}>{displayEmail}</Text>
        {!!jobTitle && <Text style={styles.headerRole}>{jobTitle}</Text>}
      </LinearGradient>

      {/* Stats cards */}
      <View style={styles.statsRow}>
        <View style={styles.statCardWhite}>
          <Text style={styles.statNumber}>{stats.totalBoards}</Text>
          <Text style={styles.statCaption}>Boards</Text>
        </View>
        <View style={styles.statCardWhite}>
          <Text style={styles.statNumber}>{stats.totalItems}</Text>
          <Text style={styles.statCaption}>Tasks</Text>
        </View>
        <View style={styles.statCardWhite}>
          <Text style={styles.statNumber}>{stats.completionRate}%</Text>
          <Text style={styles.statCaption}>Complete</Text>
        </View>
      </View>

      {/* Personal Information */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          value={displayName}
          onChangeText={setDisplayName}
          placeholder="Your full name"
          style={styles.input}
        />
        <Text style={styles.label}>Email Address</Text>
        <View style={[styles.input, { justifyContent: 'center' }]}>
          <Text style={{ color: '#6b7280' }}>{displayEmail}</Text>
        </View>
        <Text style={styles.label}>Job Title</Text>
        <TextInput
          value={jobTitle}
          onChangeText={setJobTitle}
          placeholder="Job title"
          style={styles.input}
        />
        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          placeholder="+1 (555) 123-4567"
          style={styles.input}
          keyboardType="phone-pad"
        />
      </View>

      {/* Preferences */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.prefRow}>
          <View>
            <Text style={styles.prefTitle}>Push Notifications</Text>
            <Text style={styles.prefSubtitle}>Receive updates on your boards</Text>
          </View>
          <Switch value={pushNotif} onValueChange={setPushNotif} />
        </View>
        <View style={styles.prefRow}>
          <View>
            <Text style={styles.prefTitle}>Email Notifications</Text>
            <Text style={styles.prefSubtitle}>Weekly digest and updates</Text>
          </View>
          <Switch value={emailNotif} onValueChange={setEmailNotif} />
        </View>
        <View style={styles.prefRow}>
          <View>
            <Text style={styles.prefTitle}>Dark Mode</Text>
            <Text style={styles.prefSubtitle}>Switch to dark theme</Text>
          </View>
          <Switch value={darkMode} onValueChange={setDarkMode} />
        </View>
      </View>

      {/* Organization actions */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Organization</Text>
        <Pressable
          style={styles.actionRow}
          onPress={() => {
            const orgId = organizations?.[0]?.id
            if (orgId) {
              // Navigate into nested Boards stack screen
              // @ts-expect-error nested navigation
              navigation.navigate('Boards', {
                screen: 'ManageOrganization',
                params: { organizationId: orgId },
              })
            } else {
              Alert.alert('No organization', 'Create an organization first to manage it.')
            }
          }}
        >
          <View style={[styles.actionIcon, { backgroundColor: 'rgba(99,102,241,0.1)' }]}>
            <MaterialCommunityIcons name="view-dashboard" size={16} color={'rgb(99,102,241)'} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.actionTitle}>Manage Organization</Text>
            <Text style={styles.actionSubtitle}>Settings and team members</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={'#9ca3af'} />
        </Pressable>

        <Pressable style={styles.actionRow}>
          <View style={[styles.actionIcon, { backgroundColor: 'rgba(6,182,212,0.1)' }]}>
            <Ionicons name="person-add" size={16} color={'rgb(6,182,212)'} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.actionTitle}>Invite Team Members</Text>
            <Text style={styles.actionSubtitle}>Add people to your workspace</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={'#9ca3af'} />
        </Pressable>
      </View>

      {/* Account actions */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Account</Text>
        <Pressable style={styles.actionRow}>
          <View style={[styles.actionIcon, { backgroundColor: 'rgba(59,130,246,0.1)' }]}>
            <Ionicons name="key-outline" size={16} color={'rgb(59,130,246)'} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.actionTitle}>Change Password</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={'#9ca3af'} />
        </Pressable>

        <Pressable style={styles.actionRow}>
          <View style={[styles.actionIcon, { backgroundColor: 'rgba(17,24,39,0.06)' }]}>
            <Ionicons name="shield-checkmark-outline" size={16} color={'#111827'} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.actionTitle}>Privacy Settings</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={'#9ca3af'} />
        </Pressable>

        <Pressable onPress={signOut} style={styles.actionRow}>
          <View style={[styles.actionIcon, { backgroundColor: 'rgba(239,68,68,0.15)' }]}>
            <Ionicons name="log-out-outline" size={16} color={'#ef4444'} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.actionTitle, { color: '#ef4444' }]}>Sign Out</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={'#ef4444'} />
        </Pressable>
      </View>

      <Pressable
        onPress={handleSave}
        style={({ pressed }) => [styles.savePrimary, pressed && { opacity: 0.9 }]}
        disabled={isSaving}
      >
        <Text style={styles.savePrimaryText}>{isSaving ? 'Saving…' : 'Save Changes'}</Text>
      </Pressable>
    </ScrollView>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: { flex: 1, backgroundColor: theme.colors.white },
  headerGradient: {
    paddingBottom: 32,
    alignItems: 'center',
  },
  avatarWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  avatar: { width: '100%', height: '100%', borderRadius: 36 },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  cameraBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(99,102,241,1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  headerName: {
    color: theme.colors.white,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.xl,
    marginTop: 12,
  },
  headerEmail: { color: 'rgba(255,255,255,0.9)', marginTop: 2 },
  headerRole: { color: 'rgba(255,255,255,0.9)', marginTop: 4, fontSize: 12 },

  statsRow: {
    marginTop: -16,
    marginHorizontal: 16,
    flexDirection: 'row',
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
  },
  statCardWhite: {
    flex: 1,
    backgroundColor: theme.colors.white,
    paddingVertical: 14,
    alignItems: 'center',
  },
  statNumber: { fontWeight: theme.typography.fontWeight.bold, color: theme.colors.gray900 },
  statCaption: { marginTop: 4, fontSize: 12, color: theme.colors.gray500 },

  sectionCard: {
    marginTop: 16,
    marginHorizontal: 16,
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
  },
  sectionTitle: {
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.gray900,
    marginBottom: 12,
  },
  label: { color: theme.colors.gray700, marginTop: 8, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.gray200,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: theme.colors.white,
  },

  prefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  prefTitle: { color: theme.colors.gray900, fontWeight: theme.typography.fontWeight.medium },
  prefSubtitle: { color: theme.colors.gray500, fontSize: 12 },

  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  actionIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionTitle: { color: theme.colors.gray900, fontWeight: theme.typography.fontWeight.medium },
  actionSubtitle: { color: theme.colors.gray500, fontSize: 12 },

  savePrimary: {
    marginHorizontal: 16,
    marginVertical: 24,
    backgroundColor: 'rgb(99,102,241)',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  savePrimaryText: { color: theme.colors.white, fontWeight: theme.typography.fontWeight.semiBold },
}));
