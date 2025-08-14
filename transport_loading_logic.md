# Generalized Transport Loading Logic Flow

This document outlines a generalized, implementation-agnostic workflow for handling the "load" action, where a passenger unit boards a transport unit in a strategy game.

---

### Step 1: Action Initiation

The process begins with a command from the player.

1.  **Command Issued**: The player selects a **Transport Unit** and issues a "Load" command targeting an adjacent **Passenger Unit**.
2.  **Target Identification**: The system identifies the specific transport unit initiating the load action and the specific passenger unit to be loaded.

---

### Step 2: Verification of Loading Conditions

Before executing the action, the system validates a set of preconditions. If any check fails, the action is canceled, and the reason is communicated to the player.

1.  **Relationship Validation**:
    *   **Ownership**: Do both units belong to the same player/faction?
    *   **Allegiance**: Are the units in a non-hostile state, allowing for cooperation?

2.  **Physical Condition Validation**:
    *   **Proximity**: Are the units in a valid position for the load action (e.g., on adjacent hexes)?

3.  **Transport Capacity Validation**:
    *   **Available Space**: Does the Transport Unit have enough free space (`capacity`) to accommodate the Passenger Unit?
    *   **Boarding Eligibility**: Is the Passenger Unit's type (e.g., `infantry`) one that the Transport Unit is permitted to carry (`transportableUnitTypes`)?

4.  **Transport Unit Status Validation**:
    *   **Action Points**: Does the Transport Unit have sufficient Action Points or Movement Points remaining to perform the load action?

---

### Step 3: Game State Update

If all verifications in Step 2 pass, the system modifies the game's internal data to reflect the new reality of the game world.

1.  **Passenger Unit State Change**:
    *   The unit's status changes from "independent on map" to "transported" (`isTransported`).
    *   A reference to the Transport Unit is stored (`transportedBy`), linking the passenger to its carrier.
    *   The unit can no longer perform independent actions while transported.

2.  **Transport Unit State Change**:
    *   The ID of the Passenger Unit is added to the Transport Unit's list of carried units (`loadedUnits`).
    *   The transport now "knows" what it is carrying.

3.  **Resource Consumption**:
    *   The cost for the load action (e.g., Action Points) is deducted from the Transport Unit.

---

### Step 4: Result Feedback

The changes in the game state are communicated clearly to the player.

1.  **Visual Feedback**:
    *   The Passenger Unit's graphic (sprite/model) is removed from the map.
    *   The Transport Unit's graphic may be updated with an indicator to show it is carrying cargo.

2.  **Informational Feedback**:
    *   A message (e.g., "[Transport Unit] has loaded [Passenger Unit]") is displayed in the game log.
    *   UI panels are updated to reflect the new status of both units.

---

This generalized flow serves as a blueprint for creating robust and consistent transport logic. The "unload" process can be designed by applying this flow in reverse, with its own unique validation steps (e.g., ensuring the destination hex is safe and valid).
