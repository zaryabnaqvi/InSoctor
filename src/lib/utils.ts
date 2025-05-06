import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format } from 'date-fns';
import { AlertSeverity } from './alerts-data';
// import { AlertSeverity } from '@/types/alert';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date): string {
  return format(date, 'yyyy-MM-dd HH:mm:ss');
}

export function formatShortDate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function formatTime(date: Date): string {
  return format(date, 'HH:mm:ss');
}

export function getSeverityColor(severity: AlertSeverity): string {
  switch (severity) {
    case 'critical':
      return 'bg-red-500';
    case 'high':
      return 'bg-orange-500';
    case 'medium':
      return 'bg-yellow-500';
    case 'low':
      return 'bg-blue-400';
    case 'info':
      return 'bg-gray-400';
    default:
      return 'bg-gray-400';
  }
}

export function getScoreColor(score: number): string {
  if (score >= 90) return 'bg-red-500 text-white';
  if (score >= 70) return 'bg-orange-500 text-white';
  if (score >= 50) return 'bg-yellow-500 text-black';
  if (score >= 30) return 'bg-blue-400 text-white';
  return 'bg-gray-400 text-white';
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'open':
      return 'bg-red-900/20 text-red-400 border-red-900/50';
    case 'investigating':
      return 'bg-yellow-900/20 text-yellow-400 border-yellow-900/50';
    case 'resolved':
      return 'bg-green-900/20 text-green-400 border-green-900/50';
    case 'false-positive':
      return 'bg-blue-900/20 text-blue-400 border-blue-900/50';
    default:
      return 'bg-gray-900/20 text-gray-400 border-gray-900/50';
  }
}

export function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}