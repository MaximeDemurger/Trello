import React, { useState, useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { FlashList } from '@shopify/flash-list';
import { BoardCard } from '@/components';
import { useBoardStore } from '@/stores/useBoardStore';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import { CreateBoardModal } from '@/components/CreateBoardModal/CreateBoardModal';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const ItemSeparator = () => <View style={styles.separator} />;

const ListFooter = ({ onPress }: { onPress: () => void }) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [styles.addButton, pressed && { opacity: 0.7 }]}
  >
    <Ionicons color="#6b7280" name="add" size={20} />
    <Text>Add board</Text>
  </Pressable>
);

export const BoardListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { getAllBoardsWithGroups, initializeDefaultData } = useBoardStore();
  const [boards, setBoards] = useState(getAllBoardsWithGroups());
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [newBoardDescription, setNewBoardDescription] = useState('');
  const [newBoardColor, setNewBoardColor] = useState('#EDE9FE');

  useEffect(() => {
    if (boards.length === 0) {
      initializeDefaultData();
    }
  }, [boards.length, initializeDefaultData]);

  useEffect(() => {
    const unsubscribe = useBoardStore.subscribe(() => {
      setBoards(getAllBoardsWithGroups());
    });
    return unsubscribe;
  }, [getAllBoardsWithGroups]);

  const handleBoardPress = (boardId: string) => {
    navigation.navigate('BoardDetail', { boardId });
  };

  const handleCreateBoard = () => {
    const { createBoard } = useBoardStore.getState();

    if (newBoardTitle.trim()) {
      createBoard({
        title: newBoardTitle.trim(),
        description: newBoardDescription.trim(),
        color: newBoardColor,
      });

      setNewBoardTitle('');
      setNewBoardDescription('');
      setNewBoardColor('#EDE9FE');
      setIsCreateModalVisible(false);
    }
  };

  const renderBoardItem = ({ item }: any) => {
    const itemCount = item.groups.reduce((acc: number, group: any) => acc + group.items.length, 0);
    return (
      <BoardCard board={item} itemCount={itemCount} onPress={() => handleBoardPress(item.id)} />
    );
  };

  const keyExtractor = (item: any) => item.id;

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
        <Text style={styles.title}>My Boards</Text>
        <AnimatedPressable
          entering={FadeInDown.delay(200).duration(400)}
          onPress={() => setIsCreateModalVisible(true)}
          style={({ pressed }) => [styles.addButton, pressed && { opacity: 0.7 }]}
        >
          <Ionicons color="#fff" name="add" size={24} />
        </AnimatedPressable>
      </Animated.View>

      {boards.length === 0 ? (
        <Animated.View entering={FadeIn.delay(300)} style={styles.emptyState}>
          <Ionicons color="#d1d5db" name="grid-outline" size={64} />
          <Text style={styles.emptyTitle}>No boards yet</Text>
          <Text style={styles.emptyDescription}>Create your first board to get started</Text>
        </Animated.View>
      ) : (
        <FlashList
          contentContainerStyle={styles.listContent}
          data={boards}
          ItemSeparatorComponent={ItemSeparator}
          keyExtractor={keyExtractor}
          ListFooterComponent={<ListFooter onPress={() => setIsCreateModalVisible(true)} />}
          renderItem={renderBoardItem}
          showsVerticalScrollIndicator={false}
        />
      )}
      <CreateBoardModal
        color={newBoardColor}
        description={newBoardDescription}
        onClose={() => setIsCreateModalVisible(false)}
        onColorChange={setNewBoardColor}
        onDescriptionChange={setNewBoardDescription}
        onSubmit={handleCreateBoard}
        onTitleChange={setNewBoardTitle}
        title={newBoardTitle}
        visible={isCreateModalVisible}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.gray50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    ...theme.shadows.sm,
  },
  title: {
    fontSize: theme.typography.fontSize.xxxxl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.gray900,
    letterSpacing: -1,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderStyle: 'dashed',
    justifyContent: 'center',
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.white,
    marginTop: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
    paddingVertical: theme.spacing.lg,
    marginHorizontal: theme.spacing.xl,
  },
  listContent: {
    paddingVertical: theme.spacing.lg,
  },
  separator: {
    height: 10,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  emptyTitle: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.gray900,
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.sm,
  },
  emptyDescription: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.gray500,
    textAlign: 'center',
    lineHeight: 22,
  },
}));
