
import { GoogleGenAI } from '@google/genai';
import type { Unit, TerrainType } from '../types';

const API_KEY = process.env.API_KEY;

export async function generateBattleReport(
  attacker: Unit,
  defender: Unit,
  terrain: TerrainType,
  damage: number
): Promise<string> {
  if (!API_KEY) {
    console.warn("API_KEY is not set. Using default battle report.");
    return `The ${attacker.type} attacks the ${defender.type} on ${terrain} terrain, dealing ${damage} damage!`;
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  const prompt = `
    Generate a short, dramatic, narrative story for a battle in a hex strategy game.
    Do not use markdown. The story should be a single paragraph.

    Battle Details:
    - Attacking Unit: ${attacker.team} ${attacker.type} (HP: ${attacker.hp}/${attacker.maxHp})
    - Defending Unit: ${defender.team} ${defender.type} (HP: ${defender.hp}/${defender.maxHp})
    - Terrain: ${terrain}
    - Outcome: The attacker dealt ${damage} damage. The defender's remaining HP is ${Math.max(0, defender.hp - damage)}.

    Based on these details, write a thrilling story of the encounter. For example: "The blue tank rumbled through the forest, its cannon locking onto the red infantry squad. A shell exploded, sending shockwaves through the trees and inflicting heavy casualties on the defenders."
    `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-04-17',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error('Error generating battle report from Gemini:', error);
    return `An error occurred while generating the battle report. The ${attacker.type} dealt ${damage} damage to the ${defender.type}.`;
  }
}
