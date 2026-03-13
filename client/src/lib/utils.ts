import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Maps database color strings to static Tailwind class names.
 * Dynamic class generation (e.g. `bg-${color}`) breaks Tailwind's
 * static analysis / purge step, so we use a lookup instead.
 */
const tailwindColorMap: Record<string, { bg: string; bgLight: string; bgHover: string }> = {
  'blue-200':    { bg: 'bg-blue-200',    bgLight: 'bg-blue-100',    bgHover: 'hover:bg-blue-200' },
  'emerald-200': { bg: 'bg-emerald-200', bgLight: 'bg-emerald-100', bgHover: 'hover:bg-emerald-200' },
  'green-200':   { bg: 'bg-green-200',   bgLight: 'bg-green-100',   bgHover: 'hover:bg-green-200' },
  'orange-200':  { bg: 'bg-orange-200',  bgLight: 'bg-orange-100',  bgHover: 'hover:bg-orange-200' },
  'purple-200':  { bg: 'bg-purple-200',  bgLight: 'bg-purple-100',  bgHover: 'hover:bg-purple-200' },
  'rose-200':    { bg: 'bg-rose-200',    bgLight: 'bg-rose-100',    bgHover: 'hover:bg-rose-200' },
  'stone-200':   { bg: 'bg-stone-200',   bgLight: 'bg-stone-100',   bgHover: 'hover:bg-stone-200' },
  'violet-200':  { bg: 'bg-violet-200',  bgLight: 'bg-violet-100',  bgHover: 'hover:bg-violet-200' },
  'gray-400':    { bg: 'bg-gray-400',    bgLight: 'bg-gray-200',    bgHover: 'hover:bg-gray-300' },
  'gray-100':    { bg: 'bg-gray-100',    bgLight: 'bg-gray-50',     bgHover: 'hover:bg-gray-100' },
};

const fallbackColor = { bg: 'bg-gray-100', bgLight: 'bg-gray-50', bgHover: 'hover:bg-gray-100' };

export function getBgClass(color: string | undefined | null): string {
  if (!color || !color.trim()) return fallbackColor.bg;
  return tailwindColorMap[color]?.bg ?? fallbackColor.bg;
}

export function getBgLightClass(color: string | undefined | null): string {
  if (!color || !color.trim()) return fallbackColor.bgLight;
  return tailwindColorMap[color]?.bgLight ?? fallbackColor.bgLight;
}

export function getBgHoverClass(color: string | undefined | null): string {
  if (!color || !color.trim()) return fallbackColor.bgHover;
  return tailwindColorMap[color]?.bgHover ?? fallbackColor.bgHover;
}
