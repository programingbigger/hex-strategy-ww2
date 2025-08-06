# 勝利条件システム拡張要求仕様書

## 1. プロジェクト概要
**プロジェクト名**: hex-strategy-ww2 勝利条件システム拡張
**対象システム**: React + TypeScript ヘックス戦略ゲーム
**作成日**: 2025-08-06
**要求仕様バージョン**: v1.0

## 2. Purpose Statement（目的）
現在の勝利条件システム（敵軍全滅、全都市占領）を拡張し、多様な戦略的勝利条件を追加することで、ゲームプレイの戦略性と再現性を向上させる。

## 3. Context and Background（背景）
### 現在の実装状況
- **既存勝利条件**: 
  - 敵軍全滅（優先度：高）
  - 全都市占領（優先度：低）
- **実装場所**: `/Commander/src/hooks/useGameLogic.ts` の `checkWinCondition` 関数（271-299行）
- **マップデータ形式**: JSON形式でCapitalタイプの都市が存在（例：test_map_1.jsonに2つの首都）
- **チーム定義**: Blue軍、Red軍

### 現在の問題点
1. 勝利条件が限定的で戦略バリエーションが少ない
2. ターン制限による時間的圧力がない
3. 首都という重要拠点の戦略的価値が十分活用されていない
4. 攻守の役割分担が明確でない

## 4. Core Requirements（コア要求事項）

### 4.1 新規勝利条件の実装
#### 4.1.1 首都占領勝利
- **条件**: 敵の首都（Capitalタイプ地形）をすべて占領
- **詳細仕様**:
  - マップ上の首都が1つの場合：その首都を占領したら即座にゲーム勝利
  - マップ上の首都が複数の場合：すべての敵首都を占領する必要
  - 首都占領は`Infantry`ユニットによる占領（capture）行動で実現
  - 首都のHP=0になった時点で占領完了とする

#### 4.1.2 ターン制限勝利
- **条件**: 設定されたターン数経過後の判定
- **詳細仕様**:
  - 攻め側（デフォルト：Blue軍）：制限ターン到達でゲームオーバー
  - 守り側（デフォルト：Red軍）：制限ターン到達で勝利
  - ターン制限値はマップごとに設定可能
  - ターン制限は `gameStatus.turnLimit` として JSON に追加

### 4.2 勝利条件優先順位の変更
**新しい優先順位**:
1. **敵軍全滅** (最高優先度)
2. **首都占領** (高優先度)
3. **全都市占領** (中優先度)
4. **ターン制限** (最低優先度、他の条件が満たされない場合のみ)

### 4.3 攻守役割システム
- **設定方法**: マップ/シナリオごとに可変設定
- **デフォルト設定**: Blue軍=攻め側、Red軍=守り側
- **設定場所**: `gameStatus.attackingTeam` として JSON に追加

## 5. Technical Specifications（技術仕様）

### 5.1 データ構造変更

#### 5.1.1 MapData型拡張
```typescript
export interface GameStatus {
  gameState: 'playing' | 'gameOver';
  turn: number;
  activeTeam: Team;
  winner: Team | null;
  weather: WeatherType;
  weatherDuration: number;
  // 新規追加
  turnLimit?: number;           // ターン制限（未設定の場合は無制限）
  attackingTeam: Team;          // 攻め側チーム
  defendingTeam: Team;          // 守り側チーム
}
```

#### 5.1.2 勝利条件タイプ定義
```typescript
export type VictoryCondition = 
  | 'enemy_elimination'    // 敵軍全滅
  | 'capital_capture'      // 首都占領
  | 'total_domination'     // 全都市占領
  | 'turn_limit';          // ターン制限

export interface VictoryResult {
  condition: VictoryCondition;
  winner: Team;
  turn: number;
  details?: string;        // 勝利条件詳細
}
```

### 5.2 機能実装

#### 5.2.1 checkWinCondition関数の拡張
```typescript
const checkWinCondition = useCallback((currentUnits: Unit[], currentBoard: BoardLayout) => {
  const blueUnits = currentUnits.filter(u => u.team === 'Blue');
  const redUnits = currentUnits.filter(u => u.team === 'Red');

  // 1. 敵軍全滅チェック（最高優先度）
  if (redUnits.length === 0) {
    setGameState('gameOver');
    setWinner('Blue');
    return;
  }
  if (blueUnits.length === 0) {
    setGameState('gameOver');
    setWinner('Red');
    return;
  }

  // 2. 首都占領チェック（高優先度）
  const capitals = Array.from(currentBoard.values()).filter(t => t.terrain === 'Capital');
  if (capitals.length > 0) {
    const blueCapitals = capitals.filter(c => c.owner === 'Blue');
    const redCapitals = capitals.filter(c => c.owner === 'Red');
    
    if (blueCapitals.length === capitals.length) {
      setGameState('gameOver');
      setWinner('Blue');
      return;
    } else if (redCapitals.length === capitals.length) {
      setGameState('gameOver');
      setWinner('Red');
      return;
    }
  }

  // 3. 全都市占領チェック（中優先度）
  const cities = Array.from(currentBoard.values()).filter(t => isCapturableTerrain(t.terrain));
  const blueCities = cities.filter(c => c.owner === 'Blue').length;
  const redCities = cities.filter(c => c.owner === 'Red').length;

  if (cities.length > 0) {
    if (blueCities === cities.length) {
      setGameState('gameOver');
      setWinner('Blue');
    } else if (redCities === cities.length) {
      setGameState('gameOver');
      setWinner('Red');
    }
  }

  // 4. ターン制限チェック（最低優先度）
  // handleEndTurn関数内で実装
}, []);
```

#### 5.2.2 ターン制限チェック機能
```typescript
// handleEndTurn関数内に追加
if (nextTeam === 'Blue') {
  const newTurn = turn + 1;
  setTurn(newTurn);
  
  // ターン制限チェック
  if (turnLimit && newTurn > turnLimit) {
    setGameState('gameOver');
    setWinner(defendingTeam);
    return;
  }
}
```

#### 5.2.3 首都識別関数の拡張
```typescript
const isCapitalTerrain = (terrain: string): boolean => {
  return terrain === 'Capital';
};

const getCapitals = (board: BoardLayout): Tile[] => {
  return Array.from(board.values()).filter(t => isCapitalTerrain(t.terrain));
};
```

### 5.3 UI/UX変更

#### 5.3.1 ゲーム情報表示の拡張
- ターン制限がある場合、残りターン数を表示
- 現在の攻守役割を表示
- 勝利条件の進捗状況を表示

#### 5.3.2 ResultScreen改善
```typescript
interface VictoryDetails {
  condition: VictoryCondition;
  winner: Team;
  turn: number;
  turnLimit?: number;
  details: string;
}
```

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