// Map data imports
import large_map_2 from './large_map_2.json';
import large_map_only_Plains from './large_map_only_Plains.json';
import large_map from './large_map.json';
import short_case_map from './short_case_map.json';
import testdev_map from './testdev_map.json';

export const scenarioMaps = {
  'large_map_2': large_map_2,
  'large_map_only_Plains': large_map_only_Plains,
  'large_map': large_map,
  'short_case_map': short_case_map,
  'testdev_map': testdev_map,
};

export type ScenarioMapId = keyof typeof scenarioMaps;