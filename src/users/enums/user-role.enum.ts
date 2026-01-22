export enum UserRole {
  AUTHOR = 'author',
  USER = 'user',
}

// Константы для использования в Swagger (избегаем проблем с импортами на рантайме)
export const USER_ROLES = {
  AUTHOR: 'author' as const,
  USER: 'user' as const,
};