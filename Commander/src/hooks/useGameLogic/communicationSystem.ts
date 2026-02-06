/**
 * 水晶同期通信網システム (Crystal Link Communication System)
 *
 * アストリア軍専用の通信システム。信号源（Hub）からBFS探索で通信網を構築し、
 * 各ユニットの同期状態を判定する。
 */

import { Unit } from '../../types';

/**
 * 2つの座標間のhex距離を計算する
 * offset座標系でのマンハッタン距離に基づく計算
 */
export const calculateHexDistance = (
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number => {
  // offset座標系のため、まずcube座標系に変換
  const col1 = x1;
  const row1 = y1;
  const col2 = x2;
  const row2 = y2;

  // offset座標からcube座標への変換
  const q1 = col1;
  const r1 = row1 - Math.floor(col1 / 2);
  const s1 = -q1 - r1;

  const q2 = col2;
  const r2 = row2 - Math.floor(col2 / 2);
  const s2 = -q2 - r2;

  // cube座標系でのマンハッタン距離
  return (Math.abs(q1 - q2) + Math.abs(r1 - r2) + Math.abs(s1 - s2)) / 2;
};

/**
 * 指定したユニットが範囲内にいるかチェック
 */
export const isUnitInRange = (
  sourceUnit: Unit,
  targetUnit: Unit,
  range: number
): boolean => {
  const distance = calculateHexDistance(
    sourceUnit.x,
    sourceUnit.y,
    targetUnit.x,
    targetUnit.y
  );
  return distance <= range;
};

/**
 * 通信網の同期状態を更新する（BFS探索ベース）
 *
 * アルゴリズム:
 * 1. アストリア軍の全ユニットを「孤立」状態にリセット
 * 2. 信号源（signalSource=true）をキューに追加し「同期」状態にする
 * 3. BFS探索:
 *    - キューからユニットを取り出す
 *    - そのユニットの範囲内の味方を探す
 *      - 信号源の場合: signalRadius内を同期
 *      - 一般ユニットの場合: relayRadius内を中継
 *    - 未同期の味方を「同期」状態にしてキューに追加
 * 4. キューが空になるまで繰り返す
 *
 * @param units 全ユニット配列
 * @returns 同期状態が更新されたユニット配列
 */
export const updateCommunicationNetwork = (units: Unit[]): Unit[] => {
  // アストリア軍（Blue）のユニットのみ処理
  const blueUnits = units.filter(unit => unit.team === 'Blue');
  const otherUnits = units.filter(unit => unit.team !== 'Blue');

  // Step 1: 全アストリア軍ユニットを孤立状態にリセット
  blueUnits.forEach(unit => {
    unit.isSynced = false;
  });

  // Step 2: 信号源（Hub）を探してキューに追加
  const queue: Unit[] = [];
  const signalSources = blueUnits.filter(unit => unit.signalSource === true);

  signalSources.forEach(source => {
    source.isSynced = true; // 信号源自身は常に同期状態
    queue.push(source);
  });

  // 信号源が1つもない場合は全ユニット孤立状態のまま
  if (signalSources.length === 0) {
    return [...blueUnits, ...otherUnits];
  }

  // Step 3: BFS探索で通信網を構築
  const processed = new Set<string>(); // 処理済みユニットのID

  while (queue.length > 0) {
    const currentUnit = queue.shift()!;
    const currentId = currentUnit.id;

    // 既に処理済みの場合はスキップ
    if (processed.has(currentId)) {
      continue;
    }
    processed.add(currentId);

    // 現在のユニットの有効範囲を決定
    let effectiveRange: number;
    if (currentUnit.signalSource) {
      // 信号源の場合: signalRadiusを使用
      effectiveRange = currentUnit.signalRadius ?? 0;
    } else {
      // 一般ユニット（中継点）の場合: relayRadiusを使用
      effectiveRange = currentUnit.relayRadius ?? 0;
    }

    // 範囲が0以下の場合は中継できない
    if (effectiveRange <= 0) {
      continue;
    }

    // 範囲内の味方ユニットを探して同期状態にする
    blueUnits.forEach(targetUnit => {
      // 自分自身はスキップ
      if (targetUnit.id === currentId) {
        return;
      }

      // 既に同期済みの場合はスキップ
      if (targetUnit.isSynced) {
        return;
      }

      // 範囲内チェック
      if (isUnitInRange(currentUnit, targetUnit, effectiveRange)) {
        // 同期状態にしてキューに追加
        targetUnit.isSynced = true;
        queue.push(targetUnit);
      }
    });
  }

  // 更新されたユニット配列を返す
  return [...blueUnits, ...otherUnits];
};

/**
 * 指定したユニットが同期状態かどうかを判定
 *
 * @param unit チェック対象のユニット
 * @returns true: 同期状態, false: 孤立状態
 */
export const isUnitSynced = (unit: Unit): boolean => {
  // アストリア軍以外は通信システムの対象外
  if (unit.team !== 'Blue') {
    return false;
  }

  return unit.isSynced === true;
};

/**
 * 指定したユニットが信号源（Hub）かどうかを判定
 *
 * @param unit チェック対象のユニット
 * @returns true: 信号源, false: 一般ユニット
 */
export const isSignalSource = (unit: Unit): boolean => {
  return unit.signalSource === true;
};

/**
 * デバッグ用: 通信網の状態をコンソールに出力
 */
export const debugCommunicationNetwork = (units: Unit[]): void => {
  const blueUnits = units.filter(unit => unit.team === 'Blue');
  const syncedCount = blueUnits.filter(unit => unit.isSynced).length;
  const isolatedCount = blueUnits.length - syncedCount;
  const sourcesCount = blueUnits.filter(unit => unit.signalSource).length;

  console.log('=== Communication Network Status ===');
  console.log(`Total Astoria units: ${blueUnits.length}`);
  console.log(`Signal sources: ${sourcesCount}`);
  console.log(`Synced units: ${syncedCount}`);
  console.log(`Isolated units: ${isolatedCount}`);

  blueUnits.forEach(unit => {
    const status = unit.isSynced ? '✓ SYNCED' : '✗ ISOLATED';
    const role = unit.signalSource ? '[HUB]' : '[RELAY]';
    console.log(`  ${role} ${unit.name || unit.type} (${unit.x}, ${unit.y}): ${status}`);
  });
};
