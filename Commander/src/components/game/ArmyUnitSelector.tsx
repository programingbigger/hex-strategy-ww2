import React, { useState } from 'react';
import { Faction, MilitaryBranch, UnitCategory, ArmyUnitTemplate } from '../../types';
import { armyManager } from '../../data/units';

interface ArmyUnitSelectorProps {
  faction: Faction;
  onUnitSelect: (template: ArmyUnitTemplate) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const ArmyUnitSelector: React.FC<ArmyUnitSelectorProps> = ({
  faction,
  onUnitSelect,
  isOpen,
  onClose
}) => {
  const [selectedBranch, setSelectedBranch] = useState<MilitaryBranch | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<UnitCategory | null>(null);

  if (!isOpen) return null;

  const factionInfo = armyManager.getFactionInfo(faction);
  const branches = armyManager.getBranches(faction);
  const categories = selectedBranch ? armyManager.getCategories(faction, selectedBranch) : [];
  const unitTemplates = armyManager.getUnitTemplatesBy(faction, selectedBranch || undefined, selectedCategory || undefined);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        maxWidth: '800px',
        maxHeight: '600px',
        overflow: 'auto',
        minWidth: '600px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '1.5em' }}>
            {factionInfo?.name} 部隊選択
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '5px'
            }}
          >
            ×
          </button>
        </div>

        <div style={{ display: 'flex', gap: '20px' }}>
          {/* Branch Selection */}
          <div style={{ flex: 1 }}>
            <h3 style={{ marginBottom: '10px', fontSize: '1.1em' }}>軍種</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              {branches.map(branch => (
                <button
                  key={branch}
                  onClick={() => {
                    setSelectedBranch(branch);
                    setSelectedCategory(null);
                  }}
                  style={{
                    padding: '10px',
                    border: selectedBranch === branch ? '2px solid #0066cc' : '1px solid #ccc',
                    backgroundColor: selectedBranch === branch ? '#f0f8ff' : 'white',
                    cursor: 'pointer',
                    borderRadius: '4px'
                  }}
                >
                  {factionInfo?.branches[branch]?.name || branch}
                </button>
              ))}
            </div>
          </div>

          {/* Category Selection */}
          {selectedBranch && (
            <div style={{ flex: 1 }}>
              <h3 style={{ marginBottom: '10px', fontSize: '1.1em' }}>兵科</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <button
                  onClick={() => setSelectedCategory(null)}
                  style={{
                    padding: '10px',
                    border: selectedCategory === null ? '2px solid #0066cc' : '1px solid #ccc',
                    backgroundColor: selectedCategory === null ? '#f0f8ff' : 'white',
                    cursor: 'pointer',
                    borderRadius: '4px'
                  }}
                >
                  全て
                </button>
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    style={{
                      padding: '10px',
                      border: selectedCategory === category ? '2px solid #0066cc' : '1px solid #ccc',
                      backgroundColor: selectedCategory === category ? '#f0f8ff' : 'white',
                      cursor: 'pointer',
                      borderRadius: '4px'
                    }}
                  >
                    {factionInfo?.branches[selectedBranch]?.unitCategories[category]?.name || category}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Unit Selection */}
          <div style={{ flex: 2 }}>
            <h3 style={{ marginBottom: '10px', fontSize: '1.1em' }}>部隊</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
              {unitTemplates.map(template => (
                <div
                  key={template.id}
                  onClick={() => onUnitSelect(template)}
                  style={{
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    padding: '10px',
                    cursor: 'pointer',
                    backgroundColor: 'white',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f5f5f5';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                  }}
                >
                  <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                    {template.name}
                  </div>
                  <div style={{ fontSize: '0.8em', color: '#666', marginBottom: '5px' }}>
                    {template.type} • {template.branch}
                  </div>
                  <div style={{ fontSize: '0.8em', color: '#888' }}>
                    HP: {template.stats.maxHp} | 攻撃: {template.stats.attack} | 防御: {template.stats.defense}
                  </div>
                  <div style={{ fontSize: '0.8em', color: '#888' }}>
                    移動: {template.stats.movement} | 燃料: {template.stats.maxFuel}
                  </div>
                  {template.weapons.length > 0 && (
                    <div style={{ fontSize: '0.7em', color: '#555', marginTop: '5px' }}>
                      武器: {template.weapons.map(w => w.name).join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};