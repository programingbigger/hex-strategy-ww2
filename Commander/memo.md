Game Screen Structure Proposal
	Title Screen
        Overview
            The first screen displayed when the game starts.
        Display Elements
            Game Title Logo
            Background Visual
            Copyright Notice
        Menu
            New Game
                Displayed when there is no save data. Proceeds to the Story Mode opening.
            Continue
                Displayed when there is save data. Proceeds to the save data selection screen.
            Mode Select
                Transitions to the HOME screen.
            Settings
                Transitions to the settings screen.
    HOME Screen (Mode Select)
        Overview
            The hub screen for selecting each game mode.
        Menu
            Story Mode
                Overview
                    The main mode where you control the protagonist "Blue Army" in a battle against the opposing "Red Army."
                    The neighboring Green Army and the enemy Yellow and Purple Armies also appear.
                Flow
                    First Time Selection
                        A dialog recommending tutorial play is displayed.
                            Yes -> To Tutorial
                            No -> To Stage Select Map
                    Subsequent Times
                        Transitions directly to the Stage Select Map.
            Scenario Mode
                Overview
                    A mode where you can repeatedly play maps cleared in Story Mode with custom settings.
                Flow
                    Transitions to the map selection screen.
            Tutorial
                Overview
                    A mode where you can learn the basic game controls and rules in a hands-on format.
                Flow
                    Transitions to the tutorial stage selection screen.
            Settings
                Transitions to the settings screen.
    Story Mode
        Stage Select Map
            Overview
                A world map-like UI that visualizes progress. Shows cleared stages and the next stage to challenge.
            Flow
                Select a stage -> To Battle Preparation screen.
    Scenario Mode
        Map Selection Screen
            Overview
                A list of playable maps is displayed.
            Display Elements
                Map Thumbnail
                Map Name
                Recommended Level and Difficulty
            Flow
                Select a map -> To Battle Preparation screen.
    Tutorial Mode
        Stage Selection Screen
            Overview
                Select tutorial stages divided by learning theme.
            Display Elements
                Stage Name (e.g., Basic Controls, Unit Affinity, Special Terrain Effects)
                Clear Status
            Flow
                Select a stage -> To Battle Preparation screen (with a fixed formation for the tutorial).
    Battle Preparation Screen
        Overview
            A screen for confirming strategy and deploying units before the battle starts.
        Display Elements
            Full Map Preview
            Victory/Defeat Conditions
            Deployable Units List
            Deployment Area
        Flow
            Briefing Confirmation -> Unit Selection & Deployment -> Press "Start Battle" Button -> To Battle Map screen.
    Battle Map Screen (During Gameplay)
        Overview
            The main screen where you actually control units and fight.
        Flow
            The player and CPU take actions in turns.
            When victory or defeat conditions are met, proceeds to the result screen.
        Menu (Displayed by pressing the pause button)
            Return to Game
            Save
                To save data selection screen.
            Load
                To save data selection screen.
            Settings
                To settings screen.
            Return to HOME
                After a confirmation dialog, transitions to the HOME screen.
    Result Screen
        Overview
            A screen that displays the battle's outcome and evaluation.
        Display Elements
            Victory/Defeat Display
            Acquired EXP/Items
            Evaluation such as number of turns to clear.
        Flow
            Press "Confirm" Button
                If in Story Mode
                    Stage Select Map
                If in Scenario Mode
                    To map selection screen.
    Settings Screen
        Overview
            A screen for changing various settings.
        Settings Items
            Sound Settings
                BGM Volume
                SE (Sound Effects) Volume
            Game Settings
                Message Display Speed
                Check/Change Controls
    Save/Load Screen
        Overview
            A screen for saving and loading game progress.
        Display Elements
            Save Data Slot List (Multiple)
            Data information such as play time, current location, etc.
        Flow
            Select a slot to execute save or load.
Objectives and Action Flow by Screen (Player actions on each screen)
    Title Screen
        User Objective 1: Want to start a new game
            Action Flow: Click "Mode Select".
                -> Transitions to the HOME screen.
        User Objective 2: Want to continue from where I left off
            Action Flow: Click "Continue".
                -> Transitions to the Save/Load screen.
        User Objective 4: Want to change game settings
            Action Flow: Click "Settings".
                -> Transitions to the Settings screen.
    HOME Screen (Mode Select)
        User Objective 1: Want to advance the main story
            Action Flow: Click "Story Mode".
                -> (After a tutorial recommendation dialog on the first time) Transitions to the Stage Select Map.
                Action Flow: Click "New Game".
                    -> Proceeds to the story opening cinematic.
        User Objective 2: Want to play freely on cleared maps
            Action Flow: Click "Scenario Mode".
                -> Transitions to the Scenario Mode's map selection screen.
        User Objective 3: Want to practice the game controls
            Action Flow: Click "Tutorial".
                -> Transitions to the Tutorial Mode's stage selection screen.
    Story Mode (Stage Select Map)
        User Objective: Want to challenge the next battle
            Action Flow: Click the icon of the stage you want to challenge on the world map.
                -> Transitions to the Battle Preparation screen.
    Scenario Mode (Map Selection Screen)
        User Objective: Want to play on a favorite map
            Action Flow: From the list of displayed maps, click the thumbnail or name of the map you want to play.
                -> Transitions to the Battle Preparation screen.
    Tutorial Mode (Stage Selection Screen)
        User Objective: Want to learn about a specific control method
            Action Flow: From the list of learning themes, click the name of the stage you want to learn.
                -> Transitions to the Battle Preparation screen (at this time, the deployed units are fixed for the tutorial).
    Battle Preparation Screen
        User Objective: Want to create a strategy, deploy units, and start the battle fully prepared
            Action Flow
                1. Formulate a strategy by looking at the "Victory/Defeat Conditions" and "Full Map Preview" displayed on the screen.
                2. Select the "units" you want to deploy from the "Deployable Units List".
                3. Place the selected units by clicking (or dragging & dropping) them onto any "tile" within the deployment area on the map.
                    At this time, deployable "tiles" are only those displayed in red with 40% transparency.
                4. Adjust the position of the deployed units, and when ready, click the "Start Battle" button.
                    -> Transitions to the Battle Map screen and the battle begins.
    Battle Map Screen (During Gameplay)
        Your Turn
            1. Turn Start
                "Your Turn" display and active team highlight.
                All allied units become actionable.
                Apply start-of-turn effects (HP recovery, fuel resupply, etc.).
            2. Unit Selection
                Select an un-actioned allied unit by clicking it.
                    Unit highlight.
                    Details displayed in the info panel.
                    Details can also be displayed in the info panel by clicking on enemy units.
                Actioned and enemy units cannot be selected.
            3. Action Decision
                Information is visualized on the map.
                    Movable Range (Blue, etc.)
                    Attackable Range (Yellow, etc.)
                The player decides the next action.
            4. Action Execution
                A. Move -> Attack / Wait / Capture
                    1. Select destination
                    2. Execute move (animation and fuel consumption)
                    3. Select action after moving
                        Attack
                        Wait
                        Capture
                B. Attack -> End Action
                    1. Select attack target
                    2. Execute attack (combat and battle report)
                    3. End action
                C. Wait -> End Action
                    1. Select "Wait" command
                    2. End action
                D. Capture -> End Action
                    1. Select "Capture" command
                    2. End action
                E. Cancel Selection
                    Click the unit itself or an empty space on the map.
                F. Undo
                    Cancel move, capture, or attack target selection.
            5. All Units Have Acted
                Repeat steps 2-4 until all units have acted.
            6. End Turn
                Click the "End Turn" button.
                Transition to opponent's turn.
        Opponent's Turn
            Same as 1-6.
        CPU
            Not yet configured.
    Result Screen
        User Objective: Want to check the battle results (victory/defeat, EXP, etc.) and move on.
            Action Flow: Click the "Confirm" button.
                -> (If in Story Mode) Returns to the Stage Select Map.
                -> (If in Scenario Mode) Returns to the map selection screen.
                Save
                    To Save/Load screen.
    Save/Load Screen
        User Objective 1: Want to save current progress
            Action Flow
                1. Click an empty or overwritable "Save Data Slot".
                2. Click "Yes" on the confirmation dialog that appears.
                3. After the confirmation dialog, choose whether to return to the title screen or continue playing.
                    Select Return to Title Screen -> To Title Screen
                    After pressing Continue -> To Battle Map Screen (During Gameplay)
        User Objective 2: Want to resume from saved data
            Action Flow
                1. Click the "Save Data Slot" you want to resume from.
                2. Click "Yes" on the confirmation dialog that appears.
                3. After clicking, transitions to the Battle Map Screen (During Gameplay).