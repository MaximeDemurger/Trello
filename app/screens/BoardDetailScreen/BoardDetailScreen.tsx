import React, { useState, useEffect, useRef } from "react";
import { View, Text, ScrollView, Pressable, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeIn } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import {
  GroupColumn,
  CreateItemModal,
  CreateGroupModal,
  ItemDetailsModal,
} from "@/components";
import { useBoardStore } from "@/stores/useBoardStore";
import type { RootStackParamList } from "@/navigation/AppNavigator";
import { DragDropProvider } from "@/components/DragDropProvider/DragDropProvider";
import { useDraggingContext } from "@/components/DragDropProvider/dragDropContext";

type BoardDetailRouteProp = RouteProp<RootStackParamList, "BoardDetail">;

const BoardContent: React.FC<{ boardId: string }> = ({ boardId }) => {
  const navigation = useNavigation();
  const scrollViewRef = useRef<ScrollView>(null);
  const { setScrollViewRef, updateScrollOffset } = useDraggingContext();

  const [createItemVisible, setCreateItemVisible] = useState(false);
  const [createItemGroupId, setCreateItemGroupId] = useState<string | null>(
    null
  );
  const [createGroupVisible, setCreateGroupVisible] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [detailsItemId, setDetailsItemId] = useState<string | null>(null);

  const { getBoardWithGroups } = useBoardStore();
  const [board, setBoard] = useState(getBoardWithGroups(boardId));
  const [archivedItems, setArchivedItems] = useState<any[]>([]);
  const [allItems, setAllItems] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = useBoardStore.subscribe(() => {
      setBoard(getBoardWithGroups(boardId));
      const items = useBoardStore.getState().items;
      setArchivedItems(items.filter((i) => i.boardId === boardId && i.archived));
      setAllItems(items.filter((i) => i.boardId === boardId));
    });
    const items = useBoardStore.getState().items;
    setArchivedItems(items.filter((i) => i.boardId === boardId && i.archived));
    setAllItems(items.filter((i) => i.boardId === boardId));
    return unsubscribe;
  }, [boardId]);

  useEffect(() => {
    setScrollViewRef(scrollViewRef.current);
    return () => setScrollViewRef(null);
  }, [setScrollViewRef]);

  if (!board) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Board not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isEmpty = board.groups.length === 0;

  const handleAddItem = (groupId: string) => {
    setCreateItemGroupId(groupId);
    setCreateItemVisible(true);
  };

  const handleItemPress = (itemId: string) => {
    setDetailsItemId(itemId);
    setDetailsVisible(true);
  };

  const handleDeleteItem = (itemId: string) => {
    const { deleteItem } = useBoardStore.getState();
    deleteItem(itemId);
  };

  const handleArchiveItem = (itemId: string) => {
    const { archiveItem } = useBoardStore.getState();
    archiveItem(itemId);
  };

  const handleUnarchiveItem = (itemId: string) => {
    const { unarchiveItem } = useBoardStore.getState();
    unarchiveItem(itemId);
  };

  // Derived stats for header/progress
  const totalItems = allItems.length;
  const totalMembers = React.useMemo(() => {
    const ids = new Set<string>();
    allItems.forEach((it: any) => it.assignedMembers?.forEach((m: any) => ids.add(m.id)));
    return ids.size;
  }, [allItems]);
  const completedItems = archivedItems.length;
  const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Animated.View entering={FadeIn.duration(300)} style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={({ pressed }) => [
            styles.backButton,
            pressed && { opacity: 0.7 },
          ]}
        >
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </Pressable>

        <View style={styles.headerContent}>
          <Text style={styles.title} numberOfLines={1}>{board.title}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>{totalItems} items • {totalMembers} members</Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          <Pressable accessibilityLabel="Members" hitSlop={8} style={styles.headerIconBtn}>
            <Ionicons name="people-outline" size={18} color="#6b7280" />
          </Pressable>
          <Pressable accessibilityLabel="More" hitSlop={8} style={styles.headerIconBtn}>
            <Ionicons name="ellipsis-vertical" size={18} color="#6b7280" />
          </Pressable>
        </View>
      </Animated.View>

      {/* Progress Banner */}
      <LinearGradient
        colors={["#6366f1", "#8b5cf6"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.progressBanner}
      >
        <View>
          <Text style={styles.progressPercent}>{progress}%</Text>
          <Text style={styles.progressLabel}>Project Progress</Text>
        </View>
        <View style={styles.bannerAvatars}>
          {Array.from(new Set(allItems.flatMap((it: any) => it.assignedMembers || [] )).values())
            .slice(0, 3)
            .map((m: any, idx: number) => (
              <View key={m.id || idx} style={[styles.bannerAvatar, { marginLeft: idx === 0 ? 0 : -8, backgroundColor: m?.color || 'rgba(255,255,255,0.25)' }]}> 
                {m?.avatar ? (
                  <Image source={{ uri: m.avatar }} style={{ width: 28, height: 28, borderRadius: 14 }} />
                ) : (
                  <Text style={styles.bannerAvatarText}>{m?.initials || '?'}</Text>
                )}
              </View>
          ))}
        </View>
      </LinearGradient>

      {isEmpty ? (
        <View style={[styles.scrollView, styles.emptyState]}>
          <Ionicons name="albums-outline" size={48} color="#9ca3af" />
          <Text style={styles.emptyTitle}>No groups yet</Text>
          <Text style={styles.emptySubtitle}>
            Create your first group to start organizing items.
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Create group"
            onPress={() => setCreateGroupVisible(true)}
            style={({ pressed }) => [
              styles.addGroupButton,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Ionicons name="add" size={24} color="#6b7280" />
            <Text style={styles.addGroupText}>Add group</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          ref={scrollViewRef}
          horizontal
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsHorizontalScrollIndicator={false}
          onScroll={(event) => {
            updateScrollOffset(event.nativeEvent.contentOffset.x);
          }}
          scrollEventThrottle={16}
          snapToAlignment="center"
          snapToInterval={336}
          decelerationRate="fast"
        >
          {board.groups.map((group) => (
            <GroupColumn
              key={group.id}
              group={group}
              boardColor={board.color}
              onItemPress={handleItemPress}
              onDeleteItem={handleDeleteItem}
              onArchiveItem={handleArchiveItem}
              onAddItem={handleAddItem}
            />
          ))}

          {archivedItems.length > 0 && (
            <GroupColumn
              key="archived"
              group={{
                id: "archived",
                title: "Archived",
                boardId,
                order: 9999,
                createdAt: "",
                items: archivedItems,
              }}
              boardColor={board.color}
              onItemPress={handleItemPress}
              onDeleteItem={handleDeleteItem}
              onArchiveItem={handleUnarchiveItem}
              onAddItem={() => {}}
            />
          )}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Add group"
            onPress={() => setCreateGroupVisible(true)}
            style={({ pressed }) => [
              styles.addGroupButton,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Ionicons name="add" size={24} color="#6b7280" />
            <Text style={styles.addGroupText}>Add group</Text>
          </Pressable>
        </ScrollView>
      )}
      {/* Floating FAB for new group */}
      <View style={styles.fabContainer}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add group"
          onPress={() => setCreateGroupVisible(true)}
          style={({ pressed }) => [styles.fab, pressed && { opacity: 0.9 }]}
        >
          <Ionicons name="add" size={20} color="#ffffff" />
        </Pressable>
      </View>
      <CreateGroupModal
        boardId={boardId}
        visible={createGroupVisible}
        onClose={() => setCreateGroupVisible(false)}
      />
      <CreateItemModal
        boardId={boardId}
        visible={createItemVisible}
        groupId={createItemGroupId}
        onClose={() => {
          setCreateItemVisible(false);
          setCreateItemGroupId(null);
        }}
      />
      <ItemDetailsModal
        boardId={boardId}
        itemId={detailsItemId}
        visible={detailsVisible}
        onClose={() => {
          setDetailsVisible(false);
          setDetailsItemId(null);
        }}
      />
    </SafeAreaView>
  );
};

export const BoardDetailScreen: React.FC = () => {
  const route = useRoute<BoardDetailRouteProp>();
  const { boardId } = route.params;

  return (
    <DragDropProvider>
      <BoardContent boardId={boardId} />
    </DragDropProvider>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 0,
    ...theme.shadows.sm,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.gray100,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.gray900,
    letterSpacing: -0.5,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  metaText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.gray600,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBanner: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressPercent: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.white,
  },
  progressLabel: {
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  bannerAvatars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerAvatarText: {
    color: '#fff',
    fontWeight: theme.typography.fontWeight.bold,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.xl,
  },
  addGroupButton: {
    width: 280,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: theme.borderRadius.xl,
    borderWidth: 2,
    borderColor: theme.colors.borderMedium,
    borderStyle: "dashed",
    padding: theme.spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 200,
  },
  addGroupText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.gray600,
    fontWeight: theme.typography.fontWeight.semiBold,
    marginTop: theme.spacing.sm,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.gray500,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.md,
  },
  emptyTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.gray800,
  },
  emptySubtitle: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.gray500,
    textAlign: "center",
    maxWidth: 300,
  },
  fabContainer: {
    position: 'absolute',
    right: theme.spacing.lg,
    bottom: theme.spacing.xl,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
}));
