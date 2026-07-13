/**
 * Utility untuk merge className dengan tailwind-merge
 * Menghindari konflik antar utility classes Tailwind.
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
