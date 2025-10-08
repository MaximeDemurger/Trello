import React, { useRef, useState } from "react";
import { Text, View, Pressable } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import Animated, {
  useAnimatedStyle,
  withTiming,
  useSharedValue,
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import type { Item } from "@/types/board.types";
import { useDraggingContext } from "../DragDropProvider/dragDropContext";

type ItemCardProps = {
  item: Item | undefined;
  onPress?: () => void;
  onDelete?: () => void;
  onArchive?: () => void;
  groupId?: string;
  disableSwipe?: boolean;
};


export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  onPress,
  onDelete,
  onArchive,
  groupId,
  disableSwipe,
}) => {
  const { draggingTaskId, setDraggingTask } = useDraggingContext();
  const cardRef = useRef<View>(null);
  const translateX = useSharedValue(0);

  const isArchived = item?.archived || groupId === "archived";

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: draggingTaskId === item?.id ? withTiming(0.5) : withTiming(1),
    transform: [
      {
        scale: draggingTaskId === item?.id ? withTiming(0.95) : withTiming(1),
      },
    ],
  }));

  const swipeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  if (!item) {
    return null;
  }

  const handleLongPress = () => {
    if (!groupId) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    cardRef.current?.measureInWindow((x, y, width, height) => {
      setDraggingTask(item.id, x, y, groupId);
    });
  };

  const handleArchivePress = () => {
    translateX.value = withTiming(0, { duration: 200 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onArchive?.();
  };

  const handleDeletePress = () => {
    translateX.value = withTiming(0, { duration: 200 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onDelete?.();
  };

  const handleCancelSwipe = () => {
    translateX.value = withTiming(0, { duration: 200 });
  };

  const MAX_SWIPE_LEFT = -100;
  const MAX_SWIPE_RIGHT = 100;

  const panGesture = Gesture.Pan()
    .enabled(!disableSwipe && !draggingTaskId)
    .activeOffsetX([-10, 10])
    .onUpdate((e) => {
      const clampedX = Math.max(MAX_SWIPE_LEFT, Math.min(MAX_SWIPE_RIGHT, e.translationX));
      translateX.value = clampedX;
    })
    .onEnd(() => {
      if (translateX.value <= MAX_SWIPE_LEFT + 10 || translateX.value >= MAX_SWIPE_RIGHT - 10) {
        return;
      }
      translateX.value = withTiming(0, { duration: 200 });
    });

  if (disableSwipe) {
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
            <Text style={styles.title} numberOfLines={2}>
              {item?.title}
            </Text>
            {item?.description ? (
              <Text style={styles.description} numberOfLines={2}>
                {item.description}
              </Text>
            ) : null}
            <CardFooter item={item} />
          </View>
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View style={[styles.actionsContainer, draggingTaskId === item?.id && styles.actionsContainerDragging]}>
        <Pressable onPress={handleArchivePress} style={styles.leftAction}>
          <Ionicons name={isArchived ? "arrow-undo-outline" : "archive-outline"} size={20} color="#fff" />
          <Text style={styles.actionText}>{isArchived ? "Unarchive" : "Archive"}</Text>
        </Pressable>
        <Pressable onPress={handleDeletePress} style={styles.rightAction}>
          <Ionicons name="trash-outline" size={20} color="#fff" />
          <Text style={styles.actionText}>Delete</Text>
        </Pressable>
      </View>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={swipeStyle}>
          <Pressable
            ref={cardRef}
            onPress={onPress}
            onLongPress={handleLongPress}
            delayLongPress={200}
            style={styles.card}
          >
            <View style={styles.pressable}>
              <Text style={styles.title} numberOfLines={2}>
                {item?.title}
              </Text>
              {item?.description ? (
                <Text style={styles.description} numberOfLines={2}>
                  {item.description}
                </Text>
              ) : null}
              <CardFooter item={item} />
            </View>
          </Pressable>
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
};

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

      {item.assignedMembers && item.assignedMembers.length > 0 && (
        <View style={styles.avatars}>
          {item.assignedMembers.slice(0, 2).map((member) => (
            <View
              key={member.id}
              style={[styles.avatar, { backgroundColor: member.color }]}
            >
              <Text style={styles.avatarText}>{member.initials}</Text>
            </View>
          ))}
          {item.assignedMembers.length > 2 && (
            <View style={[styles.avatar, styles.avatarMore]}>
              <Text style={styles.avatarText}>+{item.assignedMembers.length - 2}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create((theme) => ({
  container: {
    position: "relative",
    overflow: "hidden",
  },
  actionsContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    overflow: "hidden",
    borderRadius: theme.borderRadius.lg,
  },
  actionsContainerDragging: {
    opacity: 0,
  },
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  pressable: {
    padding: theme.spacing.lg,
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
  avatars: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
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
  avatarMore: {
    backgroundColor: theme.colors.gray500,
  },
  avatarText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.white,
  },
  leftAction: {
    backgroundColor: "#3b82f6",
    justifyContent: "center",
    alignItems: "flex-start",
    paddingLeft: 20,
    flex: 1,
  },
  rightAction: {
    backgroundColor: "#ef4444",
    justifyContent: "center",
    alignItems: "flex-end",
    paddingRight: 20,
    flex: 1,
  },
  actionText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
}));
