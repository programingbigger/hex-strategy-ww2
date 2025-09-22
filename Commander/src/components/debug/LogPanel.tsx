import React from 'react';
import fileLogger from '../../utils/logger';

interface LogPanelProps {
  isVisible: boolean;
  onToggle: () => void;
}

/**
 * Debug log panel for downloading and managing logs
 */
export const LogPanel: React.FC<LogPanelProps> = ({ isVisible, onToggle }) => {
  const handleDownloadLogs = () => {
    fileLogger.downloadLogs();
  };

  const handleClearLogs = () => {
    if (window.confirm('ログをクリアしますか？この操作は元に戻せません。')) {
      fileLogger.clearLogs();
    }
  };

  if (!isVisible) {
    return (
      <button
        onClick={onToggle}
        style={{
          position: 'fixed',
          bottom: '10px',
          left: '10px',
          zIndex: 9999,
          padding: '8px 12px',
          background: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          fontSize: '12px',
          cursor: 'pointer'
        }}
        title="ログパネルを開く"
      >
        📊 Debug Logs
      </button>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '10px',
        left: '10px',
        zIndex: 9999,
        background: 'rgba(0, 0, 0, 0.9)',
        color: 'white',
        padding: '15px',
        borderRadius: '8px',
        minWidth: '250px',
        fontSize: '14px',
        fontFamily: 'monospace'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h3 style={{ margin: 0, fontSize: '16px' }}>🔧 Debug Logs</h3>
        <button
          onClick={onToggle}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          ✖️
        </button>
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>ログ数:</strong> {fileLogger.getLogsCount()}
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button
          onClick={handleDownloadLogs}
          style={{
            padding: '8px 12px',
            background: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          📥 ログをダウンロード (.txt)
        </button>
        
        <button
          onClick={handleClearLogs}
          style={{
            padding: '8px 12px',
            background: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          🗑️ ログをクリア
        </button>
      </div>
      
      <div style={{ marginTop: '10px', fontSize: '12px', color: '#ccc' }}>
        ログは自動的に保存され、<br />
        ブラウザを再読み込みしても<br />
        保持されます。
      </div>
    </div>
  );
};