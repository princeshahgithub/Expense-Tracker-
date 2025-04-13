import { en } from './en'
import { es } from './es'

export const translations = {
  en,
  es
}

export type TranslationKey = keyof typeof en
export type NestedTranslationKeys<T> = {
  [K in keyof T]: T[K] extends object ? `${string & K}.${string & keyof T[K]}` : K
}[keyof T]

export type TranslationPath = NestedTranslationKeys<typeof en>

// Helper function to get nested translation values
export function getTranslationValue(obj: any, path: string): string {
  const keys = path.split('.')
  let result = obj
  
  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = result[key]
    } else {
      return path // Return path as fallback if translation not found
    }
  }
  
  return result
} 