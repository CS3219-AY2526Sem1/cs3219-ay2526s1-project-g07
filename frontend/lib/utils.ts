import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Shadcn utility helper function
 * See: https://ui.shadcn.com/docs/installation/manual#add-a-cn-helper
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
