import { format, parseISO, isSunday, differenceInHours, differenceInMinutes } from 'date-fns';
import { id } from 'date-fns/locale';
import { holidays } from '../data/mockData';

/**
 * Check if a date is a holiday (Sunday or national holiday)
 */
export function isHoliday(dateString) {
  const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;

  // Check if Sunday
  if (isSunday(date)) {
    return { isHoliday: true, reason: 'Hari Minggu' };
  }

  // Check national holidays
  const dateStr = format(date, 'yyyy-MM-dd');
  const holiday = holidays.find(h => h.date === dateStr);
  if (holiday) {
    return { isHoliday: true, reason: holiday.name };
  }

  return { isHoliday: false, reason: null };
}

/**
 * Format date to Indonesian locale
 */
export function formatDateID(dateString) {
  const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
  return format(date, 'EEEE, d MMMM yyyy', { locale: id });
}

/**
 * Parse time string (HH:mm) to minutes from midnight
 */
function timeToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Calculate duration between two time strings
 * Returns hours as a decimal
 */
export function calculateDuration(startTime, endTime) {
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);

  if (endMinutes <= startMinutes) {
    return 0;
  }

  return (endMinutes - startMinutes) / 60;
}

/**
 * Calculate wage based on hours and rates
 * Implements split logic: first 8 hours at normal rate, rest at overtime rate
 */
export function calculateWage(totalHours, worker, isHolidayDay) {
  if (isHolidayDay) {
    // All hours at holiday rate
    return Math.round(totalHours * worker.rateHoliday);
  }

  if (totalHours <= 8) {
    // All normal rate
    return Math.round(totalHours * worker.rateNormal);
  }

  // Split: 8 hours normal + overtime
  const normalHours = 8;
  const overtimeHours = totalHours - 8;

  return Math.round(
    (normalHours * worker.rateNormal) +
    (overtimeHours * worker.rateOvertime)
  );
}

/**
 * Get rate description for display
 */
export function getRateDescription(worker, isHolidayDay, totalHours) {
  if (isHolidayDay) {
    return {
      type: 'holiday',
      label: 'Rate Libur',
      rate: worker.rateHoliday,
    };
  }

  if (totalHours > 8) {
    return {
      type: 'overtime',
      label: 'Rate Normal + Lembur',
      rate: `${worker.rateNormal} / ${worker.rateOvertime}`,
    };
  }

  return {
    type: 'normal',
    label: 'Rate Normal',
    rate: worker.rateNormal,
  };
}

/**
 * Allocate wage to projects based on hours proportion
 */
export function allocateToProjects(sessions, totalWage) {
  const totalHours = sessions.reduce((sum, s) => sum + s.duration, 0);

  return sessions.map(session => ({
    ...session,
    allocatedWage: Math.round((session.duration / totalHours) * totalWage)
  }));
}

/**
 * Format currency to Indonesian Rupiah
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Get day name in Indonesian
 */
export function getDayName(dateString) {
  const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
  return format(date, 'EEEE', { locale: id });
}

/**
 * Calculate days until due date
 */
export function getDaysUntilDue(dueDateString) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = parseISO(dueDateString);
  dueDate.setHours(0, 0, 0, 0);

  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Get due date status with styling info
 */
export function getDueDateStatus(dueDateString) {
  const days = getDaysUntilDue(dueDateString);

  if (days < 0) {
    return {
      label: `LEWAT ${Math.abs(days)} hari`,
      status: 'overdue',
      className: 'badge-danger'
    };
  }

  if (days === 0) {
    return {
      label: 'HARI INI',
      status: 'today',
      className: 'badge-danger'
    };
  }

  if (days <= 3) {
    return {
      label: `H-${days}`,
      status: 'urgent',
      className: 'badge-warning'
    };
  }

  return {
    label: `H-${days}`,
    status: 'normal',
    className: 'badge-primary'
  };
}

