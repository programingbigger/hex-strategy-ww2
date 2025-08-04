import React, { useState } from 'react';
import { ArmySystemTest } from './ArmySystemTest';
import { LegacyCompatibilityTest } from './LegacyCompatibilityTest';
import { ArmyUnitSelector } from '../game/ArmyUnitSelector';
import { ArmyUnitTemplate, Faction } from '../../types';

type TestView = 'army' | 'compatibility' | 'ui' | 'summary';

export const TestRunner: React.FC = () => {
  const [currentView, setCurrentView] = useState<TestView>('summary');
  const [showUnitSelector, setShowUnitSelector] = useState(false);
  const [selectedFaction, setSelectedFaction] = useState<Faction>('Blue');

  const handleUnitSelect = (template: ArmyUnitTemplate) => {
    console.log('Selected unit template:', template);
    setShowUnitSelector(false);
    alert(`選択されたユニット: ${template.name} (${template.type})`);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>軍組織システム テストスイート</h1>
      
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setCurrentView('summary')}
          style={{
            padding: '10px 20px',
            backgroundColor: currentView === 'summary' ? '#2196F3' : '#e0e0e0',
            color: currentView === 'summary' ? 'white' : 'black',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          📊 概要
        </button>
        
        <button
          onClick={() => setCurrentView('army')}
          style={{
            padding: '10px 20px',
            backgroundColor: currentView === 'army' ? '#4CAF50' : '#e0e0e0',
            color: currentView === 'army' ? 'white' : 'black',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          🏛️ ArmyManager テスト
        </button>
        
        <button
          onClick={() => setCurrentView('compatibility')}
          style={{
            padding: '10px 20px',
            backgroundColor: currentView === 'compatibility' ? '#FF9800' : '#e0e0e0',
            color: currentView === 'compatibility' ? 'white' : 'black',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          🔄 互換性テスト
        </button>
        
        <button
          onClick={() => setCurrentView('ui')}
          style={{
            padding: '10px 20px',
            backgroundColor: currentView === 'ui' ? '#9C27B0' : '#e0e0e0',
            color: currentView === 'ui' ? 'white' : 'black',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          🖼️ UI テスト
        </button>
      </div>

      <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px' }}>
        {currentView === 'summary' && (
          <div>
            <h2>テストスイート概要</h2>
            <div style={{ marginBottom: '20px' }}>
              <h3>実装された機能</h3>
              <ul>
                <li>✅ JSON ベースの軍組織管理システム</li>
                <li>✅ 軍種（陸・海・空）別ユニット管理</li>
                <li>✅ 兵科別ユニット分類</li>
                <li>✅ 既存システムとの完全互換性</li>
                <li>✅ 指揮系統ボーナス計算</li>
                <li>✅ 段階的移行サポート</li>
              </ul>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <h3>テスト項目</h3>
              <ul>
                <li><strong>ArmyManager テスト:</strong> JSON データ読み込み、ユニット作成、軍組織管理</li>
                <li><strong>互換性テスト:</strong> 既存システムとの連携、レガシー機能保持</li>
                <li><strong>UI テスト:</strong> 新しいユニット選択UI、表示機能</li>
              </ul>
            </div>
            
            <div>
              <h3>使用方法</h3>
              <p>上部のタブをクリックして各テストを実行してください。</p>
              <p>すべてのテストが成功すれば、軍組織システムは正常に動作しています。</p>
            </div>
          </div>
        )}

        {currentView === 'army' && <ArmySystemTest />}
        
        {currentView === 'compatibility' && <LegacyCompatibilityTest />}
        
        {currentView === 'ui' && (
          <div>
            <h2>UI コンポーネントテスト</h2>
            
            <div style={{ marginBottom: '20px' }}>
              <h3>ArmyUnitSelector テスト</h3>
              <p>軍種・兵科別ユニット選択UIのテストです。</p>
              
              <div style={{ marginBottom: '10px' }}>
                <label>陣営選択: </label>
                <select 
                  value={selectedFaction} 
                  onChange={(e) => setSelectedFaction(e.target.value as Faction)}
                  style={{ marginLeft: '10px', padding: '5px' }}
                >
                  <option value="Blue">連合軍 (Blue)</option>
                  <option value="Red">枢軸軍 (Red)</option>
                </select>
              </div>
              
              <button
                onClick={() => setShowUnitSelector(true)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                {selectedFaction === 'Blue' ? '連合軍' : '枢軸軍'} ユニット選択UIを開く
              </button>
            </div>
            
            <div style={{ 
              padding: '15px', 
              backgroundColor: '#f0f8ff', 
              border: '1px solid #2196F3', 
              borderRadius: '5px' 
            }}>
              <h4>テスト手順:</h4>
              <ol>
                <li>上の「ユニット選択UIを開く」ボタンをクリック</li>
                <li>軍種（陸・海・空）を選択</li>
                <li>兵科（infantry、armor等）を選択</li>
                <li>表示されたユニットをクリック</li>
                <li>選択結果がアラートで表示される</li>
              </ol>
            </div>
            
            {showUnitSelector && (
              <ArmyUnitSelector
                faction={selectedFaction}
                onUnitSelect={handleUnitSelect}
                isOpen={showUnitSelector}
                onClose={() => setShowUnitSelector(false)}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};