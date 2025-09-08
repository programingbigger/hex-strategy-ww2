import { useEffect, useState, useMemo, useCallback } from 'react';
import { ReinforcementConfig, ReinforcementData } from '../../types/reinforcements';
import { loadReinforcementConfig, getSpawnLocations, hasReinforcementAtLocation } from '../../utils/reinforcements';
import { Coordinate } from '../../types';

export interface ReinforcementHook {
  reinforcementSpawnLocations: Coordinate[];
  isReinforcementSpawnLocation: (x: number, y: number) => boolean;
  getReinforcementsForPreview: () => ReinforcementData[];
}

interface ReinforcementDeps {
  mapId: string;
}

export const useReinforcements = (deps: ReinforcementDeps): ReinforcementHook => {
  const { mapId } = deps;
  const [reinforcementConfig, setReinforcementConfig] = useState<ReinforcementConfig | null>(null);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const config = await loadReinforcementConfig(mapId);
        setReinforcementConfig(config);
        console.log('🪖 Loaded reinforcement config for map:', mapId, config);
      } catch (error) {
        console.error('❌ Failed to load reinforcement config:', error);
        setReinforcementConfig(null);
      }
    };

    loadConfig();
  }, [mapId]);

  const reinforcementSpawnLocations = useMemo(() => {
    if (!reinforcementConfig) return [];
    return getSpawnLocations(reinforcementConfig.reinforcements);
  }, [reinforcementConfig]);

  const isReinforcementSpawnLocation = useCallback((x: number, y: number): boolean => {
    if (!reinforcementConfig) return false;
    return hasReinforcementAtLocation(reinforcementConfig.reinforcements, x, y);
  }, [reinforcementConfig]);

  const getReinforcementsForPreview = useCallback((): ReinforcementData[] => {
    if (!reinforcementConfig) return [];
    return reinforcementConfig.reinforcements;
  }, [reinforcementConfig]);

  return {
    reinforcementSpawnLocations,
    isReinforcementSpawnLocation,
    getReinforcementsForPreview,
  };
};