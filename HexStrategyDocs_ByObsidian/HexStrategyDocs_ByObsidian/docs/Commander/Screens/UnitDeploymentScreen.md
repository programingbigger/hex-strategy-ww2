
# UnitDeploymentScreen

`UnitDeploymentScreen.tsx` is the screen where players place their selected units on the game board before the battle begins.

## Overview

After selecting units in the `BattlePrepScreen`, the player moves to this screen to strategically place them on the map. The deployment is restricted to specific tiles, usually around a capital or designated starting area.

## How It Works

1.  **Unit List**: The screen displays the list of units selected in the previous screen.
2.  **Deployment Mode**: The player can click on a unit from the list to enter "deployment mode" for that unit.
3.  **Placing Units**: While in deployment mode, the player can click on a valid hex on the `GameBoard` to place the unit. Deployable hexes are highlighted.
4.  **Redeployment**: Players can click on an already deployed unit on the map or in the list to move it to a different valid hex.
5.  **Start Battle**: Once all units have been deployed, the "Start Battle" button becomes active. Clicking it (and confirming in a modal) will start the battle and transition to the `BattleScreen`.
6.  **Navigation**: A button is available to return to the `BattlePrepScreen` to change the unit selection.

## Props

| Prop                 | Type                               | Description                                                        |
|----------------------|------------------------------------|--------------------------------------------------------------------|
| `gameState`          | `GameState`                        | The current state of the game, including the board and selected units. |
| `onNavigate`         | `(screen: GameScreen) => void`     | Callback function to navigate to a different game screen.          |
| `onUpdateBattlePrep` | `(battlePrep: BattlePrepState) => void` | Callback to update the battle preparation state.                   |
| `onStartBattle`      | `() => void`                       | Callback to initiate the battle.                                   |

## State

| State                       | Type                                  | Description                                               |
|-----------------------------|---------------------------------------|-----------------------------------------------------------|
| `selectedUnitForDeployment` | `Unit | null`                          | The unit currently selected for placement.                |
| `deployedUnits`             | `Map<string, { x: number; y: number }>` | A map storing the coordinates of the deployed units.      |
| `hoveredUnit`               | `Unit | null`                          | The unit currently being hovered over on the board.       |
| `hoveredTerrain`            | `{terrain: string, coord: Coordinate} | null` | The terrain of the hex currently being hovered over.      |
| `showConfirmation`          | `boolean`                             | Controls the visibility of the start battle confirmation modal. |

## Key Functions

-   **`calculateDeployableTilesFromCapitals`**: A utility function that determines which tiles on the board are valid for deployment based on the team's capital locations.
-   **`canDeployUnitOnTerrain`**: Checks if a specific unit is allowed to be placed on a certain type of terrain (e.g., vehicles cannot be placed on sea or mountain tiles).
