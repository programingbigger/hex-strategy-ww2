
# ArmyUnitSelector

`ArmyUnitSelector` is a React component that provides a user interface for selecting an army unit from a specific faction. It's a modal window that allows the user to filter units by military branch and category.

## Overview

This component is used when a player needs to choose a unit to place on the map or for other game-related actions. It displays units available to a given faction, organized by branch (e.g., Army, Navy, Air Force) and then by category (e.g., Infantry, Armor, Artillery).

## How It Works

1.  **Initialization**: The component takes a `faction`, an `onUnitSelect` callback function, an `isOpen` boolean to control its visibility, and an `onClose` callback.
2.  **Branch Selection**: The user is first presented with a list of military branches available to the faction.
3.  **Category Selection**: Once a branch is selected, the component displays the unit categories within that branch. The user can select a category or view all units in the branch.
4.  **Unit Selection**: A list of unit templates is displayed based on the selected branch and category. Each unit card shows key stats like HP, attack, defense, movement, and fuel.
5.  **Callback**: When the user clicks on a unit, the `onUnitSelect` callback is triggered, passing the selected unit's template.
6.  **Closing**: The modal can be closed by clicking the close button or by an external state change.

## Props

| Prop         | Type                           | Description                                         |
|--------------|--------------------------------|-----------------------------------------------------|
| `faction`    | `Faction`                      | The faction for which to display units.             |
| `onUnitSelect` | `(template: ArmyUnitTemplate) => void` | Callback function executed when a unit is selected. |
| `isOpen`     | `boolean`                      | Controls the visibility of the modal.               |
| `onClose`    | `() => void`                   | Callback function to close the modal.               |

## State

| State              | Type                  | Description                               |
|--------------------|-----------------------|-------------------------------------------|
| `selectedBranch`   | `MilitaryBranch | null` | Stores the currently selected military branch. |
| `selectedCategory` | `UnitCategory | null`   | Stores the currently selected unit category.   |

## Usage Example

```tsx
import React, { useState } from 'react';
import { ArmyUnitSelector } from './ArmyUnitSelector';
import { Faction, ArmyUnitTemplate } from '../../types';

const MyComponent = () => {
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<ArmyUnitTemplate | null>(null);

  const handleUnitSelect = (template: ArmyUnitTemplate) => {
    setSelectedUnit(template);
    setIsSelectorOpen(false);
  };

  return (
    <div>
      <button onClick={() => setIsSelectorOpen(true)}>Select Unit</button>
      <ArmyUnitSelector
        faction={Faction.USA}
        onUnitSelect={handleUnitSelect}
        isOpen={isSelectorOpen}
        onClose={() => setIsSelectorOpen(false)}
      />
      {selectedUnit && <div>Selected: {selectedUnit.name}</div>}
    </div>
  );
};
```
