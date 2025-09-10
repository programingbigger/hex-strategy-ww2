import React from 'react';
import '../../styles/military-museum-theme.css';

interface EndTurnConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  confirmText?: string;
  cancelText?: string;
}

const EndTurnConfirmModal: React.FC<EndTurnConfirmModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  title = '確認',
  confirmText = 'はい',
  cancelText = 'いいえ'
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="military-dialog">
        <h2 className="dialog-title">{title}</h2>
        <p className="dialog-message">ターンを終了しますか？</p>
        <div className="dialog-actions">
          <button onClick={onConfirm} className="military-button">{confirmText}</button>
          <button onClick={onCancel} className="military-button">{cancelText}</button>
        </div>
        <div className="dialog-tip">ヒント: Cmd+Eキーでこのダイアログを開けます</div>
      </div>
    </div>
  );
};

export default EndTurnConfirmModal;