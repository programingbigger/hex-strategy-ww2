import React, { useEffect, useState } from 'react';
import { armyManager } from '../../data/units';

interface TestResult {
  testName: string;
  success: boolean;
  details?: any;
  error?: string;
}

export const ArmySystemTest: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runTests = async () => {
    setIsRunning(true);
    const results: TestResult[] = [];

    try {
      // 1. シングルトンインスタンステスト
      results.push({
        testName: 'シングルトンインスタンス取得',
        success: !!armyManager,
        details: 'ArmyManager インスタンス取得'
      });

      // 2. ファクション情報取得テスト
      const blueInfo = armyManager.getFactionInfo('Blue');
      const redInfo = armyManager.getFactionInfo('Red');
      results.push({
        testName: 'ファクション情報取得',
        success: !!(blueInfo && redInfo),
        details: { blueName: blueInfo?.name, redName: redInfo?.name }
      });

      // 3. 軍種取得テスト
      const blueBranches = armyManager.getBranches('Blue');
      const redBranches = armyManager.getBranches('Red');
      results.push({
        testName: '軍種取得',
        success: blueBranches.length > 0 && redBranches.length > 0,
        details: { blueBranches, redBranches }
      });

      // 4. 兵科取得テスト
      const landCategories = armyManager.getCategories('Blue', '陸');
      results.push({
        testName: '兵科取得',
        success: landCategories.length > 0,
        details: { landCategories }
      });

      // 5. ユニットテンプレート取得テスト
      const allBlueUnits = armyManager.getUnitTemplatesBy('Blue');
      const blueLandUnits = armyManager.getUnitTemplatesBy('Blue', '陸');
      const blueInfantry = armyManager.getUnitTemplatesBy('Blue', '陸', 'infantry');
      
      results.push({
        testName: 'ユニットテンプレート取得',
        success: allBlueUnits.length > 0 && blueLandUnits.length > 0 && blueInfantry.length > 0,
        details: {
          allCount: allBlueUnits.length,
          landCount: blueLandUnits.length,
          infantryCount: blueInfantry.length,
          infantryExample: blueInfantry[0]
        }
      });

      // 6. ユニット作成テスト
      const newUnit = armyManager.createUnitFromTemplate('blue-infantry-standard', 'test-unit-1', 5, 5);
      results.push({
        testName: 'ユニット作成',
        success: !!newUnit,
        details: newUnit ? {
          id: newUnit.id,
          name: newUnit.name,
          type: newUnit.type,
          faction: newUnit.faction,
          branch: newUnit.branch,
          category: newUnit.category,
          weaponsCount: newUnit.weapons.length
        } : null
      });

      // 7. 指揮系統データ取得テスト
      const commandStructure = armyManager.getCommandStructure();
      results.push({
        testName: '指揮系統データ取得',
        success: !!commandStructure && commandStructure.hierarchy.length > 0,
        details: {
          hierarchyCount: commandStructure.hierarchy.length,
          bonusTypes: Object.keys(commandStructure.bonuses)
        }
      });

      // 8. レガシー互換性テスト
      const playerUnits = armyManager.getPlayerStartingUnits();
      const enemyUnits = armyManager.getEnemyStartingUnits();
      results.push({
        testName: 'レガシー互換性',
        success: playerUnits.length > 0 && enemyUnits.length > 0,
        details: {
          playerCount: playerUnits.length,
          enemyCount: enemyUnits.length,
          playerExample: playerUnits[0] ? {
            id: playerUnits[0].id,
            name: playerUnits[0].name,
            type: playerUnits[0].type,
            faction: playerUnits[0].faction
          } : null
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
    runTests();
  }, []);

  const successCount = testResults.filter(r => r.success).length;
  const totalCount = testResults.length;

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>軍組織システム テスト結果</h2>
      
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
                overflow: 'auto'
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
          onClick={runTests}
          disabled={isRunning}
          style={{
            padding: '10px 20px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isRunning ? 'not-allowed' : 'pointer'
          }}
        >
          {isRunning ? 'テスト実行中...' : 'テスト再実行'}
        </button>
      </div>
    </div>
  );
};