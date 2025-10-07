/**
 * Tests for useBoardStore
 * Testing board, group, and item management
 */

import { renderHook, act } from '@testing-library/react-hooks'
import { useBoardStore } from '../useBoardStore'

describe('useBoardStore', () => {
  beforeEach(() => {
    // Clear store before each test
    act(() => {
      useBoardStore.getState().clearAll()
    })
  })

  describe('Board Management', () => {
    it('should create a new board', () => {
      const { result } = renderHook(() => useBoardStore())

      act(() => {
        result.current.createBoard({
          title: 'Test Board',
          description: 'Test Description',
        })
      })

      const boards = result.current.boards
      expect(boards).toHaveLength(1)
      expect(boards[0].title).toBe('Test Board')
      expect(boards[0].description).toBe('Test Description')
      expect(boards[0].id).toBeDefined()
      expect(boards[0].color).toBeDefined()
    })

    it('should delete a board and its related groups and items', () => {
      const { result } = renderHook(() => useBoardStore())

      let boardId: string

      act(() => {
        const board = result.current.createBoard({
          title: 'Test Board',
          description: 'Test',
        })
        boardId = board.id

        result.current.createGroup({
          title: 'Test Group',
          boardId: board.id,
        })
      })

      act(() => {
        result.current.deleteBoard(boardId)
      })

      expect(result.current.boards).toHaveLength(0)
      expect(result.current.groups).toHaveLength(0)
    })

    it('should update a board', () => {
      const { result } = renderHook(() => useBoardStore())

      let boardId: string

      act(() => {
        const board = result.current.createBoard({
          title: 'Original Title',
          description: 'Original',
        })
        boardId = board.id
      })

      act(() => {
        result.current.updateBoard(boardId, {
          title: 'Updated Title',
        })
      })

      const board = result.current.boards.find((b) => b.id === boardId)
      expect(board?.title).toBe('Updated Title')
    })
  })

  describe('Group Management', () => {
    it('should create a new group', () => {
      const { result } = renderHook(() => useBoardStore())

      let boardId: string

      act(() => {
        const board = result.current.createBoard({
          title: 'Test Board',
          description: 'Test',
        })
        boardId = board.id

        result.current.createGroup({
          title: 'Test Group',
          boardId: board.id,
        })
      })

      const groups = result.current.groups
      expect(groups).toHaveLength(1)
      expect(groups[0].title).toBe('Test Group')
      expect(groups[0].boardId).toBe(boardId)
      expect(groups[0].order).toBe(0)
    })

    it('should assign correct order to groups', () => {
      const { result } = renderHook(() => useBoardStore())

      let boardId: string

      act(() => {
        const board = result.current.createBoard({
          title: 'Test Board',
          description: 'Test',
        })
        boardId = board.id

        result.current.createGroup({
          title: 'Group 1',
          boardId: board.id,
        })
        result.current.createGroup({
          title: 'Group 2',
          boardId: board.id,
        })
        result.current.createGroup({
          title: 'Group 3',
          boardId: board.id,
        })
      })

      const groups = result.current.groups.sort((a, b) => a.order - b.order)
      expect(groups[0].order).toBe(0)
      expect(groups[1].order).toBe(1)
      expect(groups[2].order).toBe(2)
    })

    it('should delete a group', () => {
      const { result } = renderHook(() => useBoardStore())

      let groupId: string

      act(() => {
        const board = result.current.createBoard({
          title: 'Test Board',
          description: 'Test',
        })

        const group = result.current.createGroup({
          title: 'Test Group',
          boardId: board.id,
        })
        groupId = group.id
      })

      act(() => {
        result.current.deleteGroup(groupId)
      })

      expect(result.current.groups).toHaveLength(0)
    })
  })

  describe('Item Management', () => {
    it('should create a new item', () => {
      const { result } = renderHook(() => useBoardStore())

      let boardId: string
      let groupId: string

      act(() => {
        const board = result.current.createBoard({
          title: 'Test Board',
          description: 'Test',
        })
        boardId = board.id

        const group = result.current.createGroup({
          title: 'Test Group',
          boardId: board.id,
        })
        groupId = group.id

        result.current.createItem({
          title: 'Test Item',
          description: 'Test Description',
          groupId: group.id,
          boardId: board.id,
        })
      })

      const items = result.current.items
      expect(items).toHaveLength(1)
      expect(items[0].title).toBe('Test Item')
      expect(items[0].description).toBe('Test Description')
      expect(items[0].groupId).toBe(groupId)
      expect(items[0].boardId).toBe(boardId)
    })

    it('should delete an item', () => {
      const { result } = renderHook(() => useBoardStore())

      let itemId: string

      act(() => {
        const board = result.current.createBoard({
          title: 'Test Board',
          description: 'Test',
        })

        const group = result.current.createGroup({
          title: 'Test Group',
          boardId: board.id,
        })

        const item = result.current.createItem({
          title: 'Test Item',
          description: 'Test',
          groupId: group.id,
          boardId: board.id,
        })
        itemId = item.id
      })

      act(() => {
        result.current.deleteItem(itemId)
      })

      expect(result.current.items).toHaveLength(0)
    })

    it('should update an item', () => {
      const { result } = renderHook(() => useBoardStore())

      let itemId: string

      act(() => {
        const board = result.current.createBoard({
          title: 'Test Board',
          description: 'Test',
        })

        const group = result.current.createGroup({
          title: 'Test Group',
          boardId: board.id,
        })

        const item = result.current.createItem({
          title: 'Original Title',
          description: 'Original',
          groupId: group.id,
          boardId: board.id,
        })
        itemId = item.id
      })

      act(() => {
        result.current.updateItem({
          id: itemId,
          title: 'Updated Title',
        })
      })

      const item = result.current.items.find((i) => i.id === itemId)
      expect(item?.title).toBe('Updated Title')
    })

    it('should move item between groups', () => {
      const { result } = renderHook(() => useBoardStore())

      let itemId: string
      let group2Id: string

      act(() => {
        const board = result.current.createBoard({
          title: 'Test Board',
          description: 'Test',
        })

        const group1 = result.current.createGroup({
          title: 'Group 1',
          boardId: board.id,
        })

        const group2 = result.current.createGroup({
          title: 'Group 2',
          boardId: board.id,
        })
        group2Id = group2.id

        const item = result.current.createItem({
          title: 'Test Item',
          description: 'Test',
          groupId: group1.id,
          boardId: board.id,
        })
        itemId = item.id
      })

      act(() => {
        result.current.moveItem({
          itemId,
          targetGroupId: group2Id,
          targetOrder: 0,
        })
      })

      const item = result.current.items.find((i) => i.id === itemId)
      expect(item?.groupId).toBe(group2Id)
    })
  })

  describe('Data Retrieval', () => {
    it('should get board with groups', () => {
      const { result } = renderHook(() => useBoardStore())

      let boardId: string

      act(() => {
        const board = result.current.createBoard({
          title: 'Test Board',
          description: 'Test',
        })
        boardId = board.id

        const group = result.current.createGroup({
          title: 'Test Group',
          boardId: board.id,
        })

        result.current.createItem({
          title: 'Test Item',
          description: 'Test',
          groupId: group.id,
          boardId: board.id,
        })
      })

      const boardWithGroups = result.current.getBoardWithGroups(boardId)

      expect(boardWithGroups).toBeDefined()
      expect(boardWithGroups?.groups).toHaveLength(1)
      expect(boardWithGroups?.groups[0].items).toHaveLength(1)
    })

    it('should get all boards with groups', () => {
      const { result } = renderHook(() => useBoardStore())

      act(() => {
        const board1 = result.current.createBoard({
          title: 'Board 1',
          description: 'Test',
        })

        const board2 = result.current.createBoard({
          title: 'Board 2',
          description: 'Test',
        })

        result.current.createGroup({
          title: 'Group 1',
          boardId: board1.id,
        })

        result.current.createGroup({
          title: 'Group 2',
          boardId: board2.id,
        })
      })

      const allBoards = result.current.getAllBoardsWithGroups()

      expect(allBoards).toHaveLength(2)
      expect(allBoards[0].groups).toHaveLength(1)
      expect(allBoards[1].groups).toHaveLength(1)
    })
  })

  describe('Initialization', () => {
    it('should initialize with default data', () => {
      const { result } = renderHook(() => useBoardStore())

      act(() => {
        result.current.initializeDefaultData()
      })

      expect(result.current.boards.length).toBeGreaterThan(0)
      expect(result.current.groups.length).toBeGreaterThan(0)
      expect(result.current.items.length).toBeGreaterThan(0)
    })

    it('should not reinitialize if data already exists', () => {
      const { result } = renderHook(() => useBoardStore())

      act(() => {
        result.current.initializeDefaultData()
      })

      const initialBoardCount = result.current.boards.length

      act(() => {
        result.current.initializeDefaultData()
      })

      expect(result.current.boards.length).toBe(initialBoardCount)
    })
  })
})

