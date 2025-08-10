import React, { useState } from 'react';

const ShortcutsPanel: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const shortcuts = [
    { key: 'Cmd+E', description: 'End Turn' },
    { key: 'Esc', description: 'Cancel Selection' },
    { key: 'Space', description: 'Center on Selected Unit' },
  ];

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '340px',
      zIndex: 1000,
      transition: 'all 0.3s ease'
    }}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          padding: '10px 15px',
          background: 'rgba(52, 73, 94, 0.9)',
          color: 'white',
          border: '1px solid #3498db',
          borderRadius: isExpanded ? '8px 8px 0 0' : '8px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 'bold',
          transition: 'all 0.3s ease',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          minWidth: '140px',
          justifyContent: 'space-between'
        }}
        onMouseOver={(e) => {
          if (!isExpanded) {
            e.currentTarget.style.background = 'rgba(52, 73, 94, 1)';
          }
        }}
        onMouseOut={(e) => {
          if (!isExpanded) {
            e.currentTarget.style.background = 'rgba(52, 73, 94, 0.9)';
          }
        }}
      >
        <span>⌨️ Shortcuts</span>
        <span style={{
          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.3s ease'
        }}>
          ▲
        </span>
      </button>

      {/* Shortcuts List */}
      {isExpanded && (
        <div style={{
          background: 'rgba(52, 73, 94, 0.95)',
          border: '1px solid #3498db',
          borderTop: 'none',
          borderRadius: '0 0 8px 8px',
          padding: '15px',
          backdropFilter: 'blur(5px)',
          minWidth: '280px',
          animation: 'slideDown 0.3s ease'
        }}>
          <div style={{
            color: '#ecf0f1',
            fontSize: '16px',
            fontWeight: 'bold',
            marginBottom: '12px',
            borderBottom: '1px solid #34495e',
            paddingBottom: '8px'
          }}>
            Keyboard Shortcuts
          </div>
          
          {shortcuts.map((shortcut, index) => (
            <div key={index} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 0',
              borderBottom: index < shortcuts.length - 1 ? '1px solid #34495e' : 'none'
            }}>
              <span style={{
                color: '#bdc3c7',
                fontSize: '14px'
              }}>
                {shortcut.description}
              </span>
              <kbd style={{
                background: '#34495e',
                color: '#ecf0f1',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 'bold',
                border: '1px solid #2c3e50',
                fontFamily: 'monospace'
              }}>
                {shortcut.key}
              </kbd>
            </div>
          ))}
          
          <div style={{
            marginTop: '12px',
            padding: '8px',
            background: 'rgba(241, 196, 15, 0.2)',
            borderRadius: '6px',
            fontSize: '12px',
            color: '#f1c40f',
            textAlign: 'center'
          }}>
            💡 More shortcuts coming soon!
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default ShortcutsPanel;