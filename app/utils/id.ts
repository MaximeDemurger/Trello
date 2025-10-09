/**
 * Utility functions for generating unique IDs
 */

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const generateTimestamp = (): string => {
  return new Date().toISOString();
};
