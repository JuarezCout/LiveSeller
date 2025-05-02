import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistance } from "date-fns";

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
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'MMMM d, yyyy');
}

export function formatTime(date: Date | string | null | undefined): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'h:mm a');
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'MMM d, yyyy h:mm a');
}

export function formatTimeAgo(date: Date | string | null | undefined): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return formatDistance(dateObj, new Date(), { addSuffix: true });
}

export function getInitials(name: string): string {
  if (!name) return '';
  
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  
  return text.slice(0, maxLength) + '...';
}

export const orderStatusColors = {
  reserved: {
    bg: 'bg-warning-500/10',
    text: 'text-warning-500',
  },
  paid: {
    bg: 'bg-success-500/10',
    text: 'text-success-500',
  },
  shipped: {
    bg: 'bg-gray-100',
    text: 'text-gray-600',
  },
  delivered: {
    bg: 'bg-primary-500/10',
    text: 'text-primary-600',
  },
  canceled: {
    bg: 'bg-danger-500/10',
    text: 'text-danger-500',
  },
};

export function getStatusColors(status: string) {
  return orderStatusColors[status as keyof typeof orderStatusColors] || 
    { bg: 'bg-gray-100', text: 'text-gray-600' };
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}
