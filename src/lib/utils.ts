import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function stripHtml(html: string): string {
  if (!html) return '';
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
}

/**
 * Converts experience level values to human-readable categories
 * Supports both raw Spanish values and numeric ranges
 */
export function getExperienceLevelLabel(level: string | null | undefined): string {
  if (!level) return 'Sin especificar';
  
  const normalizedLevel = level.toLowerCase().trim();
  
  // Map Spanish values to categories
  const levelMap: Record<string, string> = {
    'principiante': 'Junior',
    'junior': 'Junior',
    'intermedio': 'Mid',
    'mid': 'Mid',
    'mid-level': 'Mid',
    'mid_level': 'Mid',
    'avanzado': 'Senior',
    'senior': 'Senior',
    'experto': 'Lead',
    'expert': 'Lead',
    'lead': 'Lead',
  };

  // Check direct mapping first
  if (levelMap[normalizedLevel]) {
    return levelMap[normalizedLevel];
  }

  // Check for numeric ranges
  if (normalizedLevel.includes('0-1') || normalizedLevel.includes('0-2')) {
    return 'Junior';
  }
  if (normalizedLevel.includes('1-3') || normalizedLevel.includes('3-5')) {
    return 'Mid';
  }
  if (normalizedLevel.includes('3-6') || normalizedLevel.includes('6-10')) {
    return 'Senior';
  }
  if (normalizedLevel.includes('6+') || normalizedLevel.includes('10+') || normalizedLevel.includes('15+')) {
    return 'Lead';
  }

  // Return original if no match
  return level;
}
