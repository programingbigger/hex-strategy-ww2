import { WeatherType } from '../types';

export interface MonthlyWeatherProbability {
  Clear: number;
  Cloudy: number;
  Fog: number;     // Always 0 for now as requested
  Rain: number;    // Includes original fog percentages
  Storm: number;
  Snow: number;
  Blizzard: number;
}

// Monthly weather probabilities with fog percentages added to rain
export const MONTHLY_WEATHER_PROBABILITIES: Record<number, MonthlyWeatherProbability> = {
  1: { Clear: 30, Cloudy: 46, Fog: 0, Rain: 4,  Storm: 0,  Snow: 18, Blizzard: 2 },  // January: 4% fog added to rain (0+4=4)
  2: { Clear: 29, Cloudy: 43, Fog: 0, Rain: 4,  Storm: 0,  Snow: 22, Blizzard: 2 },  // February: 4% fog added to rain (0+4=4)
  3: { Clear: 25, Cloudy: 37, Fog: 0, Rain: 34, Storm: 4,  Snow: 0,  Blizzard: 0 },  // March: 3% fog added to rain (31+3=34)
  4: { Clear: 18, Cloudy: 27, Fog: 0, Rain: 51, Storm: 4,  Snow: 0,  Blizzard: 0 },  // April: 15% fog added to rain (36+15=51)
  5: { Clear: 17, Cloudy: 25, Fog: 0, Rain: 54, Storm: 4,  Snow: 0,  Blizzard: 0 },  // May: 14% fog added to rain (40+14=54)
  6: { Clear: 15, Cloudy: 23, Fog: 0, Rain: 44, Storm: 18, Snow: 0,  Blizzard: 0 },  // June: 2% fog added to rain (42+2=44)
  7: { Clear: 19, Cloudy: 28, Fog: 0, Rain: 38, Storm: 15, Snow: 0,  Blizzard: 0 },  // July: 3% fog added to rain (35+3=38)
  8: { Clear: 21, Cloudy: 31, Fog: 0, Rain: 35, Storm: 13, Snow: 0,  Blizzard: 0 },  // August: 3% fog added to rain (32+3=35)
  9: { Clear: 17, Cloudy: 26, Fog: 0, Rain: 41, Storm: 16, Snow: 0,  Blizzard: 0 },  // September: 2% fog added to rain (39+2=41)
  10:{ Clear: 18, Cloudy: 27, Fog: 0, Rain: 51, Storm: 4,  Snow: 0,  Blizzard: 0 },  // October: 15% fog added to rain (36+15=51)
  11:{ Clear: 21, Cloudy: 31, Fog: 0, Rain: 45, Storm: 3,  Snow: 0,  Blizzard: 0 },  // November: 18% fog added to rain (27+18=45)
  12:{ Clear: 29, Cloudy: 43, Fog: 0, Rain: 15, Storm: 1,  Snow: 11, Blizzard: 1 }   // December: 4% fog added to rain (11+4=15)
};

/**
 * Gets the weather probability configuration for a given month
 * @param month Month of the year (1-12)
 * @returns Weather probability configuration for the month
 */
export function getMonthlyWeatherProbabilities(month: number): MonthlyWeatherProbability {
  // Clamp month to valid range
  const validMonth = Math.max(1, Math.min(12, month));
  return MONTHLY_WEATHER_PROBABILITIES[validMonth];
}

/**
 * Generates weather based on monthly probabilities
 * @param month Current month (1-12)
 * @returns Random weather type based on monthly probabilities
 */
export function generateWeatherForMonth(month: number): WeatherType {
  const probabilities = getMonthlyWeatherProbabilities(month);
  
  // Create cumulative probability array
  const cumulativeProbabilities: { weather: WeatherType; cumulative: number }[] = [];
  let cumulative = 0;
  
  for (const [weather, probability] of Object.entries(probabilities)) {
    cumulative += probability;
    cumulativeProbabilities.push({ 
      weather: weather as WeatherType, 
      cumulative 
    });
  }
  
  // Generate random number from 0 to 100
  const randomValue = Math.random() * 100;
  
  // Find the weather type that corresponds to the random value
  for (const { weather, cumulative: cumulativeValue } of cumulativeProbabilities) {
    if (randomValue <= cumulativeValue) {
      return weather;
    }
  }
  
  // Fallback to Clear weather (should never reach here)
  return 'Clear';
}

/**
 * Gets the current month from turn number
 * Assumes 4 turns per month, starting from January (month 1) on turn 1
 * @param turn Current turn number
 * @returns Month of the year (1-12)
 */
export function getMonthFromTurn(turn: number): number {
  // 4 turns per month, cycle through 12 months
  const monthIndex = Math.floor((turn - 1) / 4) % 12;
  return monthIndex + 1;
}

/**
 * Gets the season name from month
 * @param month Month of the year (1-12)
 * @returns Season name in Japanese
 */
export function getSeasonFromMonth(month: number): string {
  if (month >= 3 && month <= 5) return '春'; // Spring
  if (month >= 6 && month <= 8) return '夏'; // Summer
  if (month >= 9 && month <= 11) return '秋'; // Fall
  return '冬'; // Winter
}