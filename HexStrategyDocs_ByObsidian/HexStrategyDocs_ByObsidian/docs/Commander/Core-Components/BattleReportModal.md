
# BattleReportModal

`BattleReportModal` is a React component that displays the results of a battle between two units. It shows details about the attacker and defender, the damage dealt, and a narrative report of the engagement.

## Overview

This modal appears after a battle sequence is completed. It provides a clear and concise summary of the outcome, helping the player understand what happened without cluttering the main game interface.

## How It Works

1.  **Data**: The component receives a `battleReport` object containing all the information about the battle.
2.  **Display**: It renders the attacker's and defender's stats (type, team, HP), a play-by-play text report, and a summary of the damage exchanged.
3.  **Visibility**: The modal is shown only when there is a valid `battleReport` object. It is hidden otherwise.
4.  **Closing**: The user can close the modal by clicking the "Continue" button, which triggers the `onClose` callback.

## Props

| Prop          | Type             | Description                                       |
|---------------|------------------|---------------------------------------------------|
| `battleReport`| `BattleReport | null` | An object containing the battle results. If `null`, the modal is not displayed. |
| `onClose`     | `() => void`     | Callback function executed when the modal is closed. |

## BattleReport Type

The `battleReport` prop is an object with the following structure:

```typescript
interface BattleReport {
  attacker: {
    type: string;
    team: string;
    hp: number;
    maxHp: number;
  };
  defender: {
    type: string;
    team: string;
    hp: number;
    maxHp: number;
  };
  report: string; // Narrative description of the battle
  damage: number; // Damage dealt by the attacker
  counterDamage?: number; // Optional: Damage dealt by the defender in a counter-attack
}
```

## Usage Example

```tsx
import React, { useState } from 'react';
import BattleReportModal from './BattleReportModal';
import { BattleReport } from '../../types';

const GameUI = () => {
  const [report, setReport] = useState<BattleReport | null>(null);

  // Example function to trigger the modal
  const showBattleReport = () => {
    const exampleReport: BattleReport = {
      attacker: { type: 'Sherman', team: 'USA', hp: 8, maxHp: 10 },
      defender: { type: 'Panzer IV', team: 'Germany', hp: 3, maxHp: 10 },
      report: 'The Sherman tank fires at the Panzer IV, dealing significant damage.',
      damage: 5,
      counterDamage: 2,
    };
    setReport(exampleReport);
  };

  return (
    <div>
      <button onClick={showBattleReport}>Show Report</button>
      <BattleReportModal
        battleReport={report}
        onClose={() => setReport(null)}
      />
    </div>
  );
};
```
