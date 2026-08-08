import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Role, TUser } from '@/types/api';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const isAdmin = (user: TUser) => user.role === Role.ADMIN;
export const isTechnician = (user: TUser) => user.role === Role.TECHNICIAN;
export const isUser = (user: TUser) => user.role === Role.USER;
