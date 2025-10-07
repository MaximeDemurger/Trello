import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { zustandStorage } from "@/storage/mmkv";
import { generateId, generateTimestamp } from "@/utils/id";
import { BOARD_COLORS, MEMBER_COLORS } from "@/constants";
import type {
  Board,
  Group,
  Item,
  Member,
  CreateBoardInput,
  CreateGroupInput,
  CreateItemInput,
  UpdateItemInput,
  MoveItemInput,
  BoardWithGroups,
  GroupWithItems,
} from "@/types/board.types";

interface BoardState {
  boards: Board[];
  groups: Group[];
  items: Item[];
  members: Member[];
}

interface BoardActions {
  createBoard: (input: CreateBoardInput) => Board;
  deleteBoard: (boardId: string) => void;
  updateBoard: (boardId: string, updates: Partial<Board>) => void;
  createMember: (input: { name: string; email?: string }) => Member;
  addMemberToBoard: (boardId: string, memberId: string) => void;
  createGroup: (input: CreateGroupInput) => Group;
  deleteGroup: (groupId: string) => void;
  updateGroup: (groupId: string, updates: Partial<Group>) => void;
  createItem: (input: CreateItemInput) => Item;
  getItem: (itemId: string) => Item | undefined;
  deleteItem: (itemId: string) => void;
  updateItem: (input: UpdateItemInput) => void;
  updateItemAssignees: (itemId: string, assignees: Member[]) => void;
  moveItem: (input: MoveItemInput) => void;
  archiveItem: (itemId: string) => void;
  getBoardWithGroups: (boardId: string) => BoardWithGroups | null;
  getAllBoardsWithGroups: () => BoardWithGroups[];
  initializeDefaultData: () => void;
  clearAll: () => void;
}

type BoardStore = BoardState & BoardActions;

 

const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const getMemberColor = (name: string): string => {
  return MEMBER_COLORS[name.length % MEMBER_COLORS.length];
};

const initialState: BoardState = {
  boards: [],
  groups: [],
  items: [],
  members: [
    {
      id: "1",
      name: "Maxime Demurger",
      email: "maxime@demurger.com",
      initials: "MD",
      color: "#6366f1",
    },
    {
      id: "2",
      name: "Elon Musk",
      email: "elon@musk.com",
      initials: "EM",
      color: "#ec4899",
    },
    {
      id: "3",
      name: "Jeff Bezos",
      email: "jeff@bezos.com",
      initials: "JB",
      color: "#10b981",
    },
    {
      id: "4",
      name: "Mark Zuckerberg",
      email: "mark@zuckerberg.com",
      initials: "MZ",
      color: "#f59e0b",
    },
    {
      id: "5",
      name: "Bill Gates",
      email: "bill@gates.com",
      initials: "BG",
      color: "#8b5cf6",
    },
    {
      id: "6",
      name: "Warren Buffett",
      email: "warren@buffett.com",
      initials: "WB",
      color: "#ef4444",
    },
    {
      id: "7",
      name: "Larry Ellison",
      email: "larry@ellison.com",
      initials: "LE",
      color: "#3b82f6",
    },
    {
      id: "8",
      name: "Steve Jobs",
      email: "steve@jobs.com",
      initials: "SJ",
      color: "#a855f7",
    },
    {
      id: "9",
      name: "Larry Page",
      email: "larry@page.com",
      initials: "LP",
      color: "#f97316",
    },
    {
      id: "10",
      name: "Sergey Brin",
      email: "sergey@brin.com",
      initials: "SB",
      color: "#14b8a6",
    },
  ],
};

export const useBoardStore = create<BoardStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      createBoard: (input) => {
        const board: Board = {
          id: generateId(),
          title: input.title,
          description: input.description,
          color: input.color ?? BOARD_COLORS[Math.floor(Math.random() * BOARD_COLORS.length)],
          createdAt: generateTimestamp(),
          updatedAt: generateTimestamp(),
        };

        set((state) => ({
          boards: [...state.boards, board],
        }));

        return board;
      },

      deleteBoard: (boardId) => {
        set((state) => ({
          boards: state.boards.filter((b) => b.id !== boardId),
          groups: state.groups.filter((g) => g.boardId !== boardId),
          items: state.items.filter((i) => i.boardId !== boardId),
        }));
      },

      updateBoard: (boardId, updates) => {
        set((state) => ({
          boards: state.boards.map((b) =>
            b.id === boardId
              ? { ...b, ...updates, updatedAt: generateTimestamp() }
              : b
          ),
        }));
      },
      createMember: ({ name, email }) => {
        const member: Member = {
          id: generateId(),
          name,
          email,
          initials: getInitials(name),
          color: getMemberColor(name),
        };

        set((state) => ({ members: [...state.members, member] }));
        return member;
      },

      addMemberToBoard: (boardId, memberId) => {
        set((state) => ({
          boards: state.boards.map((b) => {
            if (b.id !== boardId) return b;
            const currentMembers = b.members ?? [];
            if (currentMembers.includes(memberId)) {
              return { ...b, updatedAt: generateTimestamp() };
            }
            return {
              ...b,
              members: [...currentMembers, memberId],
              updatedAt: generateTimestamp(),
            };
          }),
        }));
      },
      createGroup: (input) => {
        const state = get();
        const boardGroups = state.groups.filter(
          (g) => g.boardId === input.boardId
        );
        const maxOrder = boardGroups.reduce(
          (max, g) => Math.max(max, g.order),
          -1
        );

        const group: Group = {
          id: generateId(),
          title: input.title,
          boardId: input.boardId,
          order: maxOrder + 1,
          createdAt: generateTimestamp(),
        };

        set((state) => ({
          groups: [...state.groups, group],
        }));

        return group;
      },

      getItem: (itemId: string) => {
        const state = get();
        return state.items.find((i) => i.id === itemId);
      },

      deleteGroup: (groupId) => {
        set((state) => ({
          groups: state.groups.filter((g) => g.id !== groupId),
          items: state.items.filter((i) => i.groupId !== groupId),
        }));
      },

      updateGroup: (groupId, updates) => {
        set((state) => ({
          groups: state.groups.map((g) =>
            g.id === groupId ? { ...g, ...updates } : g
          ),
        }));
      },
      createItem: (input) => {
        const state = get();
        const groupItems = state.items.filter(
          (i) => i.groupId === input.groupId
        );
        const maxOrder = groupItems.reduce(
          (max, i) => Math.max(max, i.order),
          -1
        );

        const item: Item = {
          id: generateId(),
          title: input.title,
          description: input.description,
          groupId: input.groupId,
          boardId: input.boardId,
          order: maxOrder + 1,
          createdAt: generateTimestamp(),
          updatedAt: generateTimestamp(),
          assignedMembers: input.assignedMembers,
          dueDate: input.dueDate,
          priority: input.priority,
          labels: input.labels,
        };

        set((state) => ({
          items: [...state.items, item],
        }));

        return item;
      },

      deleteItem: (itemId) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== itemId),
        }));
      },

      updateItem: (input) => {
        set((state) => ({
          items: state.items.map((i) =>
            i.id === input.id
              ? { ...i, ...input, updatedAt: generateTimestamp() }
              : i
          ),
        }));
      },

      updateItemAssignees: (itemId, assignees) => {
        set((state) => ({
          items: state.items.map((i) =>
            i.id === itemId ? { ...i, assignedMembers: assignees, updatedAt: generateTimestamp() } : i
          ),
        }));
      },

      moveItem: ({ itemId, targetGroupId, targetOrder }) => {
        set((state) => {
          const item = state.items.find((i) => i.id === itemId);
          if (!item) return state;

          const oldGroupId = item.groupId;

          // Create updated items array
          const updatedItems = state.items.map((i) => {
            // Update the moved item
            if (i.id === itemId) {
              return {
                ...i,
                groupId: targetGroupId,
                order: targetOrder,
                updatedAt: generateTimestamp(),
              };
            }

            // Reorder items in target group
            if (i.groupId === targetGroupId && i.id !== itemId) {
              if (i.order >= targetOrder) {
                return { ...i, order: i.order + 1 };
              }
            }

            // Reorder items in old group if different
            if (oldGroupId !== targetGroupId && i.groupId === oldGroupId) {
              if (i.order > item.order) {
                return { ...i, order: i.order - 1 };
              }
            }

            return i;
          });

          return { items: updatedItems };
        });
      },

      archiveItem: (itemId) => {
        get().deleteItem(itemId);
      },
      getBoardWithGroups: (boardId) => {
        const state = get();
        const board = state.boards.find((b) => b.id === boardId);
        if (!board) return null;

        const groups = state.groups
          .filter((g) => g.boardId === boardId)
          .sort((a, b) => a.order - b.order)
          .map((group) => ({
            ...group,
            items: state.items
              .filter((i) => i.groupId === group.id)
              .sort((a, b) => a.order - b.order),
          }));

        return {
          ...board,
          groups,
        };
      },
      getAllBoardsWithGroups: () => {
        const state = get();
        return state.boards.map((board) => {
          const groups = state.groups
            .filter((g) => g.boardId === board.id)
            .sort((a, b) => a.order - b.order)
            .map((group) => ({
              ...group,
              items: state.items
                .filter((i) => i.groupId === group.id)
                .sort((a, b) => a.order - b.order),
            }));

          return {
            ...board,
            groups,
          };
        });
      },
      initializeDefaultData: () => {
        const state = get();
        if (state.boards.length > 0) return;
        const names = [
          "Maxime Demurger",
          "Elon Musk",
          "Jeff Bezos",
          "Mark Zuckerberg",
          "Bill Gates",
          "Warren Buffett",
          "Larry Ellison",
          "Steve Jobs",
          "Larry Page",
          "Sergey Brin",
          "Jack Ma",
          "Richard Branson",
          "Tim Cook",
          "Satya Nadella",
          "Sundar Pichai",
          "Tim Ferriss",
          "Tony Robbins",
          "Gary Vee",
          "Grant Cardone",
          "Ryan Holiday",
        ];

        const sampleMembers: Member[] = names.map((name) => ({
          id: generateId(),
          name,
          email: `${name.toLowerCase().replace(/[^a-z]+/g, ".")}@example.com`,
          initials: getInitials(name),
          color: getMemberColor(name),
        }));

        set({ members: sampleMembers });
        const board = get().createBoard({
          title: "My First Board",
          description: "Welcome to BoardFlow! This is your first board.",
        });
        get().updateBoard(board.id, { 
          members: sampleMembers.slice(0, 5).map((m) => m.id) 
        });
        const todoGroup = get().createGroup({
          title: "To Do",
          boardId: board.id,
        });

        const inProgressGroup = get().createGroup({
          title: "In Progress",
          boardId: board.id,
        });

        const doneGroup = get().createGroup({
          title: "Done",
          boardId: board.id,
        });
        const item1 = get().createItem({
          title: "Welcome to BoardFlow",
          description: "Try dragging this card to another column!",
          groupId: todoGroup.id,
          boardId: board.id,
        });
        const maxime = sampleMembers[0];
        get().updateItem({
          id: item1.id,
          priority: "high",
          labels: ["Getting Started", "Documentation"],
          assignedMembers: maxime ? [maxime] : [],
        });

        const item2 = get().createItem({
          title: "Swipe to delete",
          description: "Swipe left on any card to archive or delete it.",
          groupId: todoGroup.id,
          boardId: board.id,
        });
        get().updateItem({
          id: item2.id,
          priority: "medium",
        });

        const item3 = get().createItem({
          title: "Building new feature",
          description: "Working on the drag and drop functionality.",
          groupId: inProgressGroup.id,
          boardId: board.id,
        });
        get().updateItem({
          id: item3.id,
          priority: "high",
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          labels: ["Feature", "In Progress"],
        });

        get().createItem({
          title: "Setup project",
          description: "Initial project setup completed!",
          groupId: doneGroup.id,
          boardId: board.id,
        });
      },

      clearAll: () => {
        set(initialState);
      },
    }),
    {
      name: "board-storage",
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state) => ({
        boards: state.boards,
        groups: state.groups,
        items: state.items,
        members: state.members,
      }),
    }
  )
);
