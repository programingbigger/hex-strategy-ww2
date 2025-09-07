
# ResultScreen

`ResultScreen.tsx` is intended to display the results of a completed battle, such as victory or defeat, along with performance statistics.

**Note:** As of the current version, this screen appears to be using mock data and may not be fully integrated into the main game loop. The `VictoryModal` in the `BattleScreen` is used to announce the winner.

## Overview

This screen provides a summary of the player's performance after a match has concluded. It shows whether the player won or lost, how long the battle took, and other relevant stats.

## How It Works

1.  **Result Display**: It displays "VICTORY!" or "DEFEAT" based on a (currently mocked) winner.
2.  **Statistics**: It shows stats like the number of turns taken to win and the number of units lost.
3.  **Performance Rating**: It gives the player a performance rating (e.g., "Excellent", "Good", "Average") based on the battle duration.
4.  **Navigation**: It provides buttons to "Play Again" (navigating to `scenario-select`) or "Return to Menu" (navigating to `home`, which likely corresponds to the `TitleScreen`).

## Props

| Prop       | Type                        | Description                                             |
|------------|-----------------------------|---------------------------------------------------------|
| `onNavigate` | `(screen: GameScreen) => void` | Callback function to navigate to a different game screen. |

## Mock Data

The component currently uses a hardcoded `mockResult` object to display the outcome. This will need to be replaced with actual data from the `GameState` when fully implemented.

```typescript
const mockResult = {
  winner: 'Blue' as const,
  turnsToWin: 8,
  unitsLost: 1
};
```
