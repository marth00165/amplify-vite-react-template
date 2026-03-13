// Food Challenge Theme - Exact color palette and design system from requirements
export const foodChallengeTheme = {
  colors: {
    primary: '#e30500', // Red - primary accent
    secondary: '#c15a09', // Orange - secondary accent
    tertiary: '#eec97d', // Light gold
    background: '#f2d59a', // Cream background
    white: '#ffffff',

    // Semantic colors
    success: '#c15a09',
    warning: '#eec97d',
    error: '#e30500',
    info: '#f2d59a',

    // Text colors
    textPrimary: '#333333',
    textSecondary: '#666666',
    textLight: '#999999',

    // Border and divider colors
    border: '#e0e0e0',
    divider: '#f0f0f0',

    // Light versions for backgrounds
    primaryLight: '#fff0f0',
    secondaryLight: '#fff5eb',
    errorLight: '#fff0f0',
  },

  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem',
  },

  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
  },

  typography: {
    h1: {
      fontSize: '2rem',
      fontWeight: 'bold',
      lineHeight: '2.5rem',
    },
    h2: {
      fontSize: '1.5rem',
      fontWeight: '600',
      lineHeight: '2rem',
    },
    h3: {
      fontSize: '1.25rem',
      fontWeight: '600',
      lineHeight: '1.75rem',
    },
    body: {
      fontSize: '1rem',
      lineHeight: '1.5rem',
    },
    caption: {
      fontSize: '0.875rem',
      lineHeight: '1.25rem',
    },
  },

  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  },

  layout: {
    maxWidth: '1200px',
    containerPadding: '1rem',
  },
};

const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export const isDateOnlyString = (value: string): boolean =>
  DATE_ONLY_PATTERN.test(value);

export const parseFoodChallengeDate = (date: string | Date): Date => {
  if (date instanceof Date) {
    return new Date(date);
  }

  const match = DATE_ONLY_PATTERN.exec(date);
  if (match) {
    const [, year, month, day] = match;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  return new Date(date);
};

export const toLocalDateInputValue = (date: string | Date = new Date()): string => {
  const localDate = parseFoodChallengeDate(date);
  const year = localDate.getFullYear();
  const month = String(localDate.getMonth() + 1).padStart(2, '0');
  const day = String(localDate.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export const formatLogDateTime = (date: string | Date): string => {
  const parsedDate = parseFoodChallengeDate(date);

  if (typeof date === 'string' && isDateOnlyString(date)) {
    return parsedDate.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year:
        parsedDate.getFullYear() !== new Date().getFullYear()
          ? 'numeric'
          : undefined,
    });
  }

  return parsedDate.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    year:
      parsedDate.getFullYear() !== new Date().getFullYear()
        ? 'numeric'
        : undefined,
  });
};

// Helper functions for unit conversions and calculations
export const convertToBaseUnits = (
  quantity: number,
  unit: string,
  conversions: Record<string, number>
): number => {
  const conversionFactor = conversions[unit];
  if (conversionFactor === undefined) {
    throw new Error(`Unknown unit: ${unit}`);
  }
  return quantity * conversionFactor;
};

export const calculateTotalUnits = (
  consumptionLogs: Array<{ quantity: number; unit: string; foodItem?: { conversions: Record<string, number> } }>
): number => {
  return consumptionLogs.reduce((total, log) => {
    if (log.foodItem?.conversions) {
      return total + convertToBaseUnits(log.quantity, log.unit, log.foodItem.conversions);
    }
    return total;
  }, 0);
};

export const calculateProgress = (consumed: number, goal: number): number => {
  if (goal <= 0) return 0;
  return (consumed / goal) * 100;
};

export const calculateRemaining = (consumed: number, goal: number): number => {
  return Math.max(0, goal - consumed);
};

export const calculateDaysRemaining = (endDate: string): number => {
  const end = new Date(endDate);
  const now = new Date();
  const diffTime = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};

export const formatDate = (date: string | Date): string => {
  const d = parseFoodChallengeDate(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatPercentage = (percentage: number): string => {
  return `${Math.round(percentage)}%`;
};

// Validation helpers - ensure data integrity
export const validateTracker = (tracker: {
  name: string;
  goal: number;
  startDate: string;
  endDate: string;
}) => {
  const errors: string[] = [];

  if (!tracker.name.trim()) {
    errors.push('Tracker name is required');
  }

  if (tracker.goal <= 0) {
    errors.push('Goal must be greater than 0');
  }

  const start = new Date(tracker.startDate);
  const end = new Date(tracker.endDate);

  if (start >= end) {
    errors.push('End date must be after start date');
  }

  return errors;
};

export const isTrackerActive = (
  startDate: string,
  endDate: string,
): boolean => {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  return now >= start && now <= end;
};

export const isTrackerExpired = (endDate: string): boolean => {
  const now = new Date();
  const end = new Date(endDate);

  return now > end;
};
