# ユニット補給システム HP強制変更問題 - 要件仕様書

## 1. プロジェクト概要
**プロジェクト名**: hex-strategy-ww2 ユニット補給システム修正
**対象システム**: React + TypeScript ヘックス戦略ゲーム
**作成日**: 2025-08-06
**要求仕様バージョン**: v1.0

## 2. Purpose Statement（目的）
ユニットが都市に置かれた際にHPが強制的に10に設定される不具合を修正し、正常な補給システムの動作を実現する。

## 3. Context and Background（背景）
### 現在の実装状況
- **補給システム実装場所**: `/Commander/src/hooks/useGameLogic.ts` の `handleEndTurn` 関数（198-246行）
- **補給パラメータ**: 
  - HP回復量：`UNIT_HEAL_HP = 2` (`/Commander/src/config/constants.ts`)
  - 燃料補給：`UNIT_HEAL_FUEL_FULL = true`
- **対象地形**: City、Capital、Airport、Port（占領可能地形）
- **補給条件**: ユニットが自チーム所有の都市系地形にいる場合、ターン開始時に補給

### 報告された問題
**問題の症状**: 「ユニットが都市に置かれたときに強制的にユニットのHPが10になってしまう」

### 想定される原因
1. **都市HPとユニットHPの混同**: 都市のHP（maxHp: 10）がユニットのHPに誤って適用
2. **初期化処理の不具合**: ユニット作成時やマップ読み込み時のHP設定エラー
3. **補給処理の計算エラー**: ターン終了時の補給計算での意図しない値設定
4. **戦闘システムの副作用**: 戦闘後の処理でのHP値破損

## 4. Core Requirements（コア要求事項）

### 4.1 問題の詳細分析と特定
#### 4.1.1 HP強制変更問題の根本原因特定
- **調査対象**: ユニットが都市配置時にHP=10になる具体的なコードパス
- **詳細仕様**:
  - ユニット配置・移動時のHP値追跡ログ実装
  - 都市属性（hp: 10, maxHp: 10）とユニット属性の分離確認
  - 補給処理におけるHP計算ロジックの検証
  - 戦闘システムとの相互作用の調査

#### 4.1.2 正常な補給システムの仕様確認
- **期待される動作**: 都市配置時はHP変更なし、ターン開始時に+2回復
- **詳細仕様**:
  - 現在HP維持：都市配置・移動時は現在HPを保持
  - 補給回復：ターン開始時に`UNIT_HEAL_HP`（2）だけ回復
  - 上限制御：回復後HPは`unit.maxHp`を超えない
  - 燃料補給：`UNIT_HEAL_FUEL_FULL`に従い燃料を最大値まで回復

### 4.2 修正実装要件
#### 4.2.1 HP管理システムの安全化
- **HP変更の追跡機能**: すべてのHP変更操作にログとバリデーション追加
- **型安全性の強化**: ユニットHPと都市HPの明確な分離
- **不正値の検出**: HP値の異常変更を検出・防止する仕組み

#### 4.2.2 補給処理の修正
- **計算ロジックの見直し**: `Math.min(u.maxHp, u.hp + UNIT_HEAL_HP)`の安全実装
- **エラーハンドリング**: 補給処理での例外的な値変更を防ぐ
- **テストケース**: 各ユニットタイプでの補給動作検証

### 4.3 デバッグ・診断システム
- **HP変更ログ**: ユニットHP変更時の詳細ログ出力
- **システム診断**: 問題発生時の状況再現機能
- **バリデーション**: HP値の妥当性チェック機能

## 5. Technical Specifications（技術仕様）

### 5.1 HP管理システムの修正

#### 5.1.1 HP変更追跡システム
```typescript
// HP変更のログとバリデーション
interface HPChangeEvent {
  unitId: string;
  unitType: UnitType;
  oldHp: number;
  newHp: number;
  maxHp: number;
  cause: 'combat' | 'healing' | 'initialization' | 'unknown';
  timestamp: number;
  stackTrace?: string;
}

// HP変更の安全な実行
const safeUpdateUnitHP = (unit: Unit, newHp: number, cause: HPChangeCause): Unit => {
  if (newHp < 0 || newHp > unit.maxHp) {
    console.error(`Invalid HP value: ${newHp} for unit ${unit.id}`);
    return unit;
  }
  
  logHPChange({
    unitId: unit.id,
    unitType: unit.type,
    oldHp: unit.hp,
    newHp,
    maxHp: unit.maxHp,
    cause,
    timestamp: Date.now()
  });
  
  return { ...unit, hp: newHp };
};
```

#### 5.1.2 補給処理の安全実装
```typescript
// 安全な補給処理
const applySafeHealing = (unit: Unit, healAmount: number): Unit => {
  const healedHp = Math.min(unit.maxHp, unit.hp + healAmount);
  
  // 異常値チェック
  if (healedHp < unit.hp) {
    console.error(`Healing calculation error for unit ${unit.id}`);
    return unit;
  }
  
  return safeUpdateUnitHP(unit, healedHp, 'healing');
};
```

### 5.2 修正対象の具体的実装

#### 5.2.1 handleEndTurn関数の補給処理修正
```typescript
// 修正前の問題のあるコード（推測）
const unitsWithHealing = unitsWithReset.map(u => {
  if (u.team === nextTeam) {
    const unitTile = boardLayout.get(coordToString(u));
    if (unitTile && isCapturableTerrain(unitTile.terrain) && unitTile.owner === u.team) {
      // 問題：ここで意図しないHP設定が発生している可能性
      return applySafeHealing(u, UNIT_HEAL_HP);
    }
  }
  return u;
});
```

#### 5.2.2 ユニット作成・読み込み処理の修正
```typescript
// createUnit関数の安全化
const createUnit = (id: string, type: UnitType, team: Team, x: number = 0, y: number = 0): Unit => {
  try {
    const unitStats = getUnitStatsFromJSON(type, team);
    const weapons = getUnitWeaponsFromJSON(type, team);
    
    const unit: Unit = {
      id, type, team, faction: team, branch: '陸',
      category: getUnitCategory(type), x, y,
      hp: unitStats.maxHp,  // 初期HPは必ずmaxHpに設定
      maxHp: unitStats.maxHp,
      // 他のプロパティ...
    };
    
    // HP値の妥当性チェック
    if (unit.hp <= 0 || unit.hp > unit.maxHp) {
      console.error(`Invalid HP in createUnit: ${unit.hp}/${unit.maxHp}`);
    }
    
    return unit;
  } catch (error) {
    console.error('Failed to create unit from JSON:', error);
    return createUnitFallback(id, type, team, x, y);
  }
};
```

#### 5.2.3 loadMapFromJSON関数の安全化
```typescript
// マップ読み込み時のHP値検証
const loadMapFromJSON = (mapData: MapData): { board: BoardLayout; units: Unit[] } => {
  const board: BoardLayout = new Map();
  
  // タイル読み込み（都市HPとユニットHPの分離確認）
  mapData.board.tiles.forEach(tile => {
    board.set(coordToString(tile), tile);
  });
  
  // ユニット読み込み時のHP値検証
  const units: Unit[] = mapData.units.map(unitData => {
    const baseUnit = createUnit(unitData.id, unitData.type, unitData.team, unitData.x, unitData.y);
    
    const loadedUnit = {
      ...baseUnit,
      ...unitData,
      weapons: baseUnit.weapons // faction-specific weapons保持
    };
    
    // HP値の妥当性チェック
    if (loadedUnit.hp <= 0 || loadedUnit.hp > loadedUnit.maxHp) {
      console.warn(`Invalid HP in loaded unit ${loadedUnit.id}: ${loadedUnit.hp}/${loadedUnit.maxHp}`);
      loadedUnit.hp = Math.min(Math.max(1, loadedUnit.hp), loadedUnit.maxHp);
    }
    
    return loadedUnit;
  });
  
  return { board, units };
};
```

### 5.3 デバッグ・診断機能

#### 5.3.1 HP変更監視システム
```typescript
// グローバルなHP変更監視
const HPChangeLogger = {
  changes: [] as HPChangeEvent[],
  
  log: (event: HPChangeEvent) => {
    console.log(`HP Change: ${event.unitType}(${event.unitId}) ${event.oldHp}->${event.newHp} [${event.cause}]`);
    HPChangeLogger.changes.push(event);
  },
  
  getChangesFor: (unitId: string) => {
    return HPChangeLogger.changes.filter(c => c.unitId === unitId);
  },
  
  detectSuspiciousChange: (event: HPChangeEvent): boolean => {
    // HP=10への強制変更を検出
    return event.newHp === 10 && event.oldHp !== 10 && event.cause !== 'initialization';
  }
};
```

#### 5.3.2 デバッグ用UI表示
- 開発モードでの詳細HP変更ログ表示
- ユニット選択時のHP変更履歴表示
- 補給処理の詳細ステップ表示

## 6. Implementation Priority（実装優先度）

### Phase 1: 高優先度（必須実装）
1. データ構造拡張（GameStatus, VictoryResult型追加）
2. checkWinCondition関数の首都占領ロジック追加
3. 勝利条件優先順位の修正

### Phase 2: 中優先度（重要実装）
1. ターン制限システムの実装
2. 攻守役割システムの実装
3. マップJSONフォーマットの拡張

### Phase 3: 低優先度（改善実装）
1. UI/UX改善（勝利条件進捗表示）
2. ResultScreen詳細情報表示
3. エラーハンドリング強化

## 7. Acceptance Criteria（受け入れ条件）

### 7.1 機能テスト
1. **首都占領テスト**
   - [ ] 単一首都マップで首都占領時に即座勝利
   - [ ] 複数首都マップですべて占領時に勝利
   - [ ] 一部首都占領では勝利しない
   
2. **ターン制限テスト**
   - [ ] 設定ターン数到達で守り側勝利
   - [ ] ターン制限未設定時は無制限
   - [ ] 制限前に他の勝利条件達成時は優先

3. **勝利条件優先度テスト**
   - [ ] 敵軍全滅が最優先
   - [ ] 首都占領が全都市占領より優先
   - [ ] ターン制限が最低優先度

### 7.2 データ整合性テスト
1. **マップデータ**
   - [ ] 既存マップで正常動作
   - [ ] 新形式マップで正常動作
   - [ ] 不正データでエラーハンドリング

2. **ゲーム状態管理**
   - [ ] 勝利判定後のゲーム状態が正しい
   - [ ] 勝利者情報が正確
   - [ ] 勝利条件詳細が正しく記録

## 8. Dependencies and Constraints（依存関係と制約）

### 8.1 技術的依存関係
- React Hook (useGameLogic.ts) の既存実装に依存
- マップJSON形式の後方互換性必須
- 既存のユニット移動・戦闘システムとの整合性

### 8.2 制約事項
- 既存のゲームバランスを大きく変更しない
- 現在のマップデータ形式との互換性維持
- パフォーマンスに影響を与えない軽量実装

### 8.3 リスク要因
- 複雑な勝利条件判定による処理負荷増加
- UI情報量増加によるユーザビリティ低下
- マップ設計時の勝利条件バランス調整の難しさ

## 9. Testing Strategy（テスト戦略）

### 9.1 ユニットテスト
- checkWinCondition関数の各勝利条件分岐
- ターン制限判定ロジック
- データ型変換・マイグレーション

### 9.2 統合テスト
- 実際のマップデータを使用した勝利条件テスト
- UI表示とゲームロジックの連携テスト
- セーブ・ロード機能との整合性テスト

### 9.3 受け入れテスト
- 複数シナリオでの実際のゲームプレイテスト
- ユーザビリティテスト
- パフォーマンステスト

## 10. Success Metrics（成功指標）

### 10.1 機能的成功指標
- すべての勝利条件が正しく判定される
- ゲームバランスが適切に保たれる
- UI情報が分かりやすく表示される

### 10.2 技術的成功指標
- 既存コードへの影響が最小限
- テストカバレッジ90%以上
- パフォーマンス低下なし

### 10.3 ユーザー体験成功指標
- 戦略的選択肢の増加
- ゲームプレイの多様性向上
- 学習コストの最小化

---

## 補足情報

### 対象ファイル一覧
- `/Commander/src/hooks/useGameLogic.ts` （メイン実装）
- `/Commander/src/types/index.ts` （型定義拡張）
- `/Commander/public/data/maps/*.json` （マップデータ拡張）
- `/Commander/src/screens/ResultScreen.tsx` （結果表示改善）

### 設計原則
1. **後方互換性**: 既存マップ・セーブデータとの互換性維持
2. **拡張性**: 将来的な勝利条件追加を考慮した設計
3. **可読性**: コードの理解しやすさと保守性重視
4. **テスト容易性**: 各機能が独立してテスト可能

この要求仕様書に基づいて、段階的な実装を行うことで、安全かつ効果的に勝利条件システムを拡張できます。