# Battle Preparation Phase Functional Requirements

## 1. Overview
A comprehensive set of features that allows players to select units and deploy them on the map before battle begins.
This feature consists of two screens:

-   **Screen A: Unit Selection Screen (`BattlePrepScreen`)**
-   **Screen B: Unit Deployment Screen**

## 2. Screen A: Unit Selection Screen (`BattlePrepScreen`)

### 2.1. Role
-   Confirm victory conditions for the battle.
-   Select friendly units to participate in the battle.

### 2.2. UI and Feature Specifications

-   **Victory Condition Display**
    -   **Display Location**: Header area at the top of the screen. Position above the unit selection component.

-   **Button Specifications**
    -   **"Proceed to Deployment Phase" Button**
        -   **Role**: Transition to Screen B (Unit Deployment Screen).
        -   **Previous Name**: `Deploy Units`
    -   **"Reset Selection" Button**
        -   **Role**: Clear (deselect) all currently selected units.
        -   **Previous Name**: `Back to Map Select`
    -   **"Map Selection" Button**
        -   **Role**: Return to map select screen.
        -   **Previous Name**: `Back to Map Select`

## 3. Screen B: Unit Deployment Screen

### 3.1. Role
-   Deploy units selected in Screen A within designated areas on the map.

### 3.2. UI and Feature Specifications

-   **Main Display**
    -   Display the actual map where combat will take place.

-   **Header**
    -   Display text indicating the current phase is "Deployment Phase".
    -   Display instructional text (e.g., "Please select a unit to deploy").

-   **Right Panel (Unit List and Information Panel)**
    -   Display units selected in Screen A as a list.
    -   When hovering over units on the map or in the list, display unit status in this panel. (Serves the role of `InformationPanel.tsx`)

-   **Unit Deployment Flow**
    1.  **Single-click** on a unit from the right panel unit list to select it for deployment.
    2.  After clicking, the header text changes to "Please deploy the unit on the map".
    3.  Deployable hexes (squares) are highlighted in **light green**.
    4.  **Single-click** on any highlighted hex to deploy the unit at that position.

-   **Deployment Mode Cancellation**
    -   After selecting a unit from the unit list and entering "deployment mode", clicking the same unit again will cancel deployment mode and return to the pre-selection state.

-   **Deployed Unit Operations**
    -   **Redeployment**: **Double-click** on a deployed unit on the map to remove it from the map and return it to the right panel list.

-   **Deployment Rules**
    -   **Deployable Range**: Units can only be deployed within specific areas on the map.
    -   **Range Definition**: Within a 5-hex radius from a specified center coordinate.
    -   **Center Coordinate Management**: Managed in map data (e.g., `data/maps/test_map_1.json`) as `deploymentCenter: { "q": X, "r": Y }`.

-   **"Start Battle" Button**
    -   **Display Location**: Top of header.
    -   **Activation Condition**: Button remains **inactive** until all selected units are deployed on the map.
    -   **Click Behavior**:
        1.  Clicking displays a confirmation popup asking "Are you sure you want to deploy?"
        2.  Clicking "Yes" in the popup transitions to the battle phase.
        3.  Clicking "No" in the popup closes the popup and returns to the deployment screen.

-   **"Return to Unit Selection" Button**
    -   **Role**: Return to Screen A (Unit Selection Screen).
    -   **State Preservation**: When returning to Screen A with this button, **unit deployment information is not discarded but preserved**.

## 4. Inter-Screen Coordination Specifications

### Behavior when transitioning Screen B → Screen A → Screen B

-   **Prerequisite**: Unit information deployed in Screen B is maintained even when returning to Screen A.
-   **When units are removed**: If units are deselected in Screen A and then moved to Screen B again, the deselected units are automatically removed from both the map and the right panel list.
-   **When units are added**: If new units are additionally selected in Screen A and then moved to Screen B again, the added units are added to the right panel list as "undeployed".
