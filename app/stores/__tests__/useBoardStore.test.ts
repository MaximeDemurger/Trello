/**
 * Tests for useBoardStore
 * Testing board, group, and item management
 */

import { useBoardStore } from '../useBoardStore';

describe('useBoardStore', () => {
  beforeEach(() => {
    // Clear store before each test
    useBoardStore.getState().clearAll();
  });

  describe('Board Management', () => {
    it('should create a new board', () => {
      const store = useBoardStore.getState();

      store.createBoard({
        title: 'Test Board',
        description: 'Test Description',
      });

      const boards = useBoardStore.getState().boards;
      expect(boards).toHaveLength(1);
      expect(boards[0].title).toBe('Test Board');
      expect(boards[0].description).toBe('Test Description');
      expect(boards[0].id).toBeDefined();
      expect(boards[0].color).toBeDefined();
    });

    it('should delete a board and its related groups and items', () => {
      const store = useBoardStore.getState();

      const board = store.createBoard({
        title: 'Test Board',
        description: 'Test',
      });
      const boardId = board.id;

      store.createGroup({
        title: 'Test Group',
        boardId: board.id,
      });

      store.deleteBoard(boardId);

      expect(useBoardStore.getState().boards).toHaveLength(0);
      expect(useBoardStore.getState().groups).toHaveLength(0);
    });

    it('should update a board', () => {
      const store = useBoardStore.getState();

      const board = store.createBoard({
        title: 'Original Title',
        description: 'Original',
      });
      const boardId = board.id;

      store.updateBoard(boardId, {
        title: 'Updated Title',
      });

      const updatedBoard = useBoardStore.getState().boards.find((b) => b.id === boardId);
      expect(updatedBoard?.title).toBe('Updated Title');
    });
  });

  describe('Group Management', () => {
    it('should create a new group', () => {
      const store = useBoardStore.getState();

      const board = store.createBoard({
        title: 'Test Board',
        description: 'Test',
      });
      const boardId = board.id;

      store.createGroup({
        title: 'Test Group',
        boardId: board.id,
      });

      const groups = useBoardStore.getState().groups;
      expect(groups).toHaveLength(1);
      expect(groups[0].title).toBe('Test Group');
      expect(groups[0].boardId).toBe(boardId);
      expect(groups[0].order).toBe(0);
    });

    it('should assign correct order to groups', () => {
      const store = useBoardStore.getState();

      const board = store.createBoard({
        title: 'Test Board',
        description: 'Test',
      });

      store.createGroup({
        title: 'Group 1',
        boardId: board.id,
      });
      store.createGroup({
        title: 'Group 2',
        boardId: board.id,
      });
      store.createGroup({
        title: 'Group 3',
        boardId: board.id,
      });

      const groups = useBoardStore.getState().groups.sort((a, b) => a.order - b.order);
      expect(groups[0].order).toBe(0);
      expect(groups[1].order).toBe(1);
      expect(groups[2].order).toBe(2);
    });

    it('should delete a group', () => {
      const store = useBoardStore.getState();

      const board = store.createBoard({
        title: 'Test Board',
        description: 'Test',
      });

      const group = store.createGroup({
        title: 'Test Group',
        boardId: board.id,
      });
      const groupId = group.id;

      store.deleteGroup(groupId);

      expect(useBoardStore.getState().groups).toHaveLength(0);
    });
  });

  describe('Item Management', () => {
    it('should create a new item', () => {
      const store = useBoardStore.getState();

      const board = store.createBoard({
        title: 'Test Board',
        description: 'Test',
      });
      const boardId = board.id;

      const group = store.createGroup({
        title: 'Test Group',
        boardId: board.id,
      });
      const groupId = group.id;

      store.createItem({
        title: 'Test Item',
        description: 'Test Description',
        groupId: group.id,
        boardId: board.id,
      });

      const items = useBoardStore.getState().items;
      expect(items).toHaveLength(1);
      expect(items[0].title).toBe('Test Item');
      expect(items[0].description).toBe('Test Description');
      expect(items[0].groupId).toBe(groupId);
      expect(items[0].boardId).toBe(boardId);
    });

    it('should delete an item', () => {
      const store = useBoardStore.getState();

      const board = store.createBoard({
        title: 'Test Board',
        description: 'Test',
      });

      const group = store.createGroup({
        title: 'Test Group',
        boardId: board.id,
      });

      const item = store.createItem({
        title: 'Test Item',
        description: 'Test',
        groupId: group.id,
        boardId: board.id,
      });
      const itemId = item.id;

      store.deleteItem(itemId);

      expect(useBoardStore.getState().items).toHaveLength(0);
    });

    it('should update an item', () => {
      const store = useBoardStore.getState();

      const board = store.createBoard({
        title: 'Test Board',
        description: 'Test',
      });

      const group = store.createGroup({
        title: 'Test Group',
        boardId: board.id,
      });

      const item = store.createItem({
        title: 'Original Title',
        description: 'Original',
        groupId: group.id,
        boardId: board.id,
      });
      const itemId = item.id;

      store.updateItem({
        id: itemId,
        title: 'Updated Title',
      });

      const updatedItem = useBoardStore.getState().items.find((i) => i.id === itemId);
      expect(updatedItem?.title).toBe('Updated Title');
    });

    it('should move item between groups', () => {
      const store = useBoardStore.getState();

      const board = store.createBoard({
        title: 'Test Board',
        description: 'Test',
      });

      const group1 = store.createGroup({
        title: 'Group 1',
        boardId: board.id,
      });

      const group2 = store.createGroup({
        title: 'Group 2',
        boardId: board.id,
      });
      const group2Id = group2.id;

      const item = store.createItem({
        title: 'Test Item',
        description: 'Test',
        groupId: group1.id,
        boardId: board.id,
      });
      const itemId = item.id;

      store.moveItem({
        itemId,
        targetGroupId: group2Id,
        targetOrder: 0,
      });

      const movedItem = useBoardStore.getState().items.find((i) => i.id === itemId);
      expect(movedItem?.groupId).toBe(group2Id);
    });
  });

  describe('Data Retrieval', () => {
    it('should get board with groups', () => {
      const store = useBoardStore.getState();

      const board = store.createBoard({
        title: 'Test Board',
        description: 'Test',
      });
      const boardId = board.id;

      const group = store.createGroup({
        title: 'Test Group',
        boardId: board.id,
      });

      store.createItem({
        title: 'Test Item',
        description: 'Test',
        groupId: group.id,
        boardId: board.id,
      });

      const boardWithGroups = store.getBoardWithGroups(boardId);

      expect(boardWithGroups).toBeDefined();
      expect(boardWithGroups?.groups).toHaveLength(1);
      expect(boardWithGroups?.groups[0].items).toHaveLength(1);
    });

    it('should get all boards with groups', () => {
      const store = useBoardStore.getState();

      const board1 = store.createBoard({
        title: 'Board 1',
        description: 'Test',
      });

      const board2 = store.createBoard({
        title: 'Board 2',
        description: 'Test',
      });

      store.createGroup({
        title: 'Group 1',
        boardId: board1.id,
      });

      store.createGroup({
        title: 'Group 2',
        boardId: board2.id,
      });

      const allBoards = store.getAllBoardsWithGroups();

      expect(allBoards).toHaveLength(2);
      expect(allBoards[0].groups).toHaveLength(1);
      expect(allBoards[1].groups).toHaveLength(1);
    });
  });

  describe('Initialization', () => {
    it('should initialize with default data', () => {
      const store = useBoardStore.getState();

      store.initializeDefaultData();

      expect(useBoardStore.getState().boards.length).toBeGreaterThan(0);
      expect(useBoardStore.getState().groups.length).toBeGreaterThan(0);
      expect(useBoardStore.getState().items.length).toBeGreaterThan(0);
    });

    it('should not reinitialize if data already exists', () => {
      const store = useBoardStore.getState();

      store.initializeDefaultData();

      const initialBoardCount = useBoardStore.getState().boards.length;

      store.initializeDefaultData();

      expect(useBoardStore.getState().boards.length).toBe(initialBoardCount);
    });
  });
});
