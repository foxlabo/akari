import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind classes with conditional + conflict-resolved logic.
 * Standard cn() helper used across the codebase.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
