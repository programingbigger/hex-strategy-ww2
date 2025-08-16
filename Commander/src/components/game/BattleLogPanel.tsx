import React, { useEffect, useRef } from 'react';
import { BattleLogEntry, BattleLogState, Team, Coordinate } from '../../types';
import { logBattle } from '../../utils/battleLogger';

interface BattleLogPanelProps {
  battleLog: BattleLogState;
  currentTurn: number;
  currentPhase: 'Player Phase' | 'Enemy Phase';
}

export const BattleLogPanel: React.FC<BattleLogPanelProps> = ({
  battleLog,
  currentTurn,
  currentPhase
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // 🔄 新しいエントリが追加されたら自動スクロール
  useEffect(() => {
    if (battleLog.autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      logBattle('Auto-scrolled battle log to bottom', {
        entriesCount: battleLog.entries.length,
        scrollHeight: scrollRef.current.scrollHeight
      });
    }
  }, [battleLog.entries.length, battleLog.autoScroll]);

  const getTeamFlag = (team: Team): string => {
    switch (team) {
      case 'Blue': return '[SOV]';  // Soviet Union
      case 'Red': return '[GER]';   // Germany
      default: return `[${team}]`;
    }
  };

  const getTeamColor = (team: Team): string => {
    switch (team) {
      case 'Blue': return '#4a90e2';  // Blue team color
      case 'Red': return '#e24a4a';   // Red team color
      default: return '#666';
    }
  };

  const formatCoordinate = (coord: Coordinate): string => {
    return `Hex(${coord.x},${coord.y})`;
  };

  const formatTerrainEffect = (defenseBonus?: number): string => {
    if (!defenseBonus || defenseBonus === 0) return '';
    return ` (+${defenseBonus}% Def)`;
  };

  const renderBattleLogEntry = (entry: BattleLogEntry) => {
    const attackerFlag = getTeamFlag(entry.attacker.team);
    const defenderFlag = getTeamFlag(entry.defender.team);
    const attackerColor = getTeamColor(entry.attacker.team);
    const defenderColor = getTeamColor(entry.defender.team);

    // 🎯 Main battle line
    const mainLine = (
      <div style={{ marginBottom: '4px' }}>
        <span style={{ color: attackerColor, fontWeight: 'bold' }}>
          {attackerFlag} {entry.attacker.unitName}
        </span>
        <span style={{ color: '#888' }}>
          {' '}(HP: {entry.attacker.hpBefore} → {entry.attacker.hpAfter})
        </span>
        <span style={{ color: '#fff' }}> attacks </span>
        <span style={{ color: defenderColor, fontWeight: 'bold' }}>
          {defenderFlag} {entry.defender.unitName}
        </span>
        <span style={{ color: '#888' }}>
          {' '}(HP: {entry.defender.hpBefore} → {entry.defender.hpAfter})
        </span>
        <span style={{ color: '#bbb' }}>
          {' '}at {formatCoordinate(entry.location.hex)} in {entry.location.terrain}
          {formatTerrainEffect(entry.location.defenseBonus)}
        </span>
      </div>
    );

    // 🔫 Weapon details line
    const weaponLine = (
      <div style={{ 
        marginLeft: '16px', 
        color: '#aaa', 
        fontSize: '13px',
        marginBottom: entry.counterAttack ? '2px' : '8px'
      }}>
        <span style={{ color: '#ff9500' }}>↳</span>
        <span> {entry.attacker.unitName} used {entry.weapon.name}. </span>
        <span style={{ color: '#e74c3c' }}>
          Dealt {entry.result.damageDealt} dmg
        </span>
        {entry.result.damageTaken > 0 && (
          <span style={{ color: '#f39c12' }}>
            , Took {entry.result.damageTaken} dmg
          </span>
        )}
        {entry.result.unitDestroyed && (
          <span style={{ color: '#c0392b', fontWeight: 'bold' }}>
            . Unit destroyed!
          </span>
        )}
        <span>.</span>
      </div>
    );

    // ⚔️ Counter-attack line (if exists)
    const counterLine = entry.counterAttack && (
      <div style={{ 
        marginLeft: '16px', 
        color: '#aaa', 
        fontSize: '13px',
        marginBottom: '8px'
      }}>
        <span style={{ color: '#ff9500' }}>↳</span>
        <span> Counter-attack! {entry.defender.unitName} used {entry.counterAttack.weapon.name}. </span>
        <span style={{ color: '#e74c3c' }}>
          Dealt {entry.counterAttack.damageDealt} dmg
        </span>
        {entry.counterAttack.damageTaken > 0 && (
          <span style={{ color: '#f39c12' }}>
            , Took {entry.counterAttack.damageTaken} dmg
          </span>
        )}
        {entry.counterAttack.unitDestroyed && (
          <span style={{ color: '#c0392b', fontWeight: 'bold' }}>
            . Unit destroyed!
          </span>
        )}
        <span>.</span>
      </div>
    );

    return (
      <div key={entry.id} style={{ marginBottom: '12px' }}>
        {mainLine}
        {weaponLine}
        {counterLine}
      </div>
    );
  };

  if (!battleLog.isVisible) {
    return null;
  }

  return (
    <div 
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: '350px', // Account for right information panel
        height: '20%',
        zIndex: 500,
        background: 'rgba(52, 73, 94, 0.95)',
        backdropFilter: 'blur(5px)',
        borderTop: '2px solid #3498db',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* 📊 Header */}
      <div
        style={{
          height: '40px',
          padding: '0 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #3498db',
          background: 'rgba(52, 73, 94, 0.9)'
        }}
      >
        <div style={{ 
          color: '#fff', 
          fontWeight: 'bold', 
          fontSize: '14px' 
        }}>
          🎯 BATTLE LOG
        </div>
        <div style={{ 
          color: '#bbb', 
          fontSize: '12px' 
        }}>
          [ Turn: {currentTurn} / {currentPhase} ]
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <button
            style={{
              background: 'none',
              border: '1px solid #3498db',
              color: '#3498db',
              padding: '4px 8px',
              fontSize: '12px',
              borderRadius: '3px',
              cursor: 'pointer'
            }}
            onClick={() => {
              if (scrollRef.current) {
                scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
              }
            }}
          >
            ▼
          </button>
        </div>
      </div>

      {/* 📜 Scrollable Log Content */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          padding: '12px 16px',
          overflowY: 'auto',
          color: '#fff',
          fontSize: '12px',
          fontFamily: 'monospace',
          lineHeight: '1.4'
        }}
      >
        {battleLog.entries.length === 0 ? (
          <div style={{ 
            color: '#888', 
            fontStyle: 'italic',
            textAlign: 'center',
            marginTop: '20px'
          }}>
            🔍 No battle events yet. Start attacking to see combat logs here.
          </div>
        ) : (
          battleLog.entries.map(renderBattleLogEntry)
        )}
      </div>
    </div>
  );
};

export default BattleLogPanel;