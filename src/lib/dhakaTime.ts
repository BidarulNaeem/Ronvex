/**
 * RONVEX Asia/Dhaka Timezone & Wednesday Payout Schedule Utilities
 * 
 * Timezone: Asia/Dhaka (UTC+6, Bangladesh Standard Time)
 * Payout Day: Wednesday (day index 3)
 * Default Cutoff: Tuesday 23:59:59 BST (day index 2)
 */

export interface DhakaDateTime {
  year: number;
  month: number; // 1-12
  date: number;  // 1-31
  dayOfWeek: number; // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  hour: number;  // 0-23
  minute: number; // 0-59
  second: number; // 0-59
  isoString: string;
  formattedDateTime: string;
}

/**
 * Returns the current date/time decomposed in Asia/Dhaka timezone
 */
export function getDhakaDateTime(inputDate: Date | string | number = new Date()): DhakaDateTime {
  const d = typeof inputDate === 'object' ? inputDate : new Date(inputDate);
  
  // Format parts using standard Intl.DateTimeFormat for Asia/Dhaka
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Dhaka',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    weekday: 'short',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
  });

  const parts = formatter.formatToParts(d);
  const partMap: Record<string, string> = {};
  parts.forEach(p => {
    partMap[p.type] = p.value;
  });

  const year = parseInt(partMap.year, 10);
  const month = parseInt(partMap.month, 10);
  const date = parseInt(partMap.day, 10);
  let hour = parseInt(partMap.hour, 10);
  if (hour === 24) hour = 0;
  const minute = parseInt(partMap.minute, 10);
  const second = parseInt(partMap.second, 10);

  // Compute day of week index (0=Sun, 1=Mon, ..., 6=Sat) in Dhaka
  const weekdayShort = partMap.weekday;
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayOfWeek = Math.max(0, days.indexOf(weekdayShort));

  // Construct readable string
  const pad = (n: number) => n.toString().padStart(2, '0');
  const isoFormatted = `${year}-${pad(month)}-${pad(date)}T${pad(hour)}:${pad(minute)}:${pad(second)}+06:00`;
  const readable = `${pad(date)}/${pad(month)}/${year} ${pad(hour)}:${pad(minute)}:${pad(second)} BST`;

  return {
    year,
    month,
    date,
    dayOfWeek,
    hour,
    minute,
    second,
    isoString: isoFormatted,
    formattedDateTime: readable,
  };
}

/**
 * Calculates target Wednesday payout date and cutoff eligibility in Asia/Dhaka
 *
 * Rules:
 * - If current Dhaka time is on or before cutoff (default Tuesday 23:59:59),
 *   the request is eligible for THIS week's Wednesday payout batch.
 * - If current Dhaka time is after the cutoff (or on Wednesday/Thursday/Friday/Saturday),
 *   it is assigned to the NEXT week's Wednesday batch.
 */
export function calculateWednesdayBatch(
  submissionTime: Date | string | number = new Date(),
  config = {
    cutoffDayOfWeek: 2, // Tuesday
    cutoffHour: 23,
    cutoffMinute: 59,
    payoutDayOfWeek: 3, // Wednesday
  }
) {
  const dhaka = getDhakaDateTime(submissionTime);
  const { dayOfWeek, hour, minute } = dhaka;

  // Check if current time in Dhaka is before or at Tuesday 23:59:59
  let isBeforeCutoffForThisWeek = false;

  if (dayOfWeek < config.cutoffDayOfWeek) {
    // Sunday (0) or Monday (1)
    isBeforeCutoffForThisWeek = true;
  } else if (dayOfWeek === config.cutoffDayOfWeek) {
    // Tuesday: check hour and minute
    if (hour < config.cutoffHour) {
      isBeforeCutoffForThisWeek = true;
    } else if (hour === config.cutoffHour && minute <= config.cutoffMinute) {
      isBeforeCutoffForThisWeek = true;
    } else {
      isBeforeCutoffForThisWeek = false;
    }
  } else {
    // Wednesday (3), Thursday (4), Friday (5), Saturday (6)
    isBeforeCutoffForThisWeek = false;
  }

  // Calculate days until target Wednesday
  // Wednesday is day 3
  let daysToTargetWednesday = 0;

  if (isBeforeCutoffForThisWeek) {
    // Target is Wednesday of this current week
    daysToTargetWednesday = (config.payoutDayOfWeek - dayOfWeek + 7) % 7;
    if (daysToTargetWednesday === 0) daysToTargetWednesday = 7;
  } else {
    // Target is Wednesday of next week
    const daysUntilThisWed = (config.payoutDayOfWeek - dayOfWeek + 7) % 7;
    daysToTargetWednesday = daysUntilThisWed === 0 ? 7 : daysUntilThisWed + 7;
  }

  // Calculate the target Wednesday calendar date in Asia/Dhaka
  const baseDate = new Date(submissionTime);
  const targetDateObj = new Date(baseDate.getTime() + daysToTargetWednesday * 86400000);
  const targetDhaka = getDhakaDateTime(targetDateObj);

  const pad = (n: number) => n.toString().padStart(2, '0');
  const targetBatchStr = `${targetDhaka.year}-${pad(targetDhaka.month)}-${pad(targetDhaka.date)}`;

  // Human readable batch label: "Wednesday, October 28, 2026"
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const humanReadableBatch = `Wednesday, ${monthNames[targetDhaka.month - 1]} ${targetDhaka.date}, ${targetDhaka.year}`;

  // Cutoff explanation
  const cutoffDayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][config.cutoffDayOfWeek];
  const cutoffTimeStr = `${pad(config.cutoffHour)}:${pad(config.cutoffMinute)} BST`;
  const cutoffFormatted = `Every ${cutoffDayName} at ${cutoffTimeStr} (Asia/Dhaka)`;

  return {
    targetWednesdayBatch: targetBatchStr,
    humanReadableBatch,
    isCutoffEligible: isBeforeCutoffForThisWeek,
    daysRemaining: daysToTargetWednesday,
    cutoffFormatted,
    submissionDhakaTime: dhaka.formattedDateTime,
    timezone: 'Asia/Dhaka (UTC+6)',
  };
}

/**
 * Format BDT currency amounts with commas and ৳ symbol
 */
export function formatBDT(amount: number): string {
  return `৳${Number(amount || 0).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

/**
 * Mask sensitive payment account numbers
 * e.g. bKash "01712345678" -> "017****5678"
 * Bank "102938475612" -> "**** **** 5612"
 */
export function maskAccountNumber(acc: string, type: 'mfs' | 'bank' = 'mfs'): string {
  if (!acc) return '';
  const clean = acc.trim();
  if (type === 'mfs') {
    if (clean.length < 8) return '****' + clean.slice(-3);
    return clean.slice(0, 3) + '****' + clean.slice(-4);
  } else {
    if (clean.length < 6) return '****' + clean.slice(-2);
    return '•••• •••• ' + clean.slice(-4);
  }
}
