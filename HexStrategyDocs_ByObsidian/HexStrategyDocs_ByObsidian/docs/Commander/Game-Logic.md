# Game-Logic

This document provides an overview of the core game logic hooks in `Commander/src/hooks/useGameLogic`.

## File Index

- `armyManagement.ts`: Handles army-related logic, such as creating and managing units.
- `battleSystem.ts`: Manages the battle system, including attack and damage calculations.
- `engineerActions.ts`: Handles actions specific to engineer units, like building bridges.
- `gameState.ts`: Manages the overall game state, including turn, team, and weather.
- `index.ts`: The main entry point for the `useGameLogic` hook, which combines all other hooks.
- `reinforcements.ts`: Manages the reinforcement system.
- `transportActions.ts`: Handles actions specific to transport units, like loading and unloading.
- `turnManagement.ts`: Manages the turn-based system, including ending turns and checking for win conditions.
- `uiStates.ts`: Manages UI-related states, such as modals and panels.
- `unitActions.ts`: Handles general unit actions, like waiting, undoing, and capturing.
