/**
 * DragDropProvider Component
 * Smooth drag and drop system with:
 * - Drop zone detection between items
 * - Column highlighting
 * - Smooth finger-following animations
 */

import { View, StyleSheet, useWindowDimensions, ScrollView } from "react-native";
import { ItemCard } from "../ItemCard/ItemCard";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  SharedValue,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { PropsWithChildren, useState, useRef, useCallback, useEffect } from "react";
import { useBoardStore } from "@/stores/useBoardStore";
import { DraggingContext, type DropZone } from "./dragDropContext";

// Dev-only logger to avoid noisy logs in production
const debugLog = (...args: unknown[]) => {
  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.log(...args);
  }
};


export const DragDropProvider = ({
  children,
}: PropsWithChildren<{}>) => {
  const [draggingTaskId, setDraggingTaskId] = useState<string>("");
  const [sourceGroupId, setSourceGroupId] = useState<string>("");
  const [targetDropZone, setTargetDropZone] = useState<{ groupId: string; position: number } | null>(null);
  const [hoveredGroupId, setHoveredGroupId] = useState<string | null>(null);
  const [remeasureTrigger, setRemeasureTrigger] = useState(0);
  
  const getItem = useBoardStore((state) => state.getItem);
  const moveItem = useBoardStore((state) => state.moveItem);
  const { width } = useWindowDimensions();

  // Shared values for smooth dragging
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

  // Register drop zones - convert screen coordinates to absolute content coordinates
  const registerDropZone = useCallback((zone: DropZone) => {
    const key = `${zone.groupId}-${zone.position}`;
    // Convert screen coordinates to absolute by adding current scroll offset
    const absoluteZone: DropZone = {
      ...zone,
      x: zone.x + scrollOffsetRef.current,
    };
    dropZonesRef.current.set(key, absoluteZone);
    debugLog('📍 Registered drop zone:', key, 'at absolute x:', absoluteZone.x, 'scrollOffset:', scrollOffsetRef.current);
  }, []);

  const unregisterDropZone = useCallback((groupId: string, position: number) => {
    const key = `${groupId}-${position}`;
    dropZonesRef.current.delete(key);
  }, []);

  // Find target drop zone based on drag position
  const findTargetDropZone = useCallback((x: number, y: number): { groupId: string; position: number } | null => {
    let closestZone: DropZone | null = null;
    let minDistance = Infinity;

    const zones = Array.from(dropZonesRef.current.values());
    
    debugLog(`🔍 Checking ${zones.length} drop zones for point (${x}, ${y})`);
    
    for (const zone of zones) {
      // Check if point is within zone bounds (with generous padding)
      const padding = 50;
      const inXBounds = x >= zone.x - padding && x <= zone.x + zone.width + padding;
      const inYBounds = y >= zone.y - padding && y <= zone.y + zone.height + padding;

      if (inXBounds && inYBounds) {
        // Calculate distance to zone center
        const centerX = zone.x + zone.width / 2;
        const centerY = zone.y + zone.height / 2;
        const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));

        debugLog(`  ✓ Zone ${zone.groupId}-${zone.position} matches! Distance: ${distance.toFixed(0)}, bounds: x[${zone.x - padding}-${zone.x + zone.width + padding}]`);

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
  }, []);

  // Stop auto-scroll
  const stopAutoScroll = useCallback(() => {
    if (autoScrollIntervalRef.current) {
      clearInterval(autoScrollIntervalRef.current);
      autoScrollIntervalRef.current = null;
    }
  }, []);

  // Auto-scroll by snapping to next/previous column
  const handleAutoScroll = useCallback((screenX: number) => {
    if (!scrollViewRef.current) return;
    
    const leftEdgeThreshold = 40; // Distance from left edge to trigger scroll
    const rightEdgeThreshold = 200; // Distance from right edge (large to account for card width)
    const columnWidth = 336; // Column width (320) + margin (16)
    const scrollCooldown = 500; // Time between auto-scrolls
    const minDragDistance = 50; // Minimum drag before auto-scroll activates
    const currentTime = Date.now();
    
    // Calculate drag distance from start
    const dragDistance = Math.abs(screenX - initialScreenXRef.current);
    
    // Skip if haven't dragged enough
    if (dragDistance < minDragDistance) {
      return;
    }
    
    // Skip if in cooldown
    const timeSinceLastScroll = currentTime - lastAutoScrollTimeRef.current;
    if (timeSinceLastScroll < scrollCooldown && lastAutoScrollTimeRef.current > 0) {
      return;
    }
    
    const isNearLeftEdge = screenX < leftEdgeThreshold;
    const isNearRightEdge = screenX > width - rightEdgeThreshold;
    
    debugLog('🎯 AutoScroll:', {
      screenX,
      dragDistance,
      isNearLeft: isNearLeftEdge,
      isNearRight: isNearRightEdge,
      rightEdgeStart: width - rightEdgeThreshold,
      currentScroll: scrollOffsetRef.current,
    });
    
    // Snap to previous column (left)
    if (isNearLeftEdge && scrollOffsetRef.current > 0) {
      debugLog('⬅️ SNAP LEFT');
      lastAutoScrollTimeRef.current = currentTime;
      
      const currentColumn = Math.round(scrollOffsetRef.current / columnWidth);
      const previousColumnOffset = Math.max(0, (currentColumn - 1) * columnWidth);
      
      scrollViewRef.current.scrollTo({ 
        x: previousColumnOffset, 
        y: 0, 
        animated: true 
      });
      
      // Update after animation completes and trigger remeasurement
      setTimeout(() => {
        scrollOffsetRef.current = previousColumnOffset;
        setRemeasureTrigger(prev => prev + 1);
      }, 350);
    }
    // Snap to next column (right)
    else if (isNearRightEdge) {
      debugLog('➡️ SNAP RIGHT');
      lastAutoScrollTimeRef.current = currentTime;
      
      const currentColumn = Math.round(scrollOffsetRef.current / columnWidth);
      const nextColumnOffset = (currentColumn + 1) * columnWidth;
      
      scrollViewRef.current.scrollTo({ 
        x: nextColumnOffset, 
        y: 0, 
        animated: true 
      });
      
      // Update after animation completes and trigger remeasurement
      setTimeout(() => {
        scrollOffsetRef.current = nextColumnOffset;
        setRemeasureTrigger(prev => prev + 1);
      }, 350);
    }
  }, [width]);

  // Drop the item
  const drop = useCallback(() => {
    stopAutoScroll();
    hasAutoScrolledRef.current = false;
    lastAutoScrollTimeRef.current = 0;
    dragDistanceRef.current = 0;
    initialScreenXRef.current = 0;
    
    if (!draggingTaskId || !targetDropZone) {
      setDraggingTaskId("");
      setSourceGroupId("");
      setTargetDropZone(null);
      setHoveredGroupId(null);
      return;
    }

    // Haptic feedback for successful drop
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Move the item
    moveItem({
      itemId: draggingTaskId,
      targetGroupId: targetDropZone.groupId,
      targetOrder: targetDropZone.position,
    });

    // Reset state
    setDraggingTaskId("");
    setSourceGroupId("");
    setTargetDropZone(null);
    setHoveredGroupId(null);
  }, [draggingTaskId, targetDropZone, moveItem, stopAutoScroll]);

  const updateDragPosition = useCallback((screenX: number, screenY: number) => {
    // screenX and screenY are screen coordinates
    // For drop zone detection, convert to absolute coordinates
    const absoluteX = screenX + scrollOffsetRef.current;
    const absoluteY = screenY;
    
    // Calculate center point of dragged card for better drop detection
    const cardCenterX = absoluteX + 140; // Half of card width (280/2)
    const cardCenterY = absoluteY + 60; // Approximate center height
    
    debugLog('🎯 Drop detection:', {
      screenX,
      absoluteX,
      cardCenterX,
      scrollOffset: scrollOffsetRef.current,
    });
    
    const target = findTargetDropZone(cardCenterX, cardCenterY);
    
    if (target) {
      debugLog('✅ Found target:', target);
    }
    
    setTargetDropZone(target);
    
    if (target) {
      setHoveredGroupId(target.groupId);
    } else {
      setHoveredGroupId(null);
    }
    
    // Use screen position directly for auto-scroll (already screen coordinates)
    handleAutoScroll(screenX);
  }, [findTargetDropZone, handleAutoScroll]);

  // Pan gesture with smooth tracking
  const pan = Gesture.Pan()
    .manualActivation(true)
    .onTouchesMove((event, stateManager) => {
      // Only activate pan when we're dragging
      if (draggingTaskId) {
        stateManager.activate();
      }
    })
    .onUpdate((event) => {
      // Update position smoothly - card follows finger directly
      translateX.value = offsetX.value + event.translationX;
      translateY.value = offsetY.value + event.translationY;

      // translateX and translateY are screen coordinates
      // Pass them directly to updateDragPosition
      runOnJS(updateDragPosition)(translateX.value, translateY.value);
    })
    .onEnd(() => {
      runOnJS(drop)();
      
      // Reset position
      translateX.value = withTiming(0, { duration: 200 });
      translateY.value = withTiming(0, { duration: 200 });
    });

  const setDraggingTask = useCallback((id: string, x: number, y: number, groupId: string) => {
    setDraggingTaskId(id);
    setSourceGroupId(groupId);
    
    // Reset auto-scroll state
    hasAutoScrolledRef.current = false;
    lastAutoScrollTimeRef.current = 0;
    dragDistanceRef.current = 0;
    
    // Store initial screen position for drag distance calculation
    // x and y are already screen coordinates from measureInWindow
    initialScreenXRef.current = x;
    
    // Set initial offset to card's current position
    offsetX.value = x;
    offsetY.value = y;
    translateX.value = x;
    translateY.value = y;
  }, []);

  const setScrollViewRef = useCallback((ref: ScrollView | null) => {
    scrollViewRef.current = ref;
  }, []);

  const updateScrollOffset = useCallback((offset: number) => {
    scrollOffsetRef.current = offset;
  }, []);

  // Cleanup auto-scroll on unmount
  useEffect(() => {
    return () => {
      stopAutoScroll();
    };
  }, [stopAutoScroll]);

  // Animated style for floating card that follows finger smoothly
  const animatedStyle = useAnimatedStyle(() => {
    const isActive = draggingTaskId !== "";
    
    return {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      opacity: isActive ? withTiming(1, { duration: 150 }) : 0,
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: isActive ? withTiming(1.08, { duration: 150 }) : 0.9 },
        { rotateZ: isActive ? "3deg" : "0deg" },
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

          {/* Floating dragged item - follows finger smoothly */}
          <Animated.View
            style={[
              animatedStyle,
              {
                width: 280,
                zIndex: 1000,
                pointerEvents: "none",
              },
            ]}
          >
            {draggingTaskId && (
              <View style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
                elevation: 12,
              }}>
                <ItemCard
                  item={getItem(draggingTaskId)}
                  onPress={() => {}}
                  onDelete={() => {}}
                disableSwipe
                />
              </View>
            )}
          </Animated.View>
        </View>
      </GestureDetector>
    </DraggingContext.Provider>
  );
};
