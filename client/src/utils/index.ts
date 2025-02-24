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