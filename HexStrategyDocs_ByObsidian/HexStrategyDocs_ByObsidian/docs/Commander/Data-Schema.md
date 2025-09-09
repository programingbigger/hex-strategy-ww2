# Data Schema

This document provides an overview of the data schemas used in `Commander/src/data`.

## `armyOrganization.json`

This file defines the military unit organization by branch and faction.

- **metadata**: Contains metadata about the file, such as version, description, and last updated date.
- **factions**: An object containing data for each faction (Blue and Red).
    - **[faction]**: An object containing data for a single faction.
        - **name**: The name of the faction.
        - **description**: A description of the faction.
        - **branches**: An object containing data for each military branch (陸, 海, 空).
            - **[branch]**: An object containing data for a single branch.
                - **name**: The name of the branch.
                - **unitCategories**: An object containing data for each unit category.
                    - **[category]**: An object containing data for a single category.
                        - **name**: The name of the category.
                        - **units**: An array of unit templates.
                            - **[unit]**: An object representing a single unit template, with properties such as `id`, `name`, `type`, `stats`, and `weapons`.
- **commandStructure**: Defines the command structure and bonuses.

## `tutorial.json`

This file contains the text for the in-game tutorial.

- **[tutorial_id]**: An array of objects, where each object represents a single step in the tutorial.
    - **title**: The title of the tutorial step.
    - **text**: The text of the tutorial step.

## `maps.ts`

This file defines the available maps in the game.

- **availableMaps**: An array of `GameMap` objects, where each object represents a single map with properties such as `id`, `name`, `description`, and `difficulty`.
