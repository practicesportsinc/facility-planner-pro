import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`
  } else {
    return `$${value.toFixed(0)}`
  }
}

// Money clarity utilities
export const MONEY_TYPES = {
  REVENUE: 'revenue',
  COST: 'cost', 
  CAPEX: 'capex',
  NET: 'net'
} as const;

export const MONEY_PERIODS = {
  MONTHLY: '/mo',
  ANNUAL: '/yr',
  ONE_TIME: '',
  TOTAL: ''
} as const;

export function formatMoney(
  value: number, 
  type: keyof typeof MONEY_TYPES = 'NET',
  period: keyof typeof MONEY_PERIODS = 'TOTAL'
): string {
  const sign = value < 0 ? '-' : (type === 'REVENUE' ? '+' : '');
  const absValue = Math.abs(value);
  const formattedValue = formatCurrency(absValue);
  const periodText = MONEY_PERIODS[period];
  
  return `${sign}${formattedValue}${periodText}`;
}
