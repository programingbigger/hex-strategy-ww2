# Verbalized Requirements Document

## Purpose Statement
The user seeks to enhance a turn-based strategy game (hex-strategy-ww2) by implementing consistent weapon selection mechanics, improving counter-attack functionality, fixing a critical HP bug, and ensuring equal user experience for both players controlling different armies (blue and red).

## Core Requirements

### Requirement 1: Universal Weapon Selection Dialog
**Current State**: Weapon selection dialog is only implemented for blue army Tank units during attacks.

**Required Enhancement**: 
- Implement weapon selection dialog for ALL units during attack actions, regardless of army affiliation (blue or red)
- The dialog must appear in the attack sequence: Target Selection → Weapon Selection Dialog → Player Weapon Choice → Attack Execution
- **Critical Constraint**: Weapon selection dialog should only appear when the current player is controlling their own army units (players cannot select weapons for opponent units)

**Detailed UI Specifications**:
- **Information Display Requirements**: The weapon selection dialog must display:
  - Ammunition count for each weapon
  - Damage value for each weapon
  - Hit probability/accuracy for each weapon
  - Effectiveness indicator against target unit type
- **Ammunition Handling**: Weapons with zero ammunition must be displayed with grayed-out appearance and be non-selectable
- **Default Selection**: The most effective weapon against the target should be pre-selected when dialog opens

**Acceptance Criteria**:
- Blue army units show weapon selection dialog when blue player attacks
- Red army units show weapon selection dialog when red player attacks  
- No weapon selection dialog appears during AI/automated actions
- All unit types (not just Tanks) support weapon selection
- Dialog displays all required information (ammunition, damage, accuracy, effectiveness)
- Out-of-ammunition weapons are visually distinguished and non-selectable
- Most effective weapon is automatically pre-selected

### Requirement 2: Counter-Attack System Specification
**Current State**: Counter-attacks occur inconsistently - sometimes they happen, sometimes they don't.

**Required Behavior**:
- Counter-attacks MUST occur when ALL conditions are met:
  1. The defending unit has remaining ammunition for appropriate weapons
  2. The defending unit is being attacked (not initiating the attack)
  3. The attacker is within the effective range of the defender's counter-attack weapon

**Counter-Attack Weapon Selection Rules by Unit Type**:
- **戦車 (Tank)**: Always use main weapon (主砲). If main weapon is out of ammunition, use remaining sub-weapons for counter-attack
- **装甲車 (Armored Vehicle)**: Always use machine gun (機銃) regardless of attacking weapon type
- **歩兵 (Infantry)**: Always use machine gun (機銃) regardless of attacking weapon type
- **砲兵 (Artillery)**: Use rifle (ライフル) for range-1 attacks (only weapon available at close range)
- **対戦車兵器 (Anti-Tank Weapon)**: Use main gun (主砲) against armored targets, rifle (ライフル) against infantry targets

**Range Limitation**:
- Counter-attacks can only occur if the attacker is within the effective range of the defender's counter-attack weapon
- If out of effective range, no counter-attack occurs

**Acceptance Criteria**:
- Predictable counter-attack behavior based on ammunition availability and range
- Unit-type specific weapon selection for counter-attacks
- No counter-attacks when appropriate weapon has no ammunition or target is out of range
- Counter-attack weapon automatically selected based on unit type and target type

### Requirement 3: Red Army Tank HP Bug Fix
**Current State**: Red army Tank units experience a critical bug where HP suddenly drops to 1 after attacking.

**Bug Analysis**:
- **Occurrence Timing**: The HP degradation occurs at the moment when combat action completes and the result screen is displayed
- **Specific Trigger**: Red army attack → Combat processing completes → Result screen displays → **HP drops to 1 at this point**
- **Investigation Required**: Systematic analysis needed to identify differences in HP calculation logic between blue and red armies

**Required Fix**:
- Investigate and resolve the root cause of HP degradation for red army Tank units
- Ensure HP calculations are consistent between blue and red army units
- Verify no similar issues exist with other unit types
- Focus investigation on:
  - Damage calculation formulas
  - State management update timing
  - Counter-attack damage application methods
  - Unit state save/restore processes

**Testing Requirements**:
- **Minimal Test Scenarios**: Specific unit combinations must be provided to user for testing
- User will execute test scenarios to verify bug reproduction and fix validation

**Acceptance Criteria**:
- Red army Tank HP remains stable after attack actions
- HP calculations work identically for both armies
- No regression in existing HP management for other units
- Comprehensive test scenarios provided for user validation

### Requirement 4: Information Panel Parity
**Current State**: The "Armament Status" component in the right information panel only displays for blue army units, not red army units.

**Required Enhancement**:
- Display armament/weapon status information for ALL selected units regardless of army
- Ensure information panel provides identical functionality for both players

**Detailed Information Display Specifications**:
- **Required Information** (in priority order):
  1. Weapon name and ammunition count (Essential)
  2. Range distance (Essential) 
  3. Damage value (Important)
  4. Hit probability/accuracy (Important)
  - **Excluded**: Special effects (not required for current implementation)
- **Visual Design**: Unified design approach with army-specific color coding only
- **Update Timing**: Information updates only when unit is selected (not real-time)

**Strategic Context**: 
The game operates on a two-player turn-based system without AI:
- Blue Army (Player A) → Turn End → Red Army (Player B) → Turn End → Repeat
- Both players deserve equivalent user experience and interface functionality

**Acceptance Criteria**:
- Armament status component appears when selecting any unit (blue or red)
- Information displayed includes: weapon name, ammunition, range, damage, accuracy
- Panel updates only on unit selection
- Unified visual design with appropriate army color coding
- No functional disparity between player experiences

## Context and Background

### Game Architecture
- Hex-based strategy game with WWII theme
- Turn-based gameplay with two human players
- No AI implementation currently
- React/TypeScript implementation with existing weapon system

### Current Implementation Status
- Weapon selection partially implemented for blue army Tanks
- Counter-attack system exists but lacks consistency
- Information panels partially implemented
- Unit data structure supports multiple armies

## Success Criteria

### Functional Success
1. **Weapon Selection**: All players can select weapons for their own units during attacks
2. **Counter-Attack Reliability**: Predictable counter-attack behavior based on clear rules
3. **Bug Resolution**: Red army Tank HP stability maintained
4. **Interface Parity**: Identical information display for both armies

### User Experience Success
1. **Consistency**: Both players have equivalent gameplay experience
2. **Clarity**: Players understand when and why counter-attacks occur
3. **Control**: Players maintain agency over their own units' weapon selection
4. **Information Access**: Both players have equal access to unit status information

### Player Experience Fairness
Both players must have equal access to critical game information to ensure fair gameplay:
- **Enemy Unit HP Display**: Both players can view opponent units' remaining health points
- **Enemy Ammunition Status**: Both players can see opponent units' ammunition levels
- **Combat Prediction**: Both players have access to battle outcome predictions before engaging

This information parity ensures that strategic decisions are based on skill and tactical thinking rather than information asymmetry.

## Constraints and Considerations

### Technical Constraints
- Must maintain existing game state management
- Should not break current blue army Tank weapon selection
- Must preserve turn-based game flow
- Should maintain performance with additional UI components

### Design Constraints
- Weapon selection only for current player's units
- Main weapon used for counter-attacks (no selection)
- Information parity between armies
- Preserve existing visual design language

### Implementation Priority
1. **High Priority**: HP bug fix (game-breaking issue)
2. **High Priority**: Universal weapon selection (core gameplay feature)
3. **Medium Priority**: Counter-attack consistency (gameplay balance)
4. **Medium Priority**: Information panel parity (user experience)

**Dependency Considerations**: Implementation must account for interdependencies between requirements:
- HP bug fix may affect weapon selection mechanics
- Counter-attack system changes will impact information panel displays
- Weapon selection improvements may influence counter-attack logic

**Balance Verification Focus**: Special attention must be paid to unit-type interaction balance to ensure the new counter-attack system maintains fair and engaging gameplay.

## Future Enhancement Ideas

Based on step-back questioning analysis, the following features were considered but decided against for the current implementation. However, they are documented for potential future development in `/Users/namiya_fuminori/hex-strategy-ww2/Commander/docs/missing_elements.md`:

### Deferred Features
1. **Tactical Suppression**: Unit morale, suppression, and positioning effects on counter-attack ability
2. **Ammunition-Based Effectiveness**: Reduced counter-attack effectiveness for units with low ammunition
3. **Unit Condition Dependencies**: Counter-attack effectiveness reduction for heavily damaged units
4. **Terrain-Based Counter-Attack Bonuses**: Enhanced counter-attack capabilities for units in defensive positions
   - Special consideration: Infantry in cities gaining attack power bonus against armored units
5. **Surprise Attack Mechanics**: Counter-attack prevention through fog-of-war and stealth movement
   - Special consideration: Adjacent hex movement from undetected positions causing surprise effects
6. **Multi-Unit Engagement**: Complex battle scenarios with multiple attackers vs single defender

These features represent potential strategic depth enhancements that could be implemented in future versions to create more sophisticated tactical gameplay.

## Step-Back Analysis Resolution

### First Phase Analysis (Counter-Attack System)
The initial step-back questioning process successfully clarified the counter-attack system requirements:
- **Range limitations**: ✅ Implemented - Counter-attacks require target within effective range
- **Weapon effectiveness variance**: ✅ Implemented - Unit-type specific counter-attack weapon selection
- **Tactical considerations**: ❌ Deferred - Documented for future implementation
- **Ammunition consumption effects**: ❌ Deferred - Documented for future implementation

### Second Phase Analysis (System-Wide Refinement)
The comprehensive step-back questioning provided detailed specifications for all requirements:
- **Weapon Selection UI**: ✅ Detailed specifications defined - Information display, ammunition handling, default selection
- **HP Bug Analysis**: ✅ Timing identified - Bug occurs at combat result screen display
- **Information Panel Design**: ✅ Specifications finalized - Priority-based information display with unified design
- **Player Fairness**: ✅ Requirements clarified - Equal access to HP, ammunition, and combat prediction data
- **Testing Strategy**: ✅ Approach defined - Developer technical validation + User experience validation

This two-phase analytical approach successfully transformed high-level requirements into detailed, implementable specifications while maintaining focus on core functionality and ensuring comprehensive quality assurance.

## Quality Assurance and Testing Strategy

### Developer Testing Requirements
- **Build Verification**: All implementations must pass without TypeScript errors
- **Compilation Check**: `npm run build` must execute successfully without errors
- **Code Quality**: Implementation must maintain existing code standards and patterns

### User Testing Responsibilities
The following aspects will be validated by the user through direct gameplay testing:
- **Operational Intuitiveness**: Natural feel of interface interactions
- **Information Clarity**: Ease of understanding displayed information
- **Game Flow Naturalness**: Smooth progression through game mechanics

### Integration Testing Strategy
Following implementation, comprehensive testing must include:
- **Blue vs Red Army Combat Tests**: Full army-vs-army battle scenarios
- **All Unit Type Combat Tests**: Verification of all unit combinations
- **Edge Case Verification**: Boundary condition and error state testing

This testing approach ensures both technical correctness and user experience quality while clearly defining responsibilities between developer and user validation phases.