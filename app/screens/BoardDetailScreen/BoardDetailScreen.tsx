import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import { GroupColumn, CreateItemModal, CreateGroupModal, ItemDetailsModal } from '@/components';
import { useBoardStore } from '@/stores/useBoardStore';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import { DragDropProvider } from '@/components/DragDropProvider/DragDropProvider';
import { useDraggingContext } from '@/components/DragDropProvider/dragDropContext';

type BoardDetailRouteProp = RouteProp<RootStackParamList, 'BoardDetail'>;

const BoardContent: React.FC<{ boardId: string }> = ({ boardId }) => {
  const navigation = useNavigation();
  const scrollViewRef = useRef<ScrollView>(null);
  const { setScrollViewRef, updateScrollOffset } = useDraggingContext();

  const [createItemVisible, setCreateItemVisible] = useState(false);
  const [createItemGroupId, setCreateItemGroupId] = useState<string | null>(null);
  const [createGroupVisible, setCreateGroupVisible] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [detailsItemId, setDetailsItemId] = useState<string | null>(null);

  const { getBoardWithGroups } = useBoardStore();
  const [board, setBoard] = useState(getBoardWithGroups(boardId));
  const [archivedItems, setArchivedItems] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = useBoardStore.subscribe(() => {
      setBoard(getBoardWithGroups(boardId));
      const items = useBoardStore.getState().items;
      setArchivedItems(items.filter((i) => i.boardId === boardId && i.archived));
    });
    const items = useBoardStore.getState().items;
    setArchivedItems(items.filter((i) => i.boardId === boardId && i.archived));
    return unsubscribe;
  }, [boardId, getBoardWithGroups]);

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

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: board.color }]}>
      <Animated.View entering={FadeIn.duration(300)} style={styles.header}>
        <Pressable
          accessibilityLabel="Go back"
          accessibilityRole="button"
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.7 }]}
        >
          <Ionicons color="#1f2937" name="arrow-back" size={24} />
        </Pressable>

        <View style={styles.headerContent}>
          <Text numberOfLines={1} style={styles.title}>
            {board.title}
          </Text>
          {board.description ? (
            <Text numberOfLines={1} style={styles.description}>
              {board.description}
            </Text>
          ) : null}
        </View>
      </Animated.View>

      {isEmpty ? (
        <View style={[styles.scrollView, styles.emptyState]}>
          <Ionicons color="#9ca3af" name="albums-outline" size={48} />
          <Text style={styles.emptyTitle}>No groups yet</Text>
          <Text style={styles.emptySubtitle}>
            Create your first group to start organizing items.
          </Text>
          <Pressable
            accessibilityLabel="Create group"
            accessibilityRole="button"
            onPress={() => setCreateGroupVisible(true)}
            style={({ pressed }) => [styles.addGroupButton, pressed && { opacity: 0.7 }]}
          >
            <Ionicons color="#6b7280" name="add" size={24} />
            <Text style={styles.addGroupText}>Add group</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          decelerationRate="fast"
          horizontal
          onScroll={(event) => {
            updateScrollOffset(event.nativeEvent.contentOffset.x);
          }}
          scrollEventThrottle={16}
          showsHorizontalScrollIndicator={false}
          snapToAlignment="center"
          snapToInterval={336}
          style={styles.scrollView}
        >
          {board.groups.map((group) => (
            <GroupColumn
              key={group.id}
              boardColor={board.color}
              group={group}
              onAddItem={handleAddItem}
              onArchiveItem={handleArchiveItem}
              onDeleteItem={handleDeleteItem}
              onItemPress={handleItemPress}
            />
          ))}

          {archivedItems.length > 0 && (
            <GroupColumn
              key="archived"
              boardColor={board.color}
              group={{
                id: 'archived',
                title: 'Archived',
                boardId,
                order: 9999,
                createdAt: '',
                items: archivedItems,
              }}
              onAddItem={() => {}}
              onArchiveItem={handleUnarchiveItem}
              onDeleteItem={handleDeleteItem}
              onItemPress={handleItemPress}
            />
          )}

          <Pressable
            accessibilityLabel="Add group"
            accessibilityRole="button"
            onPress={() => setCreateGroupVisible(true)}
            style={({ pressed }) => [styles.addGroupButton, pressed && { opacity: 0.7 }]}
          >
            <Ionicons color="#6b7280" name="add" size={24} />
            <Text style={styles.addGroupText}>Add group</Text>
          </Pressable>
        </ScrollView>
      )}
      <CreateGroupModal
        boardId={boardId}
        onClose={() => setCreateGroupVisible(false)}
        visible={createGroupVisible}
      />
      <CreateItemModal
        boardId={boardId}
        groupId={createItemGroupId}
        onClose={() => {
          setCreateItemVisible(false);
          setCreateItemGroupId(null);
        }}
        visible={createItemVisible}
      />
      <ItemDetailsModal
        boardId={boardId}
        itemId={detailsItemId}
        onClose={() => {
          setDetailsVisible(false);
          setDetailsItemId(null);
        }}
        visible={detailsVisible}
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
    backgroundColor: theme.colors.backgroundMedium,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 0,
    ...theme.shadows.sm,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
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
  description: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.gray600,
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.xl,
  },
  addGroupButton: {
    width: 280,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: theme.borderRadius.xl,
    borderWidth: 2,
    borderColor: theme.colors.borderMedium,
    borderStyle: 'dashed',
    padding: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.gray500,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
    textAlign: 'center',
    maxWidth: 300,
  },
}));
