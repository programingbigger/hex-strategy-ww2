/**
 * Utility functions for calculating operation dates based on month selection
 */

export interface OperationPeriod {
  startDate: string;
  endDate: string;
  monthName: string;
  season: string;
  year: number;
  month: number;
  day: number;
}

/**
 * Get operation period information for a given month
 * @param month Month number (1-12)
 * @returns Operation period with formatted dates
 */
export function getOperationPeriod(month: number, year: number = 1944, day: number = 1): OperationPeriod {
  const monthNames = [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月'
  ];
  
  const seasonNames = ['冬', '春', '夏', '秋'];
  const seasonIndex = Math.floor((month % 12) / 3);
  
  // Calculate operation dates (assuming each operation lasts about 2 weeks from the specified start date)
  const startDay = day;
  const endDay = startDay + 13; // ~2 weeks duration
  const daysInMonth = getDaysInMonth(month, year);
  
  let actualEndDay = endDay;
  let endMonth = month;
  let endYear = year;
  
  // Handle month/year overflow
  if (endDay > daysInMonth) {
    actualEndDay = endDay - daysInMonth;
    endMonth = month + 1;
    if (endMonth > 12) {
      endMonth = 1;
      endYear = year + 1;
    }
  }
  
  const startDate = `${year}年${month}月${startDay}日`;
  const endDate = `${endYear}年${endMonth}月${actualEndDay}日`;
  
  return {
    startDate,
    endDate,
    monthName: monthNames[month - 1] || '1月',
    season: seasonNames[seasonIndex],
    year,
    month,
    day: startDay
  };
}

/**
 * Get number of days in a given month
 * @param month Month number (1-12)
 * @param year Year
 * @returns Number of days in the month
 */
function getDaysInMonth(month: number, year: number): number {
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  
  // Check for leap year
  if (month === 2 && ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0)) {
    return 29;
  }
  
  return daysInMonth[month - 1] || 31;
}

/**
 * Get month names array
 */
export function getMonthNames(): string[] {
  return [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月'
  ];
}

/**
 * Get available years for operation selection
 * @returns Array of years for WW2 period
 */
export function getAvailableYears(): number[] {
  return [1942, 1943, 1944, 1945];
}

/**
 * Get available days for a given month and year
 * @param month Month number (1-12)
 * @param year Year
 * @returns Array of available days
 */
export function getAvailableDays(month: number, year: number): number[] {
  const daysInMonth = getDaysInMonth(month, year);
  return Array.from({ length: daysInMonth }, (_, i) => i + 1);
}

/**
 * Get strategic description for a month
 * @param month Month number (1-12)
 * @returns Strategic context description
 */
export function getMonthlyStrategicContext(month: number): string {
  const contexts: Record<number, string> = {
    1: '厳寒期：雪と寒さが戦術に大きく影響します',
    2: '深冬期：積雪により機動力が制限されます', 
    3: '春季：雪解けによる泥濘に注意が必要です',
    4: '春雨期：頻繁な降雨で視界と移動が困難です',
    5: '新緑期：天候は比較的安定していますが雨も多い季節です',
    6: '梅雨期：激しい雨と嵐が作戦行動を阻害します',
    7: '夏季：雷雨が多く、補給線の確保が重要です',
    8: '盛夏期：高温と突然の雷雨に備えてください',
    9: '秋雨期：台風シーズンで悪天候が予想されます',
    10: '秋季：霧が多く発生し、索敵が困難になります',
    11: '晩秋期：霧と雨で視界不良が続きます',
    12: '初冬期：降雪の可能性があり、寒さが厳しくなります'
  };
  
  return contexts[month] || '標準的な作戦環境です';
}