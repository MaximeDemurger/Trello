/**
 * GroupColumn Component
 * Displays a column of items with drag-and-drop support
 * Features:
 * - Drop zone registration for each position
 * - Placeholder gaps showing insertion point
 * - Column highlighting when hovered
 * - Vertical auto-scroll
 */

import React, { useEffect, useRef } from "react";
import { Text, View, Pressable, FlatList } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import Animated, {
  FadeIn,
  useAnimatedStyle,
  withTiming,
  useSharedValue,
} from "react-native-reanimated";
import { ItemCard } from "../ItemCard/ItemCard";
import type { GroupWithItems } from "@/types/board.types";
import { Ionicons } from "@expo/vector-icons";
import { useDraggingContext } from "../DragDropProvider/dragDropContext";
import type { DropZone } from "../DragDropProvider/dragDropContext";

type GroupColumnProps = {
  group: GroupWithItems;
  onItemPress: (itemId: string) => void;
  onDeleteItem: (itemId: string) => void;
  onArchiveItem: (itemId: string) => void;
  onAddItem: (groupId: string) => void;
};

// Drop zone placeholder component
const DropZonePlaceholder: React.FC<{
  groupId: string;
  position: number;
  isActive: boolean;
  onLayout: (zone: DropZone) => void;
  remeasureTrigger: number;
}> = ({ groupId, position, isActive, onLayout, remeasureTrigger }) => {
  const height = useSharedValue(isActive ? 60 : 8);
  const opacity = useSharedValue(isActive ? 1 : 0);
  const containerRef = useRef<View>(null);

  useEffect(() => {
    height.value = withTiming(isActive ? 60 : 8, { duration: 200 });
    opacity.value = withTiming(isActive ? 1 : 0, { duration: 200 });
  }, [isActive]);

  useEffect(() => {
    // Measure and register drop zone (re-measures when remeasureTrigger changes)
    const timer = setTimeout(() => {
      containerRef.current?.measureInWindow((x, y, width, height) => {
        onLayout({
          groupId,
          position,
          x,
          y,
          width,
          height,
        });
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [groupId, position, onLayout, remeasureTrigger]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: height.value,
    opacity: opacity.value,
  }));

  return (
    <View ref={containerRef} collapsable={false}>
      <Animated.View style={[styles.dropZone, animatedStyle]}>
        {isActive && (
          <View style={styles.dropZonePlaceholder}>
            <Text style={styles.dropZoneText}>Drop here</Text>
          </View>
        )}
      </Animated.View>
    </View>
  );
};

export const GroupColumn: React.FC<GroupColumnProps> = ({
  group,
  onItemPress,
  onDeleteItem,
  onArchiveItem,
  onAddItem,
}) => {
  const {
    draggingTaskId,
    registerDropZone,
    unregisterDropZone,
    targetDropZone,
    hoveredGroupId,
    remeasureTrigger,
  } = useDraggingContext();

  const containerRef = useRef<View>(null);
  const isHovered = hoveredGroupId === group.id;

  // Animated column highlight
  const animatedContainerStyle = useAnimatedStyle(() => ({
    borderColor: withTiming(isHovered ? "#6366f1" : "#e5e7eb", {
      duration: 200,
    }),
    borderWidth: withTiming(isHovered ? 2 : 1, { duration: 200 }),
    transform: [{ scale: withTiming(isHovered ? 1.02 : 1, { duration: 200 }) }],
  }));

  // Generate list data with drop zones
  const renderData = React.useMemo(() => {
    const data: Array<{
      type: "dropzone" | "item";
      id: string;
      item?: any;
      position?: number;
    }> = [];

    // Add drop zone at position 0 (top)
    data.push({ type: "dropzone", id: `dropzone-${group.id}-0`, position: 0 });

    // Add items with drop zones between them
    group.items.forEach((item, index) => {
      data.push({ type: "item", id: item.id, item });
      data.push({
        type: "dropzone",
        id: `dropzone-${group.id}-${index + 1}`,
        position: index + 1,
      });
    });

    return data;
  }, [group.items, group.id]);

  const handleDropZoneLayout = (zone: DropZone) => {
    registerDropZone(zone);
  };

  useEffect(() => {
    // Cleanup drop zones when component unmounts
    return () => {
      for (let i = 0; i <= group.items.length; i++) {
        unregisterDropZone(group.id, i);
      }
    };
  }, [group.id, group.items.length, unregisterDropZone]);

  const renderItem = ({ item: dataItem }: any) => {
    if (dataItem.type === "dropzone") {
      const isActive =
        draggingTaskId !== "" &&
        targetDropZone?.groupId === group.id &&
        targetDropZone?.position === dataItem.position;

      return (
        <DropZonePlaceholder
          groupId={group.id}
          position={dataItem.position}
          isActive={isActive}
          onLayout={handleDropZoneLayout}
          remeasureTrigger={remeasureTrigger}
        />
      );
    }

    return (
      <ItemCard
        item={dataItem.item}
        onPress={() => onItemPress(dataItem.item.id)}
        onDelete={() => onDeleteItem(dataItem.item.id)}
        onArchive={() => onArchiveItem(dataItem.item.id)}
        groupId={group.id}
      />
    );
  };

  return (
    <Animated.View
      ref={containerRef}
      entering={FadeIn.duration(400)}
      style={[styles.container, animatedContainerStyle]}
    >
      <FlatList
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        data={renderData}
        ListHeaderComponent={() => (
          <View style={styles.header}>
            <Text style={styles.title}>{group.title}</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{group.items.length}</Text>
            </View>
          </View>
        )}
        ListFooterComponent={() => (
          <Pressable
            onPress={() => onAddItem(group.id)}
            style={({ pressed }) => [
              styles.addButton,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Ionicons name="add" size={20} color="#6b7280" />
            <Text style={styles.addButtonText}>Add item</Text>
          </Pressable>
        )}
        renderItem={renderItem}
        ListEmptyComponent={() => (
          <>
            <DropZonePlaceholder
              groupId={group.id}
              position={0}
              isActive={
                draggingTaskId !== "" &&
                targetDropZone?.groupId === group.id &&
                targetDropZone?.position === 0
              }
              onLayout={handleDropZoneLayout}
              remeasureTrigger={remeasureTrigger}
            />
            <Text style={styles.emptyText}>No items yet</Text>
          </>
        )}
        keyExtractor={(item) => item.id}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    width: 320,
    backgroundColor: theme.colors.columnBackground,
    borderRadius: theme.borderRadius.xl,
    marginRight: theme.spacing.lg,
    maxHeight: "100%",
    borderWidth: 1,
    borderColor: theme.colors.columnBorder,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.gray900,
    flex: 1,
    letterSpacing: -0.3,
    textTransform: "uppercase",
  },
  badge: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
    minWidth: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.gray300,
  },
  badgeText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.gray700,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
    paddingTop: theme.spacing.xs,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderStyle: "dashed",
    backgroundColor: theme.colors.white,
    marginTop: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
  },
  addButtonText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.gray600,
    fontWeight: theme.typography.fontWeight.semiBold,
    marginLeft: theme.spacing.xs,
  },
  emptyText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.gray500,
    textAlign: "center",
    paddingVertical: theme.spacing.xl,
  },
  dropZone: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  dropZonePlaceholder: {
    width: "100%",
    height: 56,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#6366f1",
    backgroundColor: "rgba(99, 102, 241, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  dropZoneText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: "#6366f1",
  },
}));
