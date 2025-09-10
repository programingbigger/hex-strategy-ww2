import React, { useEffect, useRef } from 'react';
import { BattleLogEntry, BattleLogState, Team, Coordinate } from '../../types';
import { logBattle } from '../../utils/battleLogger';
import '../../styles/military-museum-theme.css';

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
      case 'Blue': return 'var(--crt-green)';  // Blue team color
      case 'Red': return 'var(--crt-amber)';   // Red team color
      default: return 'var(--crt-green-dim)';
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
        <span style={{ color: 'var(--crt-green-dim)' }}>
          {' '}(HP: {entry.attacker.hpBefore} → {entry.attacker.hpAfter})
        </span>
        <span style={{ color: 'var(--crt-green)' }}> ENGAGES </span>
        <span style={{ color: defenderColor, fontWeight: 'bold' }}>
          {defenderFlag} {entry.defender.unitName}
        </span>
        <span style={{ color: 'var(--crt-green-dim)' }}>
          {' '}(HP: {entry.defender.hpBefore} → {entry.defender.hpAfter})
        </span>
        <span style={{ color: 'var(--crt-green-dim)' }}>
          {' '}at {formatCoordinate(entry.location.hex)} in {entry.location.terrain}
          {formatTerrainEffect(entry.location.defenseBonus)}
        </span>
      </div>
    );

    // 🔫 Weapon details line
    const weaponLine = (
      <div style={{ 
        marginLeft: '16px', 
        color: 'var(--crt-green-dim)', 
        fontSize: '10px',
        marginBottom: entry.counterAttack ? '2px' : '8px'
      }}>
        <span style={{ color: 'var(--crt-amber)' }}>↳</span>
        <span> {entry.attacker.unitName} used {entry.weapon.name}. </span>
        <span style={{ color: 'var(--crt-amber)' }}>
          DMG: {entry.result.damageDealt}
        </span>
        {entry.result.damageTaken > 0 && (
          <span style={{ color: 'var(--crt-amber)' }}>
            / TOOK: {entry.result.damageTaken}
          </span>
        )}
        {entry.result.unitDestroyed && (
          <span style={{ color: 'var(--crt-amber)', fontWeight: 'bold' }}>
            [DESTROYED]
          </span>
        )}
        <span>.</span>
      </div>
    );

    // ⚔️ Counter-attack line (if exists)
    const counterLine = entry.counterAttack && (
      <div style={{ 
        marginLeft: '16px', 
        color: 'var(--crt-green-dim)', 
        fontSize: '10px',
        marginBottom: '8px'
      }}>
        <span style={{ color: 'var(--crt-amber)' }}>↳</span>
        <span> COUNTER! {entry.defender.unitName} used {entry.counterAttack.weapon.name}. </span>
        <span style={{ color: 'var(--crt-amber)' }}>
          DMG: {entry.counterAttack.damageDealt}
        </span>
        {entry.counterAttack.damageTaken > 0 && (
          <span style={{ color: 'var(--crt-amber)' }}>
            / TOOK: {entry.counterAttack.damageTaken}
          </span>
        )}
        {entry.counterAttack.unitDestroyed && (
          <span style={{ color: 'var(--crt-amber)', fontWeight: 'bold' }}>
            [DESTROYED]
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
      className="military-battle-log"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: '350px', // Account for right information panel
        height: '20%',
        zIndex: 500,
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
          borderBottom: '1px solid var(--crt-green-dim)',
          background: 'var(--crt-background)'
        }}
      >
        <div className="military-crt-text amber" style={{ 
          fontWeight: 'bold', 
          fontSize: '12px' 
        }}>
          🎯 BATTLE LOG TERMINAL
        </div>
        <div className="military-crt-text dim" style={{ 
          fontSize: '10px' 
        }}>
          [ T:{currentTurn} / {currentPhase.replace(' Phase', '').toUpperCase()} ]
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <button
            className="military-button"
            style={{
              padding: '2px 6px',
              fontSize: '10px',
              minWidth: 'auto'
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
        className="military-crt-text"
        style={{
          flex: 1,
          padding: '12px 16px',
          overflowY: 'auto',
          fontSize: '11px',
          lineHeight: '1.4'
        }}
      >
        {battleLog.entries.length === 0 ? (
          <div className="military-crt-text dim" style={{ 
            fontStyle: 'italic',
            textAlign: 'center',
            marginTop: '20px'
          }}>
            🔍 NO BATTLE EVENTS YET. INITIATE COMBAT TO LOG ENGAGEMENT DATA.
          </div>
        ) : (
          battleLog.entries.map(renderBattleLogEntry)
        )}
      </div>
    </div>
  );
};

export default BattleLogPanel;