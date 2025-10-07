/**
 * Core data types for the BoardFlow application
 */

export type Member = {
  id: string
  name: string
  email?: string
  avatar?: string
  initials: string
  color: string
}

export type Item = {
  id: string
  title: string
  description: string
  groupId: string
  boardId: string
  order: number
  createdAt: string
  updatedAt: string
  // Optional fields
  assignee?: string
  assignedMembers?: string[] // Member IDs
  dueDate?: string
  priority?: 'low' | 'medium' | 'high'
  labels?: string[]
}

export type Group = {
  id: string
  title: string
  boardId: string
  order: number
  createdAt: string
}

export type Board = {
  id: string
  title: string
  description: string
  color: string
  members?: string[] // Member IDs
  createdAt: string
  updatedAt: string
}

export type BoardWithGroups = Board & {
  groups: GroupWithItems[]
}

export type GroupWithItems = Group & {
  items: Item[]
}

export type CreateBoardInput = {
  title: string
  description: string
}

export type CreateGroupInput = {
  title: string
  boardId: string
}

export type CreateItemInput = {
  title: string
  description: string
  groupId: string
  boardId: string
  assignee?: string
  assignedMembers?: string[]
  dueDate?: string
  priority?: 'low' | 'medium' | 'high'
  labels?: string[]
}

export type UpdateItemInput = Partial<Omit<Item, 'id' | 'createdAt'>> & {
  id: string
}

export type MoveItemInput = {
  itemId: string
  targetGroupId: string
  targetOrder: number
}

