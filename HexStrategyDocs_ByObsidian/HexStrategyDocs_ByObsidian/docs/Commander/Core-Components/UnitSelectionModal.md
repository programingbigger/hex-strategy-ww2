
# UnitSelectionModal

`UnitSelectionModal` is a React component used for selecting a unit from a list of units loaded inside a transport unit. It is designed to allow a player to choose which unit to disembark.

## Overview

When a player wants to unload a unit from a transport (like a troop transport ship or a truck), this modal appears. It lists all the units currently inside the transport and lets the player pick one to perform an action with, such as unloading it onto an adjacent hex.

## How It Works

1.  **Visibility**: The modal becomes visible when the `isOpen` prop is true and there are units to select.
2.  **Unit Display**: It displays a list of all `loadedUnits`, showing their name, HP, fuel, and team.
3.  **Selection**: The player can click on a unit to select it. The selected unit is highlighted.
4.  **Confirmation**: The player confirms their choice by clicking the "Select" button. This triggers the `onUnitSelect` callback with the chosen unit.
5.  **Cancellation**: The player can cancel the action by clicking the "Cancel" button or clicking outside the modal, which triggers the `onCancel` callback.

## Props

| Prop            | Type                  | Description                                                           |
|-----------------|-----------------------|-----------------------------------------------------------------------|
| `isOpen`        | `boolean`             | Controls the visibility of the modal.                                 |
| `transportUnit` | `Unit | null`          | The transport unit from which a unit is being selected.               |
| `loadedUnits`   | `Unit[]`              | An array of units currently loaded in the transport.                  |
| `onUnitSelect`  | `(unit: Unit) => void`| Callback function executed when a unit is selected and confirmed.     |
| `onCancel`      | `() => void`          | Callback function executed when the selection is canceled.            |

## State

| State         | Type       | Description                               |
|---------------|------------|-------------------------------------------|
| `selectedUnit`| `Unit | null` | Stores the unit that the user has clicked on. |

## Usage Example

```tsx
import React, { useState } from 'react';
import UnitSelectionModal from './UnitSelectionModal';
import { Unit } from '../../types';

const GameInteractionController = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const transport = { id: 'transport1', name: 'Transport Ship', ... }; // Example transport unit
  const unitsInTransport = [ // Example loaded units
    { id: 'unit1', name: 'Infantry', ... },
    { id: 'unit2', name: 'Jeep', ... },
  ];

  const handleSelectUnit = (unit: Unit) => {
    console.log(`Unit ${unit.name} selected for disembarking.`);
    setIsModalOpen(false);
  };

  return (
    <div>
      <button onClick={() => setIsModalOpen(true)}>Unload Unit</button>
      <UnitSelectionModal
        isOpen={isModalOpen}
        transportUnit={transport}
        loadedUnits={unitsInTransport}
        onUnitSelect={handleSelectUnit}
        onCancel={() => setIsModalOpen(false)}
      />
    </div>
  );
};
```
