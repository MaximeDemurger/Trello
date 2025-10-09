import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import type { Board } from '@/types/board.types';

type BoardCardProps = {
  board: Board;
  itemCount: number;
  onPress: () => void;
};

export const BoardCard: React.FC<BoardCardProps> = ({ board, itemCount, onPress }) => {
  return (
    <Pressable onPress={onPress} style={styles.container}>
      <Text numberOfLines={1} style={styles.title}>
        {board.title}
      </Text>
      <Text numberOfLines={2} style={styles.description}>
        {board.description}
      </Text>
      <View style={styles.footer}>
        <Text style={styles.itemCount}>{itemCount} items</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    marginHorizontal: theme.spacing.xl,
    borderWidth: 1,
    padding: theme.spacing.xl,
    borderColor: theme.colors.borderLight,
    ...theme.shadows.md,
    overflow: 'hidden',
  },
  title: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.gray900,
    marginBottom: theme.spacing.sm,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.gray600,
    marginBottom: theme.spacing.lg,
    lineHeight: 22,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray100,
  },
  itemCount: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.gray500,
    fontWeight: theme.typography.fontWeight.semiBold,
  },
}));
