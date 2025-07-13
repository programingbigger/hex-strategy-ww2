import React from 'react';
import { Unit, Tile, Coordinate } from '../../types';

interface InfoPanelProps {
  selectedUnit?: Unit;
  hoveredHex?: Coordinate | null;
  boardLayout: Map<string, Tile>;
  units: Unit[];
}

const InfoPanel: React.FC<InfoPanelProps> = ({
  selectedUnit,
  hoveredHex,
  boardLayout,
  units
}) => {
  const coordToString = (coord: Coordinate) => `${coord.x},${coord.y}`;
  
  const hoveredTile = hoveredHex ? boardLayout.get(coordToString(hoveredHex)) : null;
  const hoveredUnit = hoveredHex ? units.find(u => u.x === hoveredHex.x && u.y === hoveredHex.y) : null;
  
  return (
    <div className="info-panel" style={{
      width: '300px',
      background: 'rgba(255, 255, 255, 0.95)',
      border: '2px solid #333',
      borderRadius: '8px',
      padding: '15px',
      fontSize: '14px',
      color: '#333',
      boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
    }}>
      <h3 style={{ margin: '0 0 15px 0', color: '#333', borderBottom: '2px solid #667eea', paddingBottom: '8px' }}>Information Panel</h3>
      
      {selectedUnit && (
        <div style={{ marginBottom: '15px', padding: '10px', background: '#e8f4f8', borderRadius: '5px' }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#0066cc' }}>Selected Unit</h4>
          <div><strong>Type:</strong> {selectedUnit.type}</div>
          <div><strong>Team:</strong> {selectedUnit.team}</div>
          <div><strong>HP:</strong> {selectedUnit.hp}/{selectedUnit.maxHp}</div>
          <div><strong>Fuel:</strong> {selectedUnit.fuel}/{selectedUnit.maxFuel}</div>
          <div><strong>XP:</strong> {selectedUnit.xp}/100</div>
          <div><strong>Attack:</strong> {selectedUnit.attack}</div>
          <div><strong>Defense:</strong> {selectedUnit.defense}</div>
          <div><strong>Movement:</strong> {selectedUnit.movement}</div>
          <div><strong>Range:</strong> {selectedUnit.attackRange.min}-{selectedUnit.attackRange.max}</div>
          <div><strong>Position:</strong> ({selectedUnit.x}, {selectedUnit.y})</div>
          <div><strong>Status:</strong> 
            {selectedUnit.moved && selectedUnit.attacked ? ' Done' :
             selectedUnit.moved ? ' Moved' :
             selectedUnit.attacked ? ' Attacked' : ' Ready'}
          </div>
        </div>
      )}
      
      {hoveredTile && (
        <div style={{ padding: '10px', background: '#f0f8e8', borderRadius: '5px' }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#228b22' }}>Hovered Hex</h4>
          <div><strong>Position:</strong> ({hoveredTile.x}, {hoveredTile.y})</div>
          <div><strong>Terrain:</strong> {hoveredTile.terrain}</div>
          {hoveredTile.owner && (
            <div><strong>Owner:</strong> {hoveredTile.owner}</div>
          )}
          {hoveredTile.hp !== undefined && (
            <div><strong>HP:</strong> {hoveredTile.hp}/{hoveredTile.maxHp}</div>
          )}
          
          {hoveredUnit && (
            <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #ccc' }}>
              <strong>Unit:</strong> {hoveredUnit.type} ({hoveredUnit.team})
              <div>HP: {hoveredUnit.hp}/{hoveredUnit.maxHp}</div>
              <div>Fuel: {hoveredUnit.fuel}/{hoveredUnit.maxFuel}</div>
              <div>XP: {hoveredUnit.xp}/100</div>
            </div>
          )}
        </div>
      )}
      
      {!selectedUnit && !hoveredTile && (
        <div style={{ padding: '10px', background: '#f5f5f5', borderRadius: '5px', textAlign: 'center' }}>
          <p style={{ margin: 0, color: '#666' }}>Select a unit or hover over a hex for details</p>
        </div>
      )}
      
      {/* Camera Controls Information */}
      <div style={{ marginTop: '15px', padding: '10px', background: '#f8f9fa', borderRadius: '5px', borderLeft: '4px solid #667eea' }}>
        <h4 style={{ margin: '0 0 8px 0', color: '#667eea', fontSize: '12px' }}>Camera Controls</h4>
        <div style={{ fontSize: '12px', color: '#555' }}>
          <div><strong>Move:</strong> Arrow Keys or WASD</div>
          <div><strong>Zoom:</strong> +/- Keys</div>
          <div><strong>Reset:</strong> R Key</div>
        </div>
      </div>
    </div>
  );
};

export default InfoPanel;