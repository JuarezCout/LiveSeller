import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return 'N/A';
  return format(new Date(date), 'MMM d, yyyy');
}

export function formatTime(date: Date | string | null | undefined): string {
  if (!date) return 'N/A';
  return format(new Date(date), 'h:mm a');
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return 'N/A';
  return format(new Date(date), 'MMM d, yyyy h:mm a');
}

export function formatTimeAgo(date: Date | string | null | undefined): string {
  if (!date) return 'N/A';
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}

export const orderStatusColors = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  confirmed: 'bg-blue-100 text-blue-800 border-blue-300',
  processing: 'bg-purple-100 text-purple-800 border-purple-300',
  shipped: 'bg-green-100 text-green-800 border-green-300',
  delivered: 'bg-green-100 text-green-800 border-green-300',
  cancelled: 'bg-red-100 text-red-800 border-red-300',
  refunded: 'bg-gray-100 text-gray-800 border-gray-300',
};

export function getStatusColors(status: string) {
  return orderStatusColors[status.toLowerCase() as keyof typeof orderStatusColors] || 'bg-gray-100 text-gray-800 border-gray-300';
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
}