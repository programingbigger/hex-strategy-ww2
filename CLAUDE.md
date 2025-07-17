# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a World War II-themed hexagonal strategy game called "Commander" with multiple implementations exploring different approaches and features. The repository contains three main project variants:

- **Commander/** - Main React application (Create React App) - Primary development target
- **gemini-saga_-hex-strategy/** - Vite-based variant with Gemini AI integration  
- **ww2-strategy-command/** - Alternative Vite-based implementation

## Development Commands

### Commander (Main Application)
```bash
cd Commander
npm start          # Development server
npm run build      # Production build
npm test           # Run tests
```

### Gemini Saga Variant
```bash
cd gemini-saga_-hex-strategy
npm run dev        # Vite development server
npm run build      # Production build
npm run preview    # Preview production build
```

### WW2 Strategy Command
```bash
cd ww2-strategy-command
npm run dev        # Vite development server
npm run build      # Production build
```

## Code Architecture

### Core File Structure (Commander/src/)
```
src/
├── App.tsx                    # Central state router with screen navigation
├── hooks/
│   ├── useGameLogic.ts       # Core game logic (451 lines, 12 state hooks)
│   └── useCamera.ts          # Camera controls and zoom management
├── components/game/
│   ├── GameBoard.tsx         # SVG hex grid renderer with viewport optimization
│   ├── Hexagon.tsx          # Individual hex tiles with terrain/unit rendering
│   ├── InformationPanel.tsx # Unit/terrain details with action buttons
│   ├── Header.tsx           # Turn/weather display
│   └── BattleReportModal.tsx # Combat results modal
├── screens/                  # Screen-level components for app flow
├── types/index.ts           # Comprehensive TypeScript definitions
├── config/constants.ts      # Game balance and unit/terrain configuration
├── utils/map.ts            # Hex coordinate math and pathfinding
└── data/                   # Static game data and map definitions
```

### Game State Management
- **App.tsx**: Central state management with screen-based navigation (Title → Home → Scenario Select → Battle Prep → Battle → Result)
- **useGameLogic.ts**: Core game logic hook with 12 useState hooks managing game state, useMemo for performance optimization, and complex turn transition logic
- **State Flow**: Blue team → Red team turns with automatic win condition checking
- **Immutable Updates**: All state changes use spread operators for React compatibility
- **History System**: Snapshot system for undo functionality

### Data Structures

#### Core Types (types/index.ts)
- **Unit**: 19 properties including position, stats, status flags, combat modifiers, and experience
- **Tile**: Terrain-based map cells with optional ownership and HP for cities
- **BoardLayout**: Map<string, Tile> using coordinate strings ("x,y") as keys for performance
- **GameState**: Root application state with screen navigation and complete game data
- **MapData**: JSON serialization format for save/load functionality

#### Coordinate System
- **Axial Coordinates**: (x, y) system optimized for hexagonal grids
- **String Keys**: Coordinates converted to "x,y" strings for efficient Map lookups
- **Bounds**: Q(-12 to 12), R(-10 to 10) for standard map size
- **Pixel Conversion**: `axialToPixel()` transforms for SVG rendering

### Core Game Systems

#### Combat System
**Formula**: `damage = Math.max(1, attackPower - defensePower)`
- **Attack Power**: Base attack + terrain bonus + unit class modifiers (attackVs)
- **Defense Power**: Base defense + terrain bonus + unit class modifiers (defenseVs)
- **Special Rules**: Artillery ignores terrain defense bonuses
- **Counter-Attack**: Automatic retaliation unless attacker is Artillery
- **Experience**: XP = damage dealt, capped at 100
- **Unit Class Bonuses**: Infantry vs Vehicle effectiveness modifiers

#### Movement System  
- **Hex-based Pathfinding**: A* algorithm implementation with terrain cost calculation
- **Zone of Control (ZOC)**: Enemy units add +2 movement cost to adjacent hexes
- **Fuel Consumption**: Movement costs fuel, cities provide resupply
- **Terrain Restrictions**: Mountains/Rivers block vehicle movement (Infinity cost)
- **Path Visualization**: Real-time movement range and path display

#### Map System
- **JSON Format**: Structured map definitions with gameStatus, board, and units sections
- **Weather System**: Rain converts Plains ↔ Mud with movement cost changes
- **City Mechanics**: 10 HP cities provide healing (2 HP/turn) and resupply
- **Capture System**: Infantry-only capture based on unit HP vs city HP

### Unit Configuration
Units are defined in `config/constants.ts` with stats:
- Infantry: HP 10, Attack 4, Defense 2, Movement 3, Range 1
- Tank: HP 20, Attack 7, Defense 5, Movement 4, Range 1
- ArmoredCar: HP 15, Attack 5, Defense 4, Movement 6, Range 1
- AntiTank: HP 10, Attack 8, Defense 6, Movement 1, Range 1
- Artillery: HP 12, Attack 8, Defense 3, Movement 1, Range 2-5

### Terrain Effects
- **Plains**: Neutral (converts to Mud in rain)
- **Forest**: +2 Defense, higher vehicle movement cost
- **Mountain**: +3 Defense, +2 Attack, vehicles cannot enter
- **River**: -2 Defense, -1 Attack, vehicles cannot enter
- **City**: +3 Defense, +1 Attack, provides healing/resupply
- **Road/Bridge**: -1 Defense, faster movement
- **Mud**: -1 Defense, increased movement costs

## Key Components

### Screen Components (`screens/`)
- Navigation between game phases
- State management for each screen's specific data
- Consistent UI patterns across screens

### Game Components (`components/game/`)
- **GameBoard.tsx**: Main rendering logic for hex grid
- **Hexagon.tsx**: Individual hex tile with terrain and unit rendering
- **InformationPanel.tsx**: Unit/tile details display
- **BattleReportModal.tsx**: Combat results presentation

### Utility Functions
- **pathfinding.ts**: A* implementation for movement
- **gameUtils.ts**: Combat calculations and game state helpers
- **mapUtils.ts**: Map data manipulation and validation

## Current Development Focus

Based on `prompt.txt`, the team is implementing detection/reconnaissance mechanics:
- Line-of-sight calculations
- Fog of war system
- Unit-specific detection ranges
- Terrain-based visibility modifiers

## Branch Strategy
- **main**: Production-ready code
- **dev**: Staging environment  
- **feature**: Active development (current working branch)

## Documentation

Extensive Japanese documentation in `/docs/`:
- `仕様書.md` - Game specifications
- `機能定義書.md` - Technical feature definitions
- `画面仕様書.md` - UI specifications

## Testing

When making changes:
1. Test unit movement and combat mechanics
2. Verify terrain effects are properly applied
3. Check turn transitions and win conditions
4. Ensure UI state updates correctly

## Code Conventions

- TypeScript with strict type checking
- React functional components with hooks
- CSS modules for styling
- Centralized constants and configuration
- Modular component architecture with clear separation of concerns

## Memory Tracking

- より詳細に記述して: Request to add more detailed descriptions to the project documentation