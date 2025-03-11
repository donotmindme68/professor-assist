import {type ClassValue, clsx} from 'clsx';
import {twMerge} from 'tailwind-merge';
import {User} from "../../../types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getUser(): User | null {
  const userJSON = localStorage.getItem('user')
  return userJSON && JSON.parse(userJSON);
}

export function generateRandomString(length: number) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}