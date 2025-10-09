import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, Image, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useBoardStore } from '@/stores/useBoardStore';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import { CreateBoardModal } from '@/components/CreateBoardModal/CreateBoardModal';
import { useAuth } from '@/providers/AuthProvider';
import { fetchUserOrganizations } from '@/lib/orgs';
import { useBoards, useCreateBoard } from '@/hooks/useBoards';
import { CreateOrganizationModal } from '@/components/CreateOrganizationModal/CreateOrganizationModal';
import { createOrganization } from '@/lib/orgs';
import type { BoardWithStats } from '@/lib/boards';

export const BoardListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user, profile } = useAuth();
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [newBoardDescription, setNewBoardDescription] = useState('');
  const [newBoardColor, setNewBoardColor] = useState('#EDE9FE');
  const [defaultOrganizationId, setDefaultOrganizationId] = useState<string | null>(null);
  const [isCreateOrgVisible, setIsCreateOrgVisible] = useState(false);
  const [orgName, setOrgName] = useState('');
  const [hasOrganization, setHasOrganization] = useState(true);

  // React Query hooks
  const { data: boards = [], isLoading, error } = useBoards();
  const createBoardMutation = useCreateBoard();

  // Fetch default organization
  useEffect(() => {
    if (!user?.id) return;

    (async () => {
      const { organizations } = await fetchUserOrganizations(user.id);
      const firstOrgId = organizations?.[0]?.id ?? null;
      setDefaultOrganizationId(firstOrgId);
      setHasOrganization(Boolean(organizations && organizations.length > 0));
    })();
  }, [user?.id]);

  const handleBoardPress = (boardId: string) => {
    navigation.navigate('BoardDetail', { boardId });
  };

  const handleCreateBoard = async () => {
    const title = newBoardTitle.trim();
    if (!title || !defaultOrganizationId) return;

    console.log('Creating board with title:', title, 'and description:', newBoardDescription.trim(), 'and color:', newBoardColor);

    try {
      await createBoardMutation.mutateAsync({
        organizationId: defaultOrganizationId,
        title,
        description: newBoardDescription.trim(),
        color: newBoardColor,
      });

      setNewBoardTitle('');
      setNewBoardDescription('');
      setNewBoardColor('#EDE9FE');
      setIsCreateModalVisible(false);
    } catch (err) {
      console.error('Failed to create board:', err);
    }
  };

  const handleCreateOrganization = async () => {
    const name = orgName.trim();
    if (!name || !user?.id) return;
    console.log('Creating organization with name:', name, 'and user ID:', user.id);
    try {
      const { organization, error } = await createOrganization({ name, userId: user.id });
      console.log('Organization created:', organization, 'error:', error);
      if (!error && organization) {
        setDefaultOrganizationId(organization.id);
        setIsCreateOrgVisible(false);
        setOrgName('');
      }
    } catch (e) {
      console.error('Failed to create organization:', e);
    }
  };

  // Calculate overall stats
  const totalBoards = boards.length;
  const totalItems = boards.reduce((sum, board) => sum + board.totalItems, 0);
  const totalCompleted = boards.reduce((sum, board) => sum + board.completedItems, 0);
  const completionRate = totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0;

  // Helper function to format time ago
  const getTimeAgo = (dateString: string | null) => {
    if (!dateString) return 'Never updated';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `Updated ${diffMins} minutes ago`;
    if (diffHours < 24) return `Updated ${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `Updated ${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  // Get icon color based on board color
  const getIconColor = (color: string | null): string => {
    const colorMap: Record<string, string> = {
      '#EDE9FE': 'rgb(99, 102, 241)',
      '#DBEAFE': 'rgb(59, 130, 246)',
      '#CFFAFE': 'rgb(6, 182, 212)',
      '#D1FAE5': 'rgb(16, 185, 129)',
      '#FED7AA': 'rgb(249, 115, 22)',
      '#FECACA': 'rgb(239, 68, 68)',
    };
    return colorMap[color || '#EDE9FE'] || 'rgb(99, 102, 241)';
  };

  // Get icon based on board
  const getIconName = (index: number): keyof typeof Ionicons.glyphMap => {
    const icons: (keyof typeof Ionicons.glyphMap)[] = ['briefcase', 'rocket', 'people', 'trending-up'];
    return icons[index % icons.length];
  };

  const renderBoardCard = (board: BoardWithStats, index: number) => {
    const iconColor = getIconColor(board.color);
    const icon = getIconName(index);

    return (
      <Pressable
        key={board.id}
        onPress={() => handleBoardPress(board.id)}
        style={({ pressed }) => [styles.boardCard, pressed && { opacity: 0.9 }]}
      >
        {/* Header: Icon + Title + Menu */}
        <View style={styles.boardCardHeader}>
          <View style={styles.boardCardHeaderLeft}>
            <View style={[styles.boardIcon, { backgroundColor: iconColor }]}>
              <Ionicons name={icon} size={16} color="white" />
            </View>
            <View style={styles.boardHeaderText}>
              <Text style={styles.boardTitle}>{board.title}</Text>
              <Text style={styles.boardUpdated}>{getTimeAgo(board.updated_at)}</Text>
            </View>
          </View>
          <Pressable hitSlop={8}>
            <Ionicons name="ellipsis-vertical" size={16} color="#9ca3af" />
          </Pressable>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Progress</Text>
            <Text style={styles.progressPercent}>{board.progress}%</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${board.progress}%`, backgroundColor: iconColor },
              ]}
            />
          </View>
        </View>

        {/* Footer: Members + Stats */}
        <View style={styles.boardCardFooter}>
          <View style={styles.membersContainer}>
            {board.members.length > 0 && (
              <>
                <View style={styles.avatarStack}>
                  {board.members.slice(0, 3).map((member, idx) => (
                    <View
                      key={member.id}
                      style={[styles.avatar, { marginLeft: idx > 0 ? -8 : 0 }]}
                    >
                      {member.avatar_url ? (
                        <Image source={{ uri: member.avatar_url }} style={styles.avatarImage} />
                      ) : (
                        <View style={styles.avatarPlaceholder}>
                          <Text style={styles.avatarPlaceholderText}>
                            {member.display_name?.[0]?.toUpperCase() || '?'}
                          </Text>
                        </View>
                      )}
                    </View>
                  ))}
                </View>
                {board.members.length > 3 && (
                  <Text style={styles.moreMembers}>+{board.members.length - 3} more</Text>
                )}
              </>
            )}
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.stat}>
              <Ionicons name="list" size={14} color="#6b7280" />
              <Text style={styles.statText}>{board.totalItems}</Text>
            </View>
            <View style={styles.stat}>
              <Ionicons name="chatbubble" size={14} color="#6b7280" />
              <Text style={styles.statText}>{board.totalComments}</Text>
            </View>
          </View>
        </View>
      </Pressable>
    );
  };

  const displayName = profile?.display_name || profile?.username || 'there';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.profileAvatarContainer}>
            {profile?.avatar_url ? (
              <Image source={{ uri: profile.avatar_url }} style={styles.profileAvatar} />
            ) : (
              <View style={styles.profileAvatarPlaceholder}>
                <Ionicons name="person" size={16} color="#9ca3af" />
              </View>
            )}
          </View>
          <View>
            <Text style={styles.headerTitle}>My Boards</Text>
            <Text style={styles.headerSubtitle}>Good morning, {displayName}</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <Pressable hitSlop={8}>
            <Ionicons name="notifications-outline" size={18} color="#374151" />
          </Pressable>
          <Pressable hitSlop={8}>
            <Ionicons name="search-outline" size={18} color="#374151" />
          </Pressable>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* No Organization State */}
        {!hasOrganization && (
          <View style={styles.orgEmptyContainer}>
            <Ionicons name="business-outline" size={48} color="#9ca3af" />
            <Text style={styles.orgEmptyTitle}>No organization yet</Text>
            <Text style={styles.orgEmptySubtext}>Create your first organization to start creating boards</Text>
            <Pressable
              onPress={() => setIsCreateOrgVisible(true)}
              style={({ pressed }) => [styles.emptyButton, pressed && { opacity: 0.9 }]}
            >
              <Ionicons name="add" size={20} color="white" />
              <Text style={styles.emptyButtonText}>Create Organization</Text>
            </Pressable>
          </View>
        )}

        {/* If no org, we stop rendering the rest */}
        {hasOrganization && (
          <>
        {/* Stats Cards */}
        <View style={styles.statsSection}>
          <LinearGradient
            colors={['rgb(99, 102, 241)', 'rgb(139, 92, 246)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.statCard}
          >
            <Text style={styles.statCardValue}>{totalBoards}</Text>
            <Text style={styles.statCardLabel}>Active Boards</Text>
          </LinearGradient>

          <View style={[styles.statCard, { backgroundColor: 'rgb(6, 182, 212)' }]}>
            <Text style={styles.statCardValue}>{totalItems}</Text>
            <Text style={styles.statCardLabel}>Total Items</Text>
          </View>

          <LinearGradient
            colors={['rgb(16, 185, 129)', 'rgb(34, 197, 94)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.statCard}
          >
            <Text style={styles.statCardValue}>{completionRate}%</Text>
            <Text style={styles.statCardLabel}>Completed</Text>
          </LinearGradient>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <Pressable
            onPress={() => setIsCreateModalVisible(true)}
            style={({ pressed }) => [styles.newBoardButton, pressed && { opacity: 0.9 }]}
          >
            <Ionicons name="add" size={14} color="white" />
            <Text style={styles.newBoardButtonText}>New Board</Text>
          </Pressable>

          <Pressable style={({ pressed }) => [styles.filterButton, pressed && { opacity: 0.9 }]}>
            <MaterialCommunityIcons name="filter-variant" size={14} color="#374151" />
            <Text style={styles.filterButtonText}>Filter</Text>
          </Pressable>

          <Pressable style={({ pressed }) => [styles.filterButton, pressed && { opacity: 0.9 }]}>
            <MaterialCommunityIcons name="sort" size={14} color="#374151" />
            <Text style={styles.filterButtonText}>Sort</Text>
          </Pressable>

          <Pressable onPress={() => setIsCreateOrgVisible(true)} style={({ pressed }) => [styles.filterButton, pressed && { opacity: 0.9 }]}>
            <Ionicons name="business-outline" size={14} color="#374151" />
            <Text style={styles.filterButtonText}>New Org</Text>
          </Pressable>
        </View>

        {/* Boards List */}
        <View style={styles.boardsSection}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="rgb(99, 102, 241)" />
              <Text style={styles.loadingText}>Loading boards...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={48} color="#ef4444" />
              <Text style={styles.errorText}>Failed to load boards</Text>
              <Text style={styles.errorSubtext}>{error.message}</Text>
            </View>
          ) : boards.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="folder-open-outline" size={64} color="#d1d5db" />
              <Text style={styles.emptyText}>No boards yet</Text>
              <Text style={styles.emptySubtext}>Create your first board to get started</Text>
              <Pressable
                onPress={() => setIsCreateModalVisible(true)}
                style={({ pressed }) => [styles.emptyButton, pressed && { opacity: 0.9 }]}
              >
                <Ionicons name="add" size={20} color="white" />
                <Text style={styles.emptyButtonText}>Create Board</Text>
              </Pressable>
            </View>
          ) : (
            boards.map((board, index) => renderBoardCard(board, index))
          )}
        </View>
        </>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      {hasOrganization && boards.length > 0 && (
        <View style={styles.fabContainer}>
          <Pressable
            onPress={() => setIsCreateModalVisible(true)}
            style={({ pressed }) => [styles.fab, pressed && { opacity: 0.9 }]}
          >
            <Ionicons name="add" size={20} color="white" />
          </Pressable>
        </View>
      )}

      {/* Create Board Modal */}
      <CreateBoardModal
        visible={isCreateModalVisible}
        onClose={() => setIsCreateModalVisible(false)}
        onSubmit={handleCreateBoard}
        title={newBoardTitle}
        description={newBoardDescription}
        onTitleChange={setNewBoardTitle}
        onDescriptionChange={setNewBoardDescription}
        color={newBoardColor}
        onColorChange={setNewBoardColor}
      />

      <CreateOrganizationModal
        visible={isCreateOrgVisible}
        onClose={() => setIsCreateOrgVisible(false)}
        onSubmit={handleCreateOrganization}
        name={orgName}
        onNameChange={setOrgName}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },

  // Header
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileAvatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
  },
  profileAvatar: {
    width: 32,
    height: 32,
  },
  profileAvatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.gray200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.gray900,
  },
  headerSubtitle: {
    fontSize: 12,
    color: theme.colors.gray500,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  // Stats Section
  statsSection: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    height: 72,
    borderRadius: 12,
    padding: 12,
    justifyContent: 'space-between',
  },
  statCardValue: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.white,
  },
  statCardLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
  },

  // Actions Section
  actionsSection: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 12,
  },
  newBoardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgb(99, 102, 241)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
    gap: 8,
  },
  newBoardButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.white,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.gray100,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
    gap: 8,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.gray700,
  },

  // Boards Section
  boardsSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
    gap: 16,
  },

  // Board Card
  boardCard: {
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  boardCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  boardCardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  boardIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  boardHeaderText: {
    flex: 1,
  },
  boardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.gray900,
    marginBottom: 2,
  },
  boardUpdated: {
    fontSize: 14,
    color: theme.colors.gray500,
  },

  // Progress Section
  progressSection: {
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: theme.colors.gray600,
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.black,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: theme.colors.gray200,
    borderRadius: 9999,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 9999,
  },

  // Board Card Footer
  boardCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  membersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.white,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 20,
    height: 20,
  },
  avatarPlaceholder: {
    width: 20,
    height: 20,
    backgroundColor: theme.colors.gray300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholderText: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.gray600,
  },
  moreMembers: {
    fontSize: 12,
    color: theme.colors.gray500,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 14,
    color: theme.colors.gray500,
  },

  // Loading State
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.gray600,
  },

  // Error State
  errorContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    gap: 12,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.gray900,
  },
  errorSubtext: {
    fontSize: 14,
    color: theme.colors.gray500,
    textAlign: 'center',
  },

  // Empty State
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.gray900,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.gray500,
    textAlign: 'center',
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgb(99, 102, 241)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 9999,
    gap: 8,
    marginTop: 12,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.white,
  },

  // No Organization State
  orgEmptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    gap: 12,
  },
  orgEmptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.gray900,
  },
  orgEmptySubtext: {
    fontSize: 14,
    color: theme.colors.gray500,
    textAlign: 'center',
    paddingHorizontal: 24,
  },

  // Floating Action Button
  fabContainer: {
    position: 'absolute',
    right: 16,
    bottom: 97, // Above tab bar
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgb(99, 102, 241)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
}));
