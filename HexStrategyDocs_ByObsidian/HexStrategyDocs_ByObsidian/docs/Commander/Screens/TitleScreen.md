
# TitleScreen

`TitleScreen.tsx` is the first screen the player sees when the game loads. It serves as the main entry point to the game.

## Overview

This screen displays the game title, a background video, and a menu with options to start the game or access other modes. It has a two-stage menu system.

## How It Works

1.  **Initial View**: The screen shows the game title and a main menu with "Mode Select", "Continue", and "Settings" buttons.
2.  **Mode Selection**: Clicking "Mode Select" expands the menu to show different game modes: "Tutorial", "Story Mode", and "Scenario Mode".
3.  **Navigation**: Clicking "Scenario Mode" triggers the `onNavigate` callback to transition to the `scenario-select` screen.
4.  **Back**: A "Back to Title" button is available to return to the initial menu.
5.  **Disabled Options**: Several options like "Continue", "Settings", "Tutorial", and "Story Mode" are currently disabled, indicating they are features for future implementation.

## Props

| Prop       | Type                        | Description                                             |
|------------|-----------------------------|---------------------------------------------------------|
| `onNavigate` | `(screen: GameScreen) => void` | Callback function to navigate to a different game screen. |

## State

| State              | Type      | Description                                  |
|--------------------|-----------|----------------------------------------------|
| `modeSelectExpanded` | `boolean` | Controls whether the mode selection menu is visible. |

## Visuals

-   **Background**: A looping background video (`game-introduction.mp4`) is played to create an immersive atmosphere.
-   **Layout**: The screen is divided into a header with the title, a central area for the video, and a footer for the menu and copyright information.
