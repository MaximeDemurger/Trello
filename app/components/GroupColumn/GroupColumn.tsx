import React, { useEffect, useRef } from 'react';
import { Text, View, Pressable } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  withTiming,
  useSharedValue,
} from 'react-native-reanimated';
import { FlashList } from '@shopify/flash-list';
import { ItemCard } from '../ItemCard/ItemCard';
import type { GroupWithItems } from '@/types/board.types';
import { Ionicons } from '@expo/vector-icons';
import { useDraggingContext } from '../DragDropProvider/dragDropContext';
import type { DropZone } from '../DragDropProvider/dragDropContext';

type GroupColumnProps = {
  group: GroupWithItems;
  onItemPress: (itemId: string) => void;
  onDeleteItem: (itemId: string) => void;
  onArchiveItem: (itemId: string) => void;
  onAddItem: (groupId: string) => void;
  boardColor?: string;
};

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
  }, [height, isActive, opacity]);

  useEffect(() => {
    const timer = setTimeout(() => {
      containerRef.current?.measureInWindow((x, y, width, heightWindow) => {
        onLayout({
          groupId,
          position,
          x,
          y,
          width,
          height: heightWindow,
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
  boardColor,
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

  const animatedContainerStyle = useAnimatedStyle(() => ({
    borderColor: withTiming(isHovered ? '#6366f1' : '#e5e7eb', {
      duration: 200,
    }),
    borderWidth: withTiming(isHovered ? 2 : 1, { duration: 200 }),
    transform: [{ scale: withTiming(isHovered ? 1.02 : 1, { duration: 200 }) }],
  }));

  const data: {
    type: 'dropzone' | 'item';
    id: string;
    item?: any;
    position?: number;
  }[] = [];
  data.push({ type: 'dropzone', id: `dropzone-${group.id}-0`, position: 0 });
  group.items.forEach((item, index) => {
    data.push({ type: 'item', id: item.id, item });
    data.push({
      type: 'dropzone',
      id: `dropzone-${group.id}-${index + 1}`,
      position: index + 1,
    });
  });
  const renderData = data;

  const handleDropZoneLayout = (zone: DropZone) => {
    registerDropZone(zone);
  };

  useEffect(() => {
    return () => {
      for (let i = 0; i <= group.items.length; i++) {
        unregisterDropZone(group.id, i);
      }
    };
  }, [group.id, group.items.length, unregisterDropZone]);

  const renderItem = ({ item: dataItem }: any) => {
    if (dataItem.type === 'dropzone') {
      const isActive =
        draggingTaskId !== '' &&
        targetDropZone?.groupId === group.id &&
        targetDropZone?.position === dataItem.position;

      return (
        <DropZonePlaceholder
          groupId={group.id}
          isActive={isActive}
          onLayout={handleDropZoneLayout}
          position={dataItem.position}
          remeasureTrigger={remeasureTrigger}
        />
      );
    }

    return (
      <ItemCard
        groupId={group.id}
        item={dataItem.item}
        onArchive={() => onArchiveItem(dataItem.item.id)}
        onDelete={() => onDeleteItem(dataItem.item.id)}
        onPress={() => onItemPress(dataItem.item.id)}
      />
    );
  };

  const parseHex = (hex?: string): { r: number; g: number; b: number } | null => {
    if (!hex) return null;
    const clean = hex.replace('#', '');
    const full =
      clean.length === 3
        ? clean
            .split('')
            .map((c) => c + c)
            .join('')
        : clean;
    const int = parseInt(full, 16);
    if (Number.isNaN(int)) return null;
    return {
      // eslint-disable-next-line no-bitwise
      r: (int >> 16) & 255,
      // eslint-disable-next-line no-bitwise
      g: (int >> 8) & 255,
      // eslint-disable-next-line no-bitwise
      b: int & 255,
    };
  };

  const toHex = (r: number, g: number, b: number): string => {
    const c = (n: number) => {
      const v = Math.max(0, Math.min(255, Math.round(n)));
      const s = v.toString(16).padStart(2, '0');
      return s;
    };
    return `#${c(r)}${c(g)}${c(b)}`;
  };

  const adjustColor = (hex?: string, amount: number = 0): string | undefined => {
    const rgb = parseHex(hex);
    if (!rgb) return hex;
    const { r, g, b } = rgb;
    const adjust = (channel: number) =>
      amount >= 0 ? channel + (255 - channel) * amount : channel * (1 + amount);
    return toHex(adjust(r), adjust(g), adjust(b));
  };

  const luminance = (hex?: string): number | undefined => {
    const rgb = parseHex(hex);
    if (!rgb) return undefined;
    return 0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b;
  };

  const lum = luminance(boardColor);
  const isLight = lum === undefined ? true : lum > 186;
  const adaptiveBackground = boardColor
    ? adjustColor(boardColor, isLight ? -0.06 : 0.12)
    : undefined;
  const adaptiveBorder = boardColor ? adjustColor(boardColor, isLight ? -0.14 : 0.22) : undefined;

  const renderEmpty = () => (
    <>
      <DropZonePlaceholder
        groupId={group.id}
        isActive={
          draggingTaskId !== '' &&
          targetDropZone?.groupId === group.id &&
          targetDropZone?.position === 0
        }
        onLayout={handleDropZoneLayout}
        position={0}
        remeasureTrigger={remeasureTrigger}
      />
      <Text style={styles.emptyText}>No items yet</Text>
    </>
  );

  const renderFooter = () => {
    return (
      <Pressable
        onPress={() => onAddItem(group.id)}
        style={({ pressed }) => [styles.addButton, pressed && { opacity: 0.7 }]}
      >
        <Ionicons color="#6b7280" name="add" size={20} />
        <Text style={styles.addButtonText}>Add item</Text>
      </Pressable>
    );
  };

  return (
    <Animated.View
      ref={containerRef}
      entering={FadeIn.duration(400)}
      style={[
        styles.container,
        animatedContainerStyle,
        adaptiveBackground ? { backgroundColor: adaptiveBackground } : null,
        adaptiveBorder ? { borderColor: adaptiveBorder } : null,
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{group.title}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{group.items.length}</Text>
        </View>
      </View>
      <FlashList
        contentContainerStyle={styles.scrollContent}
        data={renderData}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
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
    borderColor: theme.colors.columnBorder,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    textTransform: 'uppercase',
  },
  badge: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
    minWidth: 24,
    alignItems: 'center',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderStyle: 'dashed',
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
    textAlign: 'center',
    paddingVertical: theme.spacing.xl,
  },
  dropZone: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  dropZonePlaceholder: {
    width: '100%',
    height: 56,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#6366f1',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropZoneText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: '#6366f1',
  },
}));
