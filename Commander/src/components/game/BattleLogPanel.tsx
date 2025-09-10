import React, { useEffect, useRef } from 'react';
import { BattleLogEntry, BattleLogState, Team, Coordinate } from '../../types';
import { logBattle } from '../../utils/battleLogger';
import '../../styles/military-museum-theme.css';

interface BattleLogPanelProps {
  className?: string;
  battleLog: BattleLogState;
  currentTurn: number;
  currentPhase: string;
}

export const BattleLogPanel: React.FC<BattleLogPanelProps> = ({
  className,
  battleLog,
  currentTurn,
  currentPhase
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (battleLog.autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [battleLog.entries, battleLog.autoScroll]);

  const getTeamFlag = (team: Team): string => {
    return team === 'Blue' ? '[青軍]' : '[赤軍]';
  };

  const getTeamColor = (team: Team): string => {
    return team === 'Blue' ? 'var(--earth-success)' : 'var(--earth-danger)';
  };

  const formatCoordinate = (coord: Coordinate): string => {
    return `座標(${coord.x},${coord.y})`;
  };

  const formatTerrainEffect = (defenseBonus?: number): string => {
    if (!defenseBonus || defenseBonus === 0) return '';
    return ` (防御効果+${defenseBonus}%)`;
  };

  const renderBattleLogEntry = (entry: BattleLogEntry) => {
    const attackerFlag = getTeamFlag(entry.attacker.team);
    const defenderFlag = getTeamFlag(entry.defender.team);
    const attackerColor = getTeamColor(entry.attacker.team);
    const defenderColor = getTeamColor(entry.defender.team);

    return (
      <div key={entry.id} className="log-entry">
        <div className="log-line main">
          <span style={{ color: attackerColor }}>{attackerFlag} {entry.attacker.unitName}</span>
          <span className="log-hp-change">(耐久: {entry.attacker.hpBefore} → {entry.attacker.hpAfter})</span>
          <span>が</span>
          <span style={{ color: defenderColor }}>{defenderFlag} {entry.defender.unitName}</span>
          <span className="log-hp-change">(耐久: {entry.defender.hpBefore} → {entry.defender.hpAfter})</span>
          <span>と交戦</span>
          <span className="log-location">@{formatCoordinate(entry.location.hex)} {entry.location.terrain}{formatTerrainEffect(entry.location.defenseBonus)}</span>
        </div>

        <div className="log-line sub">
          <span>↳</span>
          <span> {entry.attacker.unitName} は {entry.weapon.name} を使用。</span>
          <span className="log-damage">損害: {entry.result.damageDealt}</span>
          {entry.result.damageTaken > 0 && <span className="log-damage">/ 被損害: {entry.result.damageTaken}</span>}
          {entry.result.unitDestroyed && <span className="log-destroyed">[撃破]</span>}
        </div>

        {entry.counterAttack && (
          <div className="log-line sub counter">
            <span>↳</span>
            <span>反撃！ {entry.defender.unitName} は {entry.counterAttack.weapon.name} を使用。</span>
            <span className="log-damage">損害: {entry.counterAttack.damageDealt}</span>
            {entry.counterAttack.damageTaken > 0 && <span className="log-damage">/ 被損害: {entry.counterAttack.damageTaken}</span>}
            {entry.counterAttack.unitDestroyed && <span className="log-destroyed">[撃破]</span>}
          </div>
        )}
      </div>
    );
  };

  if (!battleLog.isVisible) {
    return null;
  }

  return (
    <div className={className}>
      <div className="panel-header">
        <h3 className="panel-title">戦闘ログ</h3>
        <div className="log-header-info">
          [ T:{currentTurn} / {currentPhase} ]
        </div>
      </div>

      <div ref={scrollRef} className="log-content">
        {battleLog.entries.length === 0 ? (
          <div className="log-empty-message">
            戦闘イベントはまだありません。
          </div>
        ) : (
          battleLog.entries.map(renderBattleLogEntry)
        )}
      </div>
    </div>
  );
};

export default BattleLogPanel;