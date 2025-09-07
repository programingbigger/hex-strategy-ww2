
# BattlePrepScreen

`BattlePrepScreen.tsx` is where the player prepares for the upcoming battle by selecting their units.

## Overview

After selecting a scenario, the player is taken to this screen. Here, they can see the victory and defeat conditions, information about the selected map, and a list of available units to choose from for the battle.

## How It Works

1.  **Unit Roster**: The screen displays a list of `availableUnits` that the player can choose from.
2.  **Unit Selection**: The player can click on units to add them to their army for the current battle. A maximum of 10 units can be selected.
3.  **Selection Display**: The currently selected units are shown in a separate panel, along with a count of how many have been chosen.
4.  **Reset**: A "Reset Selection" button allows the player to clear their current selection.
5.  **Proceed**: Once the player is satisfied with their unit selection, they can click "Proceed to Deployment Phase". This saves the selection and navigates to the `deployment` screen.
6.  **Navigation**: The player can also navigate back to the `scenario-select` screen.

## Props

| Prop                 | Type                               | Description                                                        |
|----------------------|------------------------------------|--------------------------------------------------------------------|
| `gameState`          | `GameState`                        | The current state of the game, including the selected map.         |
| `onNavigate`         | `(screen: GameScreen) => void`     | Callback function to navigate to a different game screen.          |
| `onUpdateBattlePrep` | `(battlePrep: BattlePrepState) => void` | Callback to update the battle preparation state in the main `App` component. |

## State

| State         | Type     | Description                                      |
|---------------|----------|--------------------------------------------------|
| `selectedUnits` | `Unit[]` | An array of the units the player has selected.   |

## Data Sources

-   **`getPlayerStartingUnits()`**: A function from `../data/units` that returns the list of units available for the player to choose from.
