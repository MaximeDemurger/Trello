import React, { useRef } from "react";
import { Text, View, Pressable } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import Animated, {
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
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
  const { draggingTaskId, setDraggingTask } = useDraggingContext();
  const cardRef = useRef<View>(null);

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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    cardRef.current?.measureInWindow((x, y, width, height) => {
      setDraggingTask(item.id, x, y, groupId);
    });
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

      {item.assignedMembers && (
        <View
          style={[
            styles.avatar,
            { backgroundColor: getAvatarColor(item.assignedMembers.map((m) => m.name).join(",")) },
          ]}
        >
          <Text style={styles.avatarText}>{getInitials(item.assignedMembers.map((m) => m.name).join(",") || "")}</Text>
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
  avatarText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.white,
  },
}));
