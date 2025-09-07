
# ScenarioSelectScreen

`ScenarioSelectScreen.tsx` is the screen where players can choose a scenario or map to play.

## Overview

This screen presents a grid of available maps or missions. The player can select one to proceed to the battle preparation phase.

## How It Works

1.  **Map Display**: The screen fetches a list of `availableMaps` from the `data/maps.ts` file and displays them as a grid of cards.
2.  **Card Content**: Each map card shows the map's name and a brief description.
3.  **Selection**: When the player clicks on a map card, the `onNavigate` callback is called with the `battle-prep` screen and the selected map object.
4.  **Navigation**: There is a "Back to Mode Select" button that allows the player to return to the `title` screen.

## Props

| Prop       | Type                                    | Description                                             |
|------------|-----------------------------------------|---------------------------------------------------------|
| `onNavigate` | `(screen: GameScreen, map?: GameMap) => void` | Callback function to navigate to a different game screen. |

## Data Source

-   **`availableMaps`**: An array of `GameMap` objects imported from `../data/maps`. This array contains the metadata for each playable scenario.

## Usage Example

When a user clicks on a map card for a map named "Operation Barbarossa":

```typescript
// This is what happens internally
handleMapSelect({ 
  id: 'barbarossa', 
  name: 'Operation Barbarossa', 
  description: 'The invasion of the Soviet Union.' 
});

// which calls:
onNavigate('battle-prep', { id: 'barbarossa', ... });
```
