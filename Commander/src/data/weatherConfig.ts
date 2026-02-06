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

// 1933 Great Cold Wave - Extremely harsh winter conditions
export const WEATHER_PROBABILITIES_1933: Record<number, MonthlyWeatherProbability> = {
  1: { Clear: 15, Cloudy: 30, Fog: 0, Rain: 2,  Storm: 0,  Snow: 38, Blizzard: 15 },  // January: Extreme cold, high snow/blizzard
  2: { Clear: 18, Cloudy: 32, Fog: 0, Rain: 3,  Storm: 0,  Snow: 35, Blizzard: 12 },  // February: Continuing harsh conditions
  3: { Clear: 20, Cloudy: 35, Fog: 0, Rain: 30, Storm: 3,  Snow: 10, Blizzard: 2  },  // March: Gradual warming
  4: { Clear: 18, Cloudy: 27, Fog: 0, Rain: 51, Storm: 4,  Snow: 0,  Blizzard: 0  },  // April: Normal spring
  5: { Clear: 17, Cloudy: 25, Fog: 0, Rain: 54, Storm: 4,  Snow: 0,  Blizzard: 0  },  // May: Normal spring
  6: { Clear: 15, Cloudy: 23, Fog: 0, Rain: 44, Storm: 18, Snow: 0,  Blizzard: 0  },  // June: Normal summer
  7: { Clear: 19, Cloudy: 28, Fog: 0, Rain: 38, Storm: 15, Snow: 0,  Blizzard: 0  },  // July: Normal summer
  8: { Clear: 21, Cloudy: 31, Fog: 0, Rain: 35, Storm: 13, Snow: 0,  Blizzard: 0  },  // August: Normal summer
  9: { Clear: 17, Cloudy: 26, Fog: 0, Rain: 41, Storm: 16, Snow: 0,  Blizzard: 0  },  // September: Normal fall
  10:{ Clear: 18, Cloudy: 27, Fog: 0, Rain: 51, Storm: 4,  Snow: 0,  Blizzard: 0  },  // October: Normal fall
  11:{ Clear: 21, Cloudy: 31, Fog: 0, Rain: 45, Storm: 3,  Snow: 0,  Blizzard: 0  },  // November: Normal fall
  12:{ Clear: 25, Cloudy: 38, Fog: 0, Rain: 12, Storm: 1,  Snow: 18, Blizzard: 6  }   // December: Cold winter begins
};

// 1939 - Continuation of cold wave conditions
export const WEATHER_PROBABILITIES_1939: Record<number, MonthlyWeatherProbability> = {
  1: { Clear: 20, Cloudy: 35, Fog: 0, Rain: 3,  Storm: 0,  Snow: 32, Blizzard: 10 },  // January: Very cold, high snow
  2: { Clear: 22, Cloudy: 36, Fog: 0, Rain: 3,  Storm: 0,  Snow: 30, Blizzard: 9  },  // February: Very cold, high snow
  3: { Clear: 23, Cloudy: 36, Fog: 0, Rain: 32, Storm: 4,  Snow: 5,  Blizzard: 0  },  // March: Gradual warming
  4: { Clear: 18, Cloudy: 27, Fog: 0, Rain: 51, Storm: 4,  Snow: 0,  Blizzard: 0  },  // April: Normal spring
  5: { Clear: 17, Cloudy: 25, Fog: 0, Rain: 54, Storm: 4,  Snow: 0,  Blizzard: 0  },  // May: Normal spring
  6: { Clear: 15, Cloudy: 23, Fog: 0, Rain: 44, Storm: 18, Snow: 0,  Blizzard: 0  },  // June: Normal summer
  7: { Clear: 19, Cloudy: 28, Fog: 0, Rain: 38, Storm: 15, Snow: 0,  Blizzard: 0  },  // July: Normal summer
  8: { Clear: 21, Cloudy: 31, Fog: 0, Rain: 35, Storm: 13, Snow: 0,  Blizzard: 0  },  // August: Normal summer
  9: { Clear: 17, Cloudy: 26, Fog: 0, Rain: 41, Storm: 16, Snow: 0,  Blizzard: 0  },  // September: Normal fall
  10:{ Clear: 18, Cloudy: 27, Fog: 0, Rain: 51, Storm: 4,  Snow: 0,  Blizzard: 0  },  // October: Normal fall
  11:{ Clear: 21, Cloudy: 31, Fog: 0, Rain: 45, Storm: 3,  Snow: 0,  Blizzard: 0  },  // November: Normal fall
  12:{ Clear: 26, Cloudy: 40, Fog: 0, Rain: 13, Storm: 1,  Snow: 16, Blizzard: 4  }   // December: Cold winter
};

// 1940 - Gradual reduction of snow probability from April to June
export const WEATHER_PROBABILITIES_1940: Record<number, MonthlyWeatherProbability> = {
  1: { Clear: 20, Cloudy: 35, Fog: 0, Rain: 3,  Storm: 0,  Snow: 32, Blizzard: 10 },  // January: Cold winter continues
  2: { Clear: 22, Cloudy: 36, Fog: 0, Rain: 3,  Storm: 0,  Snow: 30, Blizzard: 9  },  // February: Cold winter continues
  3: { Clear: 23, Cloudy: 36, Fog: 0, Rain: 32, Storm: 4,  Snow: 5,  Blizzard: 0  },  // March: Spring begins
  4: { Clear: 15, Cloudy: 25, Fog: 0, Rain: 38, Storm: 3,  Snow: 16, Blizzard: 3  },  // April: High snow probability
  5: { Clear: 16, Cloudy: 24, Fog: 0, Rain: 45, Storm: 4,  Snow: 10, Blizzard: 1  },  // May: Medium snow probability
  6: { Clear: 10, Cloudy: 15, Fog: 0, Rain: 18, Storm: 7, Snow: 35, Blizzard: 15  },  // June: ~50% snow-related weather (Snow+Blizzard=50%)
  7: { Clear: 19, Cloudy: 28, Fog: 0, Rain: 38, Storm: 15, Snow: 0,  Blizzard: 0  },  // July: Normal summer
  8: { Clear: 21, Cloudy: 31, Fog: 0, Rain: 35, Storm: 13, Snow: 0,  Blizzard: 0  },  // August: Normal summer
  9: { Clear: 17, Cloudy: 26, Fog: 0, Rain: 41, Storm: 16, Snow: 0,  Blizzard: 0  },  // September: Normal fall
  10:{ Clear: 18, Cloudy: 27, Fog: 0, Rain: 51, Storm: 4,  Snow: 0,  Blizzard: 0  },  // October: Normal fall
  11:{ Clear: 21, Cloudy: 31, Fog: 0, Rain: 45, Storm: 3,  Snow: 0,  Blizzard: 0  },  // November: Normal fall
  12:{ Clear: 26, Cloudy: 40, Fog: 0, Rain: 13, Storm: 1,  Snow: 16, Blizzard: 4  }   // December: Cold winter
};

/**
 * Gets the weather probability configuration for a given month and year
 * @param month Month of the year (1-12)
 * @param year Year (e.g., 1933, 1939, 1940)
 * @returns Weather probability configuration for the month and year
 */
export function getWeatherProbabilitiesByYear(month: number, year: number): MonthlyWeatherProbability {
  // Clamp month to valid range
  const validMonth = Math.max(1, Math.min(12, month));

  // Select weather table based on year
  if (year === 1933) {
    return WEATHER_PROBABILITIES_1933[validMonth];
  } else if (year === 1939) {
    return WEATHER_PROBABILITIES_1939[validMonth];
  } else if (year === 1940) {
    return WEATHER_PROBABILITIES_1940[validMonth];
  }

  // Default to standard probabilities for other years
  return MONTHLY_WEATHER_PROBABILITIES[validMonth];
}

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