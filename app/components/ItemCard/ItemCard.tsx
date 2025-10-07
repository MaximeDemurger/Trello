/**
 * ItemCard Component
 * Displays a card item with swipe-to-delete gesture and rich metadata
 */

import React, { useRef } from "react";
import { Text, View, Pressable } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import Animated, {
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import type { Item } from "@/types/board.types";
import { useDraggingContext } from "../DragDropProvider/dragDropContext";

type ItemCardProps = {
  item: Item | undefined;
  onPress: () => void;
  onDelete: () => void;
  onArchive?: () => void;
  groupId?: string;
  disableSwipe?: boolean;
};

const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const getAvatarColor = (name: string): string => {
  const colors = [
    "#6366f1",
    "#ec4899",
    "#10b981",
    "#f59e0b",
    "#8b5cf6",
    "#ef4444",
  ];
  const index = name.length % colors.length;
  return colors[index];
};

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  onPress,
  onDelete,
  onArchive,
  groupId,
  disableSwipe,
}) => {
  const { draggingTaskId, setDraggingTask, panGesture } = useDraggingContext();
  const cardRef = useRef<View>(null);
  const swipeableRef = useRef<any>(null);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: draggingTaskId === item?.id ? withTiming(0.5) : withTiming(1),
    transform: [
      {
        scale: draggingTaskId === item?.id ? withTiming(0.95) : withTiming(1),
      },
    ],
  }));

  if (!item) {
    return null;
  }

  const handleLongPress = () => {
    if (!groupId) return;

    // Haptic feedback for drag start
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    cardRef.current?.measureInWindow((x, y, width, height) => {
      setDraggingTask(item.id, x, y, groupId);
    });
  };

  const renderLeftActions = () => {
    return (
      <Animated.View style={[styles.actionContainer, styles.archiveAction]}>
        <Ionicons name="archive-outline" size={20} color="#fff" />
        <Text style={styles.actionText}>Archive</Text>
      </Animated.View>
    );
  };

  const renderRightActions = () => {
    return (
      <Animated.View style={[styles.actionContainer, styles.deleteAction]}>
        <Ionicons name="trash-outline" size={20} color="#fff" />
        <Text style={styles.actionText}>Delete</Text>
      </Animated.View>
    );
  };

  const handleSwipeOpen = (direction: "left" | "right") => {
    if (direction === "left") {
      // Swiped right to open left actions -> archive
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onArchive?.();
    } else if (direction === "right") {
      // Swiped left to open right actions -> delete
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onDelete();
    }
    swipeableRef.current?.reset();
  };

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Pressable
        ref={cardRef}
        onPress={onPress}
        onLongPress={handleLongPress}
        delayLongPress={200}
        style={styles.card}
      >
        <View style={styles.pressable}>
          {/* Title */}
          <Text style={styles.title} numberOfLines={2}>
            {item?.title}
          </Text>

          {/* Description */}
          {item?.description ? (
            <Text style={styles.description} numberOfLines={2}>
              {item.description}
            </Text>
          ) : null}

          {/* Footer with metadata */}
          <CardFooter item={item} />
        </View>
      </Pressable>
    </Animated.View>
  );
};

// Memoized footer to avoid unnecessary re-renders when only metadata changes
const CardFooter: React.FC<{ item: Item }> = React.memo(({ item }) => {
  return (
    <View style={styles.footer}>
      <View style={styles.metadata}>
        {item.priority && (
          <View
            style={[
              styles.priorityDot,
              item.priority === "high" && styles.priorityHigh,
              item.priority === "medium" && styles.priorityMedium,
              item.priority === "low" && styles.priorityLow,
            ]}
          />
        )}

        {item.dueDate && (
          <View style={styles.metadataItem}>
            <Ionicons name="calendar-outline" size={12} color="#6b7280" />
            <Text style={styles.metadataText}>
              {new Date(item.dueDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </Text>
          </View>
        )}
      </View>

      {item.assignee && (
        <View
          style={[
            styles.avatar,
            { backgroundColor: getAvatarColor(item.assignee) },
          ]}
        >
          <Text style={styles.avatarText}>{getInitials(item.assignee)}</Text>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create((theme) => ({
  container: {
    position: "relative",
  },
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    ...theme.shadows.md,
  },
  cardDragging: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    opacity: 0.9,
    transform: [{ scale: 1.05 }],
    ...theme.shadows.xl,
  },
  cardHover: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
  },
  pressable: {
    padding: theme.spacing.lg,
  },
  labelsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
    flexWrap: "wrap",
  },
  labelTag: {
    backgroundColor: "#d1fae5",
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.xs,
  },
  labelText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: "#065f46",
  },
  moreLabels: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.gray500,
    fontWeight: theme.typography.fontWeight.medium,
  },
  title: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.gray900,
    lineHeight: 20,
    marginBottom: theme.spacing.xs,
  },
  description: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.gray600,
    lineHeight: 18,
    marginBottom: theme.spacing.sm,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: theme.spacing.xs,
  },
  metadata: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  metadataItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metadataText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.gray600,
    fontWeight: theme.typography.fontWeight.medium,
  },
  swipeable: {
    overflow: "hidden",
    borderRadius: theme.borderRadius.lg,
  },
  childrenContainer: {
    // Allow the card to keep its rounded corners above actions
    borderRadius: theme.borderRadius.lg,
  },
  actionContainer: {
    height: "100%",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.xs,
  },
  actionText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semiBold,
  },
  deleteAction: {
    backgroundColor: "#ef4444",
    justifyContent: "flex-end",
  },
  archiveAction: {
    backgroundColor: "#3b82f6",
    justifyContent: "flex-start",
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  priorityHigh: {
    backgroundColor: "#ef4444",
  },
  priorityMedium: {
    backgroundColor: "#f59e0b",
  },
  priorityLow: {
    backgroundColor: "#3b82f6",
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.white,
  },
}));
