# Types and Configuration

This document provides an overview of the types and configuration in `Commander/src/types` and `Commander/src/config`.

## Types (`Commander/src/types`)

- `index.ts`: This file contains the main type definitions for the game, including:
    - `GameScreen`: Defines the different screens in the application.
    - `GameMap`: Represents a game map.
    - `Team`: Defines the teams in the game (Blue and Red).
    - `UnitType`: Defines the different types of units.
    - `Unit`: Represents a single unit on the game board.
    - `Tile`: Represents a single tile on the game board.
    - `BoardLayout`: Represents the entire game board.
    - `GameState`: Represents the overall state of the game.
    - `BattleReport`: Represents a report of a battle.
    - `Weapon`: Represents a weapon that a unit can have.
    - `WeatherType`: Defines the different types of weather.
    - `TerrainType`: Defines the different types of terrain.

- `reinforcements.ts`: This file contains type definitions related to the reinforcement system.

## Configuration (`Commander/src/config`)

- `constants.ts`: This file contains various constants used in the game, including:
    - `UNIT_STATS`: The base stats for each unit type.
    - `TERRAIN_STATS`: The stats for each terrain type, such as defense bonus and movement cost.
    - `INITIAL_UNIT_POSITIONS`: The initial positions of the units on the map.
    - `MAP_MIN_Q`, `MAP_MAX_Q`, `MAP_MIN_R`, `MAP_MAX_R`: The dimensions of the map.
    - `CITY_HP`, `CITY_HEAL_RATE`, `CAPTURE_DAMAGE_HIGH_HP`, `CAPTURE_DAMAGE_LOW_HP`: Constants related to cities and capturing.
    - `UNIT_HEAL_HP`, `UNIT_HEAL_FUEL_FULL`: Constants related to unit healing and resupply.
    - `HEX_SIZE`, `HEX_WIDTH`, `HEX_HEIGHT`: Constants related to the size of the hexagons on the game board.
