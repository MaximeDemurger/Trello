import React from 'react';
import TestRenderer, { act, ReactTestInstance } from 'react-test-renderer';
import { Text } from 'react-native';
import { Item } from '@/types/board.types';
import { ItemCard } from '../ItemCard';
import { DraggingContext } from '../../DragDropProvider/dragDropContext';

// Reanimated mock keeps animations synchronous and values plain
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  // Silence the useNativeDriver warning and avoid scheduling issues
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Avoid native calls during tests
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium', Heavy: 'Heavy' },
}));

// Mock unistyles to avoid NitroModules / TurboModule lookups in Jest
jest.mock('react-native-unistyles', () => ({
  StyleSheet: { create: (styles: any) => styles },
}));

// Icons are not relevant to logic; render as simple components
jest.mock('@expo/vector-icons', () => ({ Ionicons: 'Ionicons' }));

const createItem = (overrides: Partial<Item> = {}): Item => ({
  id: 'item-1',
  title: 'My Task',
  description: 'Do something important',
  groupId: 'group-1',
  boardId: 'board-1',
  order: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

const renderWithDraggingContext = (
  ui: React.ReactElement,
  ctxOverrides: Partial<React.ComponentProps<typeof DraggingContext.Provider>['value']> = {},
) => {
  const defaultValue = {
    draggingTaskId: '',
    setDraggingTask: jest.fn(),
    dragX: { value: 0 },
    dragY: { value: 0 },
    registerDropZone: jest.fn(),
    unregisterDropZone: jest.fn(),
    targetDropZone: null,
    hoveredGroupId: null,
    setScrollViewRef: jest.fn(),
    updateScrollOffset: jest.fn(),
    remeasureTrigger: 0,
  } as any;

  let renderer: TestRenderer.ReactTestRenderer;
  act(() => {
    renderer = TestRenderer.create(
      <DraggingContext.Provider value={{ ...defaultValue, ...(ctxOverrides as any) }}>
        {ui}
      </DraggingContext.Provider>,
    );
  });
  // @ts-expect-error set in act above
  return renderer;
};

const findAncestor = (
  node: ReactTestInstance,
  predicate: (n: ReactTestInstance) => boolean,
): ReactTestInstance => {
  let current: ReactTestInstance | null = node.parent;
  while (current) {
    if (predicate(current)) return current;
    current = current.parent;
  }
  throw new Error('Ancestor not found');
};

describe('ItemCard', () => {
  it('renders title and description', () => {
    const item = createItem();
    const tree = renderWithDraggingContext(<ItemCard item={item} />);

    const texts = tree.root
      .findAllByType(Text)
      .map((t) => t.props.children)
      .flat();
    expect(texts).toEqual(expect.arrayContaining([item.title, item.description]));
  });

  it('calls onPress when the card is pressed', () => {
    const item = createItem();
    const onPress = jest.fn();
    const tree = renderWithDraggingContext(<ItemCard item={item} onPress={onPress} />);

    const titleText = tree.root.find(
      (node) => node.type === Text && node.props.children === item.title,
    );
    const cardPressable = findAncestor(
      titleText,
      (n) => typeof n.props.onLongPress === 'function' && typeof n.props.onPress === 'function',
    );

    act(() => {
      cardPressable.props.onPress();
    });

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('calls onArchive when the left action is pressed', () => {
    const item = createItem();
    const onArchive = jest.fn();
    const tree = renderWithDraggingContext(<ItemCard item={item} onArchive={onArchive} />);

    // Find the left action by its nested text content
    const archiveText = tree.root.find(
      (node) => node.type === Text && node.props.children === 'Archive',
    );
    const leftAction = findAncestor(archiveText, (n) => typeof n.props.onPress === 'function');

    act(() => {
      leftAction.props.onPress();
    });

    expect(onArchive).toHaveBeenCalledTimes(1);
  });

  it('calls onDelete when the right action is pressed', () => {
    const item = createItem();
    const onDelete = jest.fn();
    const tree = renderWithDraggingContext(<ItemCard item={item} onDelete={onDelete} />);

    const deleteText = tree.root.find(
      (node) => node.type === Text && node.props.children === 'Delete',
    );
    const rightAction = findAncestor(deleteText, (n) => typeof n.props.onPress === 'function');

    act(() => {
      rightAction.props.onPress();
    });

    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('hides actions and still supports long-press when swipe is disabled', () => {
    const item = createItem();
    const tree = renderWithDraggingContext(<ItemCard disableSwipe item={item} />);

    const texts = tree.root.findAllByType(Text).map((t) => t.props.children);
    expect(texts).not.toContain('Archive');
    expect(texts).not.toContain('Delete');

    // Card pressable still exists and supports long-press (search by handlers)
    const nodesWithHandlers = tree.root.findAll(
      (n) => typeof n.props.onLongPress === 'function' || typeof n.props.onPress === 'function',
    );
    expect(nodesWithHandlers.length).toBeGreaterThan(0);
  });
});
