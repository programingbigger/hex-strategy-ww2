# Unit Production Order System

## Overview

The Unit Production Order System introduces strategic depth to the game by prioritizing Capital-based unit production based on a configurable order system.

## How It Works

### 1. Production Order Parameters

Each Capital tile on the map can have an `order` property that determines its production priority:

```json
{
  "x": -5,
  "y": 0,
  "terrain": "Capital",
  "owner": "Blue",
  "order": 1,
  "hp": 20,
  "maxHp": 20
}
```

### 2. Active Production Capital

- The system identifies the **active production capital** as the Capital with the **lowest order value** owned by each team
- Only this Capital (and those within its influence) can produce units
- When the active Capital is captured, the next lowest-order Capital becomes active

### 3. Production Rules

#### Primary Rule
Only the active production Capital (lowest order) can produce units.

#### Exception Rule
Capitals within **5 tiles** of the active production Capital can also produce units.

#### City Production
Cities within **5 tiles** of any production-capable Capital can produce units.

### 4. Dynamic Adaptation

When the active production Capital is captured:
1. The system automatically finds the next lowest-order Capital owned by the team
2. This becomes the new active production Capital
3. All production capabilities shift to the new Capital and its surrounding area

## Example Scenario

**Blue Team Capitals:**
- Capital A: `order: 1` at (-5, 0) - **Active Production Capital**
- Capital B: `order: 2` at (-1, 1) - **Can produce (within 5 tiles of A)**
- Capital C: `order: 3` at (5, 5) - **Cannot produce (too far from A)**

**If Capital A is captured:**
- Capital B becomes the new **Active Production Capital**
- Capital C may now be able to produce if within 5 tiles of B
- Production focus shifts strategically

## Implementation Files

- `src/utils/productionOrder.ts` - Core production order logic
- `src/hooks/useGameLogic/index.ts` - Integration with game logic
- `public/data/maps/test_map_1.json` - Map data with order parameters

## Key Functions

- `getActiveProductionCapital(board, team)` - Get the active Capital for a team
- `canProduceUnitsAtLocation(board, coord, team)` - Check if production is allowed at location
- `getProductionCapitals(board, team)` - Get all production-capable Capitals for a team

## Benefits

1. **Strategic Depth**: Players must protect key production Capitals
2. **Dynamic Gameplay**: Production focus shifts as the battle progresses  
3. **Territorial Control**: Capturing key Capitals disrupts enemy production
4. **Balanced Progression**: Prevents overwhelming production from all Capitals simultaneously