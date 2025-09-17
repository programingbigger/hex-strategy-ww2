import React, { useEffect, useState } from 'react';
import { GameMap } from '../../types';

interface MapPreviewProps {
  selectedMap: GameMap | null;
}

interface TerrainColors {
  [key: string]: string;
}

const terrainColors: TerrainColors = {
  'Plains': '#9ACD32',
  'Forest': '#228B22',
  'Mountain': '#8B7355',
  'River': '#4682B4',
  'Bridge': '#DEB887',
  'Road': '#CD853F',
  'City': '#B22222',
  'Capital': '#DC143C',
  'Fortress': '#696969',
  'Port': '#4169E1',
  'Desert': '#F4A460',
  'Snow': '#F0F8FF',
  'Sea': '#006994',
  'Bocage': '#556B2F',
  'Mud': '#8B7D6B'
};

const MapPreview: React.FC<MapPreviewProps> = ({ selectedMap }) => {
  const [mapData, setMapData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedMap) {
      setMapData(null);
      return;
    }

    const loadMapData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/data/maps/scenario/${selectedMap.id}.json`);
        if (response.ok) {
          const data = await response.json();
          setMapData(data);
        } else {
          console.warn(`Failed to load map data for ${selectedMap.id}`);
          setMapData(null);
        }
      } catch (error) {
        console.error('Error loading map data:', error);
        setMapData(null);
      } finally {
        setLoading(false);
      }
    };

    loadMapData();
  }, [selectedMap]);

  const renderMapPreview = () => {
    if (!mapData || !mapData.board || !mapData.board.tiles) {
      return (
        <div className="map-preview-placeholder">
          <div className="placeholder-icon">🗺️</div>
          <div className="placeholder-text">Map preview not available</div>
        </div>
      );
    }

    const tiles = mapData.board.tiles;
    
    // Calculate bounds
    const xs = tiles.map((tile: any) => tile.x);
    const ys = tiles.map((tile: any) => tile.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    
    const width = maxX - minX + 1;
    const height = maxY - minY + 1;
    
    // Create a grid representation
    const grid: Array<Array<string | null>> = Array(height).fill(null).map(() => Array(width).fill(null));
    
    tiles.forEach((tile: any) => {
      const gridX = tile.x - minX;
      const gridY = tile.y - minY;
      grid[gridY][gridX] = tile.terrain;
    });

    const cellSize = Math.max(3, Math.min(8, 300 / Math.max(width, height)));

    return (
      <div className="hex-map-preview" style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${width}, ${cellSize}px)`,
        gridTemplateRows: `repeat(${height}, ${cellSize}px)`,
        gap: '1px',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        {grid.map((row, y) =>
          row.map((terrain, x) => (
            <div
              key={`${x}-${y}`}
              className="hex-cell"
              style={{
                width: `${cellSize}px`,
                height: `${cellSize}px`,
                backgroundColor: terrain ? terrainColors[terrain] || '#DDD' : 'transparent',
                border: terrain ? '1px solid rgba(0,0,0,0.2)' : 'none',
                borderRadius: '2px',
                position: 'relative'
              }}
              title={terrain || 'Empty'}
            />
          ))
        )}
      </div>
    );
  };

  if (!selectedMap) {
    return (
      <div className="map-preview-container">
        <div className="map-preview-empty">
          <div className="empty-icon">📍</div>
          <div className="empty-text">Select a map to view preview</div>
        </div>
      </div>
    );
  }

  return (
    <div className="map-preview-container">
      <div className="map-preview-header">
        <h3 className="map-preview-title">{selectedMap.name}</h3>
        <div className="map-preview-difficulty">
          Difficulty: {selectedMap.difficulty}
        </div>
      </div>
      
      <div className="map-preview-content">
        {loading ? (
          <div className="map-preview-loading">
            <div className="loading-spinner">⟳</div>
            <div>Loading map preview...</div>
          </div>
        ) : (
          renderMapPreview()
        )}
      </div>
      
      <div className="map-preview-description">
        <p>{selectedMap.description}</p>
      </div>

      <div className="terrain-legend">
        <div className="legend-title">Terrain Legend</div>
        <div className="legend-grid">
          {Object.entries(terrainColors).slice(0, 8).map(([terrain, color]) => (
            <div key={terrain} className="legend-item">
              <div 
                className="legend-color" 
                style={{ backgroundColor: color }}
              />
              <span className="legend-label">{terrain}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MapPreview;