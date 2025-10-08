import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Gerador de IDs únicos para evitar keys duplicadas
let idCounter = 0;
export function generateUniqueId(prefix: string = 'id'): string {
  idCounter++;
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `${prefix}_${timestamp}_${idCounter}_${random}`;
}

// Função para garantir que values não sejam strings vazias
export function ensureValidValue(value: string | undefined | null, fallback: string = 'default'): string {
  if (!value || value.trim() === '') {
    return fallback;
  }
  return value;
}