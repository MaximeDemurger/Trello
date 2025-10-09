import { View, StyleSheet, useWindowDimensions, ScrollView } from 'react-native';
import { ItemCard } from '../ItemCard/ItemCard';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { PropsWithChildren, useState, useRef, useCallback, useEffect } from 'react';
import { useBoardStore } from '@/stores/useBoardStore';
import { DraggingContext, type DropZone } from './dragDropContext';
import { styles } from './DragDropProvider.styles';

export const DragDropProvider = ({ children }: PropsWithChildren<{}>) => {
  const [draggingTaskId, setDraggingTaskId] = useState<string>('');
  const [targetDropZone, setTargetDropZone] = useState<{
    groupId: string;
    position: number;
  } | null>(null);
  const [hoveredGroupId, setHoveredGroupId] = useState<string | null>(null);
  const [remeasureTrigger, setRemeasureTrigger] = useState(0);

  const getItem = useBoardStore((state) => state.getItem);
  const moveItem = useBoardStore((state) => state.moveItem);
  const { width } = useWindowDimensions();

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);

  const dropZonesRef = useRef<Map<string, DropZone>>(new Map());
  const scrollViewRef = useRef<ScrollView | null>(null);
  const autoScrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const scrollOffsetRef = useRef(0);
  const lastAutoScrollTimeRef = useRef(0);
  const hasAutoScrolledRef = useRef(false);
  const dragDistanceRef = useRef(0);
  const initialScreenXRef = useRef(0);

  const registerDropZone = useCallback((zone: DropZone) => {
    const key = `${zone.groupId}-${zone.position}`;
    const absoluteZone: DropZone = {
      ...zone,
      x: zone.x + scrollOffsetRef.current,
    };
    dropZonesRef.current.set(key, absoluteZone);
  }, []);

  const unregisterDropZone = useCallback((groupId: string, position: number) => {
    const key = `${groupId}-${position}`;
    dropZonesRef.current.delete(key);
  }, []);

  const findTargetDropZone = useCallback(
    (x: number, y: number): { groupId: string; position: number } | null => {
      let closestZone: DropZone | null = null;
      let minDistance = Infinity;

      const zones = Array.from(dropZonesRef.current.values());

      for (const zone of zones) {
        const padding = 50;
        const inXBounds = x >= zone.x - padding && x <= zone.x + zone.width + padding;
        const inYBounds = y >= zone.y - padding && y <= zone.y + zone.height + padding;

        if (inXBounds && inYBounds) {
          const centerX = zone.x + zone.width / 2;
          const centerY = zone.y + zone.height / 2;
          const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
          if (distance < minDistance) {
            minDistance = distance;
            closestZone = zone;
          }
        }
      }

      if (closestZone) {
        return { groupId: closestZone.groupId, position: closestZone.position };
      }

      return null;
    },
    [],
  );

  const stopAutoScroll = useCallback(() => {
    if (autoScrollIntervalRef.current) {
      clearInterval(autoScrollIntervalRef.current);
      autoScrollIntervalRef.current = null;
    }
  }, []);

  const handleAutoScroll = useCallback(
    (screenX: number) => {
      if (!scrollViewRef.current) return;
      const leftEdgeThreshold = 40;
      const rightEdgeThreshold = 200;
      const columnWidth = 336;
      const scrollCooldown = 500;
      const minDragDistance = 50;
      const currentTime = Date.now();

      const dragDistance = Math.abs(screenX - initialScreenXRef.current);
      if (dragDistance < minDragDistance) {
        return;
      }
      const timeSinceLastScroll = currentTime - lastAutoScrollTimeRef.current;
      if (timeSinceLastScroll < scrollCooldown && lastAutoScrollTimeRef.current > 0) {
        return;
      }

      const isNearLeftEdge = screenX < leftEdgeThreshold;
      const isNearRightEdge = screenX > width - rightEdgeThreshold;

      if (isNearLeftEdge && scrollOffsetRef.current > 0) {
        lastAutoScrollTimeRef.current = currentTime;
        const currentColumn = Math.round(scrollOffsetRef.current / columnWidth);
        const previousColumnOffset = Math.max(0, (currentColumn - 1) * columnWidth);
        scrollViewRef.current.scrollTo({
          x: previousColumnOffset,
          y: 0,
          animated: true,
        });
        setTimeout(() => {
          scrollOffsetRef.current = previousColumnOffset;
          setRemeasureTrigger((prev) => prev + 1);
        }, 350);
      } else if (isNearRightEdge) {
        lastAutoScrollTimeRef.current = currentTime;
        const currentColumn = Math.round(scrollOffsetRef.current / columnWidth);
        const nextColumnOffset = (currentColumn + 1) * columnWidth;
        scrollViewRef.current.scrollTo({
          x: nextColumnOffset,
          y: 0,
          animated: true,
        });
        setTimeout(() => {
          scrollOffsetRef.current = nextColumnOffset;
          setRemeasureTrigger((prev) => prev + 1);
        }, 350);
      }
    },
    [width],
  );

  const drop = useCallback(() => {
    stopAutoScroll();
    hasAutoScrolledRef.current = false;
    lastAutoScrollTimeRef.current = 0;
    dragDistanceRef.current = 0;
    initialScreenXRef.current = 0;

    if (!draggingTaskId || !targetDropZone) {
      setDraggingTaskId('');
      setTargetDropZone(null);
      setHoveredGroupId(null);
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    moveItem({
      itemId: draggingTaskId,
      targetGroupId: targetDropZone.groupId,
      targetOrder: targetDropZone.position,
    });
    setDraggingTaskId('');
    setTargetDropZone(null);
    setHoveredGroupId(null);
  }, [draggingTaskId, targetDropZone, moveItem, stopAutoScroll]);

  const updateDragPosition = useCallback(
    (screenX: number, screenY: number) => {
      const absoluteX = screenX + scrollOffsetRef.current;
      const absoluteY = screenY;
      const cardCenterX = absoluteX + 140;
      const cardCenterY = absoluteY + 60;
      const target = findTargetDropZone(cardCenterX, cardCenterY);
      setTargetDropZone(target);
      if (target) {
        setHoveredGroupId(target.groupId);
      } else {
        setHoveredGroupId(null);
      }
      handleAutoScroll(screenX);
    },
    [findTargetDropZone, handleAutoScroll],
  );

  const pan = Gesture.Pan()
    .manualActivation(true)
    .onTouchesMove((event, stateManager) => {
      if (draggingTaskId) {
        stateManager.activate();
      }
    })
    .onUpdate((event) => {
      translateX.value = offsetX.value + event.translationX;
      translateY.value = offsetY.value + event.translationY;
      runOnJS(updateDragPosition)(translateX.value, translateY.value);
    })
    .onEnd(() => {
      runOnJS(drop)();
      translateX.value = withTiming(0, { duration: 200 });
      translateY.value = withTiming(0, { duration: 200 });
    });

  const setDraggingTask = useCallback(
    (id: string, x: number, y: number) => {
      setDraggingTaskId(id);
      hasAutoScrolledRef.current = false;
      lastAutoScrollTimeRef.current = 0;
      dragDistanceRef.current = 0;
      initialScreenXRef.current = x;
      offsetX.value = x;
      offsetY.value = y;
      translateX.value = x;
      translateY.value = y;
    },
    [offsetX, offsetY, translateX, translateY],
  );

  const setScrollViewRef = useCallback((ref: ScrollView | null) => {
    scrollViewRef.current = ref;
  }, []);

  const updateScrollOffset = useCallback((offset: number) => {
    scrollOffsetRef.current = offset;
  }, []);

  useEffect(() => {
    return () => {
      stopAutoScroll();
    };
  }, [stopAutoScroll]);

  const animatedStyle = useAnimatedStyle(() => {
    const isActive = draggingTaskId !== '';

    return {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      opacity: isActive ? withTiming(1, { duration: 150 }) : 0,
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: isActive ? withTiming(1.08, { duration: 150 }) : 0.9 },
        { rotateZ: isActive ? '3deg' : '0deg' },
      ],
    };
  });

  return (
    <DraggingContext.Provider
      value={{
        setDraggingTask,
        dragX: translateX,
        dragY: translateY,
        panGesture: pan,
        draggingTaskId,
        registerDropZone,
        unregisterDropZone,
        targetDropZone,
        hoveredGroupId,
        setScrollViewRef,
        updateScrollOffset,
        remeasureTrigger,
      }}
    >
      <GestureDetector gesture={pan}>
        <View style={StyleSheet.absoluteFillObject}>
          {children}

          <Animated.View style={[animatedStyle, styles.draggingCard]}>
            {draggingTaskId && (
              <View style={styles.draggingShadow}>
                <ItemCard disableSwipe item={getItem(draggingTaskId)} />
              </View>
            )}
          </Animated.View>
        </View>
      </GestureDetector>
    </DraggingContext.Provider>
  );
};
