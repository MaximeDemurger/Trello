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
  assignedMembers?: Member[]
  dueDate?: string
  priority?: 'low' | 'medium' | 'high'
  labels?: string[]
  archived?: boolean
  originalGroupId?: string
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
  members?: string[]
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
  color?: string
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
  assignedMembers?: Member[]
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

