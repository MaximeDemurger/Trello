import { ScrollView } from 'react-native';
import { SharedValue } from 'react-native-reanimated';
import { createContext, useContext } from 'react';

export type DropZone = {
  groupId: string;
  position: number;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type DraggingContext = {
  draggingTaskId: string;
  setDraggingTask: (id: string, x: number, y: number, groupId: string) => void;
  dragX: SharedValue<number>;
  dragY: SharedValue<number>;
  panGesture?: unknown;
  registerDropZone: (zone: DropZone) => void;
  unregisterDropZone: (groupId: string, position: number) => void;
  targetDropZone: { groupId: string; position: number } | null;
  hoveredGroupId: string | null;
  setScrollViewRef: (ref: ScrollView | null) => void;
  updateScrollOffset: (offset: number) => void;
  remeasureTrigger: number;
};

export const DraggingContext = createContext<DraggingContext>({
  setDraggingTask: () => {},
  draggingTaskId: '',
  dragX: { value: 0 } as SharedValue<number>,
  dragY: { value: 0 } as SharedValue<number>,
  panGesture: undefined,
  registerDropZone: () => {},
  unregisterDropZone: () => {},
  targetDropZone: null,
  hoveredGroupId: null,
  setScrollViewRef: () => {},
  updateScrollOffset: () => {},
  remeasureTrigger: 0,
});

export const useDraggingContext = () => useContext(DraggingContext);
