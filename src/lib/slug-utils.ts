/**
 * Utility functions for handling URL slugs
 */

/**
 * Generates a URL-friendly slug from a title
 */
export const generateSlugFromTitle = (title: string): string => {
  if (!title) return '';
  return title
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .substring(0, 60);
};

/**
 * Checks if a string is a valid UUID v4
 */
export const isUUID = (str: string): boolean => {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
};
