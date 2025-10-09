/**
 * MMKV Storage configuration for BoardFlow
 * Using MMKV for high-performance local storage
 */

import { MMKV } from 'react-native-mmkv';

// Main storage instance
export const storage = new MMKV();

// Zustand-compatible storage interface
export const zustandStorage = {
  setItem: (name: string, value: string) => {
    return storage.set(name, value);
  },
  getItem: (name: string) => {
    const value = storage.getString(name);
    return value ?? null;
  },
  removeItem: (name: string) => {
    return storage.delete(name);
  },
};

// Storage keys
export const STORAGE_KEYS = {
  BOARDS: 'boards',
  GROUPS: 'groups',
  ITEMS: 'items',
} as const;
