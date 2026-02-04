export const PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
} as const;

export type Priority = typeof PRIORITIES[keyof typeof PRIORITIES];

export const PRIORITY_LABELS = {
  [PRIORITIES.LOW]: 'Low',
  [PRIORITIES.MEDIUM]: 'Medium',
  [PRIORITIES.HIGH]: 'High',
} as const;

export const PRIORITY_COLORS = {
  [PRIORITIES.LOW]: 'bg-green-100 text-green-800',
  [PRIORITIES.MEDIUM]: 'bg-yellow-100 text-yellow-800',
  [PRIORITIES.HIGH]: 'bg-red-100 text-red-800',
} as const;

export const PRIORITY_HOVER_COLORS = {
  [PRIORITIES.LOW]: 'hover:bg-green-50',
  [PRIORITIES.MEDIUM]: 'hover:bg-yellow-50',
  [PRIORITIES.HIGH]: 'hover:bg-red-50',
} as const;

export const PRIORITY_OPTIONS = [
  { value: PRIORITIES.LOW, label: PRIORITY_LABELS[PRIORITIES.LOW] },
  { value: PRIORITIES.MEDIUM, label: PRIORITY_LABELS[PRIORITIES.MEDIUM] },
  { value: PRIORITIES.HIGH, label: PRIORITY_LABELS[PRIORITIES.HIGH] },
] as const;
