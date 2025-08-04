import React, { useEffect, useState } from 'react';
import { getPlayerStartingUnits, getEnemyStartingUnits } from '../../data/units';
import { useGameLogic } from '../../hooks/useGameLogic';

interface CompatibilityTestResult {
  testName: string;
  success: boolean;
  details?: any;
  error?: string;
}

export const LegacyCompatibilityTest: React.FC = () => {
  const [testResults, setTestResults] = useState<CompatibilityTestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const gameLogic = useGameLogic();

  const runCompatibilityTests = async () => {
    setIsRunning(true);
    const results: CompatibilityTestResult[] = [];

    try {
      // 1. レガシーユニット作成関数テスト
      const playerUnits = getPlayerStartingUnits();
      const enemyUnits = getEnemyStartingUnits();
      
      results.push({
        testName: 'レガシーユニット作成関数',
        success: playerUnits.length > 0 && enemyUnits.length > 0,
        details: {
          playerUnitsCount: playerUnits.length,
          enemyUnitsCount: enemyUnits.length,
          firstPlayerUnit: playerUnits[0] ? {
            id: playerUnits[0].id,
            type: playerUnits[0].type,
            team: playerUnits[0].team,
            hasNewFields: !!(playerUnits[0].faction && playerUnits[0].branch)
          } : null
        }
      });

      // 2. useGameLogic フック新機能テスト
      const hasBranchFunction = typeof gameLogic.getBranchesFor === 'function';
      const hasCategoryFunction = typeof gameLogic.getCategoriesFor === 'function';
      const hasArmyFunction = typeof gameLogic.getAvailableUnitsFromArmy === 'function';
      
      results.push({
        testName: 'useGameLogic新機能',
        success: hasBranchFunction && hasCategoryFunction && hasArmyFunction,
        details: {
          getBranchesFor: hasBranchFunction,
          getCategoriesFor: hasCategoryFunction,
          getAvailableUnitsFromArmy: hasArmyFunction,
          calculateCommandBonus: typeof gameLogic.calculateCommandBonus === 'function'
        }
      });

      // 3. 軍種取得機能テスト
      if (hasBranchFunction) {
        const blueBranches = gameLogic.getBranchesFor('Blue');
        const redBranches = gameLogic.getBranchesFor('Red');
        
        results.push({
          testName: 'ゲームロジック軍種取得',
          success: blueBranches.length > 0 && redBranches.length > 0,
          details: { blueBranches, redBranches }
        });
      }

      // 4. 兵科取得機能テスト
      if (hasCategoryFunction) {
        const landCategories = gameLogic.getCategoriesFor('Blue', '陸');
        
        results.push({
          testName: 'ゲームロジック兵科取得',
          success: landCategories.length > 0,
          details: { landCategories }
        });
      }

      // 5. 軍組織ユニット取得テスト
      if (hasArmyFunction) {
        const availableUnits = gameLogic.getAvailableUnitsFromArmy('Blue', '陸');
        
        results.push({
          testName: '軍組織ユニット取得',
          success: availableUnits.length > 0,
          details: {
            unitCount: availableUnits.length,
            firstUnit: availableUnits[0] ? {
              id: availableUnits[0].id,
              name: availableUnits[0].name,
              type: availableUnits[0].type
            } : null
          }
        });
      }

      // 6. ユニット作成機能テスト
      if (gameLogic.createUnitFromArmy) {
        const newUnit = gameLogic.createUnitFromArmy('blue-infantry-standard', 'test-compat-1', 10, 10);
        
        results.push({
          testName: 'ゲームロジック経由ユニット作成',
          success: !!newUnit,
          details: newUnit ? {
            id: newUnit.id,
            name: newUnit.name,
            type: newUnit.type,
            team: newUnit.team,
            faction: newUnit.faction,
            branch: newUnit.branch,
            position: { x: newUnit.x, y: newUnit.y }
          } : null
        });
      }

      // 7. 指揮系統ボーナステスト
      if (gameLogic.calculateCommandBonus && playerUnits.length > 0) {
        const testUnit = playerUnits[0];
        const bonus = gameLogic.calculateCommandBonus(testUnit);
        
        results.push({
          testName: '指揮系統ボーナス計算',
          success: typeof bonus.attack === 'number' && typeof bonus.defense === 'number',
          details: bonus
        });
      }

      // 8. 既存ゲーム機能の動作確認
      const hasBasicFunctions = !!(
        gameLogic.units &&
        gameLogic.activeTeam &&
        gameLogic.turn &&
        typeof gameLogic.handleEndTurn === 'function'
      );
      
      results.push({
        testName: '既存ゲーム機能',
        success: hasBasicFunctions,
        details: {
          hasUnits: !!gameLogic.units,
          activeTeam: gameLogic.activeTeam,
          turn: gameLogic.turn,
          hasEndTurn: typeof gameLogic.handleEndTurn === 'function'
        }
      });

    } catch (error) {
      results.push({
        testName: 'エラーハンドリング',
        success: false,
        error: error instanceof Error ? error.message : String(error)
      });
    }

    setTestResults(results);
    setIsRunning(false);
  };

  useEffect(() => {
    runCompatibilityTests();
  }, []);

  const successCount = testResults.filter(r => r.success).length;
  const totalCount = testResults.length;

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>既存システム互換性テスト結果</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <strong>
          テスト結果: {successCount}/{totalCount} 
          {isRunning ? ' (実行中...)' : successCount === totalCount ? ' ✅ 全て成功' : ' ❌ 失敗あり'}
        </strong>
      </div>

      {testResults.map((result, index) => (
        <div key={index} style={{ 
          marginBottom: '15px', 
          padding: '10px', 
          border: `2px solid ${result.success ? '#4CAF50' : '#f44336'}`,
          borderRadius: '5px',
          backgroundColor: result.success ? '#f0f8f0' : '#fdf0f0'
        }}>
          <div style={{ 
            fontWeight: 'bold', 
            color: result.success ? '#2E7D32' : '#c62828',
            marginBottom: '5px'
          }}>
            {result.success ? '✅' : '❌'} {result.testName}
          </div>
          
          {result.details && (
            <div style={{ fontSize: '12px', color: '#666' }}>
              <strong>詳細:</strong>
              <pre style={{ 
                background: '#f5f5f5', 
                padding: '5px', 
                margin: '5px 0',
                borderRadius: '3px',
                overflow: 'auto',
                fontSize: '11px'
              }}>
                {JSON.stringify(result.details, null, 2)}
              </pre>
            </div>
          )}
          
          {result.error && (
            <div style={{ fontSize: '12px', color: '#c62828' }}>
              <strong>エラー:</strong> {result.error}
            </div>
          )}
        </div>
      ))}

      <div style={{ marginTop: '20px' }}>
        <button 
          onClick={runCompatibilityTests}
          disabled={isRunning}
          style={{
            padding: '10px 20px',
            backgroundColor: '#FF9800',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isRunning ? 'not-allowed' : 'pointer'
          }}
        >
          {isRunning ? 'テスト実行中...' : '互換性テスト再実行'}
        </button>
      </div>
    </div>
  );
};