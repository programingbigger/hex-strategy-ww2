
# BattleScreen

`BattleScreen.tsx` is the main screen where the core gameplay takes place. It integrates all the major game components to create the interactive battle environment.

## Overview

This screen is the heart of the game. It displays the game board, units, and all UI panels necessary for a player to interact with the game world. It manages the overall state of the battle, including turns, unit actions, and victory conditions.

## How It Works

1.  **Game Logic**: The screen uses the `useGameLogic` hook to manage the complex state and rules of the game.
2.  **Component Integration**: It brings together numerous child components, such as `GameBoard`, `Header`, `SelectedUnitPanel`, `InformationPanel`, and various modals, to build the complete user interface.
3.  **State Management**: It receives the global `gameState` and a `setGameState` function to read and update the game's state.
4.  **Map Loading**: When the screen loads, it fetches the appropriate map data based on the `gameState.selectedMap` and initializes the game board and units.
5.  **Event Handling**: It handles user input, such as keyboard shortcuts (`Cmd+E` for end turn, `Esc` for cancel) and passes other interactions down to the `useGameLogic` hook.
6.  **Modal Management**: It controls the visibility of all the game's modals, including the end-turn confirmation, turn change notifications, battle reports, and victory/defeat screens.

## Props

| Prop         | Type                                     | Description                                               |
|--------------|------------------------------------------|-----------------------------------------------------------|
| `gameState`  | `GameState`                              | The global state of the game.                             |
| `setGameState` | `React.Dispatch<React.SetStateAction<GameState>>` | Function to update the global game state.                 |
| `onNavigate` | `(screen: GameScreen) => void`           | Callback function to navigate to a different game screen. |

## Key Child Components

-   **`useGameLogic` (Hook)**: The engine that drives the game's rules and state changes.
-   **`GameBoard`**: Renders the hexagonal map and the units on it.
-   **`Header`**: Displays top-level information like turn number, active team, and weather.
-   **`SelectedUnitPanel`**: Shows details and available actions for the currently selected unit.
-   **`InformationPanel`**: Displays information about hovered hexes or units.
-   **`BattleLogPanel`**: Shows a running log of battle events.
-   **Modals**: A variety of modals are used for confirmations, notifications, and reports (`EndTurnConfirmModal`, `TurnChangeModal`, `BattleReportModal`, `VictoryModal`, etc.).

## State Management

The `BattleScreen` itself has a number of state variables, primarily for controlling the UI, such as the visibility of modals (`isEndTurnConfirmOpen`, `isTurnChangeModalOpen`, etc.). The core game state (units, board, turn) is managed within the `useGameLogic` hook and passed down to the necessary components.
