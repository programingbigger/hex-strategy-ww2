// テスト実行スクリプト
import { runArmyManagerTests } from './armyManager.test';

console.log('軍組織システム テスト実行開始...\n');

try {
  // ArmyManagerテスト実行
  const armyResults = runArmyManagerTests();
  
  console.log('\n=== テスト結果サマリー ===');
  console.log('ArmyManager Tests:', armyResults.success ? '✅ PASS' : '❌ FAIL');
  
  if (armyResults.testResults) {
    Object.entries(armyResults.testResults).forEach(([testName, result]) => {
      console.log(`  ${testName}: ${result ? '✅' : '❌'}`);
    });
  }
  
  console.log('\n=== 全テスト完了 ===');
  
} catch (error) {
  console.error('テスト実行中にエラーが発生しました:', error);
}