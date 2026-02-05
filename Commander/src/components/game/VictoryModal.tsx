import React from 'react';

interface VictoryModalProps {
  isOpen: boolean;
  defeatedArmy?: string;
  winnerArmy?: string;
  onClose: () => void;
  onReturnToTutorialSelect?: () => void;
}

const VictoryModal: React.FC<VictoryModalProps> = ({ isOpen, defeatedArmy, winnerArmy, onClose, onReturnToTutorialSelect }) => {
  if (!isOpen) return null;

  const getMessage = () => {
    if (!defeatedArmy) return '戦闘は終結しました。';
    
    let message = `${defeatedArmy}軍は降伏しました。`;
    if (winnerArmy) {
      message += `これにより、${winnerArmy}軍の勝利です。`;
    }
    return message;
  };

  const isVictory = !!winnerArmy;

  return (
    <div className="modal-overlay">
      <div className={`military-dialog ${isVictory ? 'dialog-victory' : 'dialog-defeat'}`}>
        <h2 className="dialog-title">{isVictory ? '🏆 戦闘結果' : '⚔️ 戦況報告'}</h2>
        <p className="dialog-message">{getMessage()}</p>
        <div className="dialog-actions">
          {onReturnToTutorialSelect && (
            <button onClick={onReturnToTutorialSelect} className="military-button">チュートリアルマップ一覧へ戻る</button>
          )}
          <button onClick={onClose} className="military-button">タイトルへ戻る</button>
        </div>
      </div>
    </div>
  );
};

export default VictoryModal;