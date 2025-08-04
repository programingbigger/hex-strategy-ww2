// ArmyManager機能テスト
import { armyManager } from '../data/units';
import { Faction, MilitaryBranch, UnitCategory } from '../types';

// テスト用のモック実装
const runArmyManagerTests = () => {
  console.log('=== ArmyManager 機能テスト開始 ===');
  
  // 1. シングルトンインスタンスのテスト
  console.log('\n1. シングルトンインスタンステスト');
  const instance1 = armyManager;
  console.log('インスタンス取得成功:', !!instance1);
  
  // 2. ファクション情報取得テスト
  console.log('\n2. ファクション情報取得テスト');
  const blueInfo = armyManager.getFactionInfo('Blue');
  const redInfo = armyManager.getFactionInfo('Red');
  console.log('Blue陣営名:', blueInfo?.name);
  console.log('Red陣営名:', redInfo?.name);
  
  // 3. 軍種取得テスト
  console.log('\n3. 軍種取得テスト');
  const blueBranches = armyManager.getBranches('Blue');
  const redBranches = armyManager.getBranches('Red');
  console.log('Blue軍種:', blueBranches);
  console.log('Red軍種:', redBranches);
  
  // 4. 兵科取得テスト
  console.log('\n4. 兵科取得テスト');
  const landCategories = armyManager.getCategories('Blue', '陸');
  console.log('陸軍兵科:', landCategories);
  
  // 5. ユニットテンプレート取得テスト
  console.log('\n5. ユニットテンプレート取得テスト');
  const allBlueUnits = armyManager.getUnitTemplatesBy('Blue');
  const blueLandUnits = armyManager.getUnitTemplatesBy('Blue', '陸');
  const blueInfantry = armyManager.getUnitTemplatesBy('Blue', '陸', 'infantry');
  
  console.log('Blue全ユニット数:', allBlueUnits.length);
  console.log('Blue陸軍ユニット数:', blueLandUnits.length);
  console.log('Blue歩兵ユニット数:', blueInfantry.length);
  
  if (blueInfantry.length > 0) {
    const infantryTemplate = blueInfantry[0];
    console.log('歩兵テンプレート例:', {
      id: infantryTemplate.id,
      name: infantryTemplate.name,
      type: infantryTemplate.type,
      branch: infantryTemplate.branch,
      category: infantryTemplate.category
    });
  }
  
  // 6. ユニット作成テスト
  console.log('\n6. ユニット作成テスト');
  const newUnit = armyManager.createUnitFromTemplate('blue-infantry-standard', 'test-unit-1', 5, 5);
  if (newUnit) {
    console.log('ユニット作成成功:', {
      id: newUnit.id,
      name: newUnit.name,
      type: newUnit.type,
      team: newUnit.team,
      faction: newUnit.faction,
      branch: newUnit.branch,
      category: newUnit.category,
      position: { x: newUnit.x, y: newUnit.y },
      stats: {
        hp: newUnit.hp,
        maxHp: newUnit.maxHp,
        attack: newUnit.attack,
        defense: newUnit.defense,
        movement: newUnit.movement
      },
      weaponsCount: newUnit.weapons.length
    });
  } else {
    console.log('ユニット作成失敗');
  }
  
  // 7. 指揮系統データ取得テスト
  console.log('\n7. 指揮系統データテスト');
  const commandStructure = armyManager.getCommandStructure();
  console.log('指揮階層:', commandStructure.hierarchy);
  console.log('ボーナス種類:', Object.keys(commandStructure.bonuses));
  
  // 8. レガシー互換性テスト
  console.log('\n8. レガシー互換性テスト');
  const playerUnits = armyManager.getPlayerStartingUnits();
  const enemyUnits = armyManager.getEnemyStartingUnits();
  console.log('プレイヤー開始ユニット数:', playerUnits.length);
  console.log('敵開始ユニット数:', enemyUnits.length);
  
  if (playerUnits.length > 0) {
    const firstPlayerUnit = playerUnits[0];
    console.log('プレイヤーユニット例:', {
      id: firstPlayerUnit.id,
      name: firstPlayerUnit.name,
      type: firstPlayerUnit.type,
      team: firstPlayerUnit.team,
      faction: firstPlayerUnit.faction,
      branch: firstPlayerUnit.branch
    });
  }
  
  console.log('\n=== ArmyManager 機能テスト完了 ===');
  
  return {
    success: true,
    testResults: {
      singletonInstance: !!instance1,
      factionData: !!(blueInfo && redInfo),
      branchData: blueBranches.length > 0 && redBranches.length > 0,
      categoryData: landCategories.length > 0,
      unitTemplates: allBlueUnits.length > 0,
      unitCreation: !!newUnit,
      commandStructure: !!commandStructure,
      legacyCompatibility: playerUnits.length > 0 && enemyUnits.length > 0
    }
  };
};

export { runArmyManagerTests };