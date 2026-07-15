import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | null | undefined): string {
  if (!date) return 'N/A';
  try {
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(date));
  } catch {
    return 'Invalid date';
  }
}

export function formatDateTime(date: string | null | undefined): string {
  if (!date) return 'N/A';
  try {
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  } catch {
    return 'Invalid date';
  }
}

export function formatTimeAgo(date: string | null | undefined): string {
  if (!date) return '';
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date);
}

export function getRiskColor(level: string | undefined): string {
  switch (level) {
    case 'critical': return 'text-red-500 bg-red-500/10';
    case 'high': return 'text-orange-500 bg-orange-500/10';
    case 'medium': return 'text-yellow-500 bg-yellow-500/10';
    case 'low': return 'text-green-500 bg-green-500/10';
    default: return 'text-surface-500 bg-surface-500/10';
  }
}

export function getRiskBadgeColor(level: string | undefined): string {
  switch (level) {
    case 'critical': return 'badge-danger';
    case 'high': return 'badge-warning';
    case 'medium': return 'badge-warning';
    case 'low': return 'badge-success';
    default: return 'badge-info';
  }
}

export function getRiskScoreColor(score: number | undefined): string {
  if (!score) return 'text-surface-400';
  if (score >= 0.7) return 'text-red-500';
  if (score >= 0.4) return 'text-orange-500';
  if (score >= 0.2) return 'text-yellow-500';
  return 'text-green-500';
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getPatientAgeGroup(age: number | null): string {
  if (!age) return 'Unknown';
  if (age < 1) return 'Infant';
  if (age < 12) return 'Child';
  if (age < 18) return 'Adolescent';
  if (age < 40) return 'Adult';
  if (age < 60) return 'Middle-aged';
  return 'Elderly';
}

export function truncate(str: string, length: number): string {
  if (!str) return '';
  return str.length > length ? str.slice(0, length) + '...' : str;
}

export function parseApiError(error: any): string {
  if (error?.response?.data?.detail) {
    return error.response.data.detail;
  }
  if (error?.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
