import { useCallback } from 'react';
import { Unit } from '../../types';
import { getNeighbors } from '../../utils/map';

/**
 * 補給アクション（Pull型）のロジック
 *
 * - 受給側ユニットが隣接する補給ユニットから物資を引き出す
 * - フリーアクション: moved / attacked を変更しない
 * - 供給元は自動選択（物資量が最大のユニット）
 * - 回復量 = Min(必要量, 供給可能量)
 *   必要量 = 弾薬減少分の合計 + 燃料減少分
 */

// 補給ユニットかどうかを判定する
export const isSupplyUnit = (unit: Unit): boolean => {
  return unit.type === 'SupplyWagon' || unit.type === 'SupplyTruck';
};

export interface SupplyActionsHook {
  /** 補給アクションが発動可能かどうかを返す */
  canSupply: (unit: Unit, allUnits: Unit[]) => boolean;
  /** 補給アクションを実行し、更新後のユニット配列を返す。実行できない場合は null を返す */
  executeSupply: (receiverUnit: Unit, allUnits: Unit[]) => Unit[] | null;
}

interface SupplyActionsDeps {
  units: Unit[];
  setUnits: (units: Unit[]) => void;
}

export const useSupplyActions = (deps: SupplyActionsDeps): SupplyActionsHook => {
  const { setUnits } = deps;

  /**
   * 隣接する友軍補給ユニットを探し、物資量が最大のものを返す
   */
  const findBestSupplySource = useCallback((receiver: Unit, allUnits: Unit[]): Unit | null => {
    const neighbors = getNeighbors({ x: receiver.x, y: receiver.y });

    // 隣接ヘックス内の友軍補給ユニットを収集
    const candidates = allUnits.filter(u =>
      isSupplyUnit(u) &&
      u.team === receiver.team &&
      (u.supplyStock ?? 0) > 0 &&
      neighbors.some(n => n.x === u.x && n.y === u.y)
    );

    if (candidates.length === 0) return null;

    // 物資量が最大のものを選択
    return candidates.reduce((best, current) =>
      (current.supplyStock ?? 0) > (best.supplyStock ?? 0) ? current : best
    );
  }, []);

  /**
   * 受給側ユニットに「需要」があるか判定する
   * 需要: 弾薬または燃料が最大値未満
   */
  const hasDemand = useCallback((unit: Unit): boolean => {
    // 燃料の需要
    if (unit.maxFuel && unit.maxFuel > 0 && unit.fuel < unit.maxFuel) {
      return true;
    }
    // 弾薬の需要: isSupplyKit でない武器の弾薬が減っている
    if (unit.weapons && Array.isArray(unit.weapons)) {
      for (const w of unit.weapons) {
        if (w.isSupplyKit) continue;
        if (w.ammunition < w.maxAmmunition) return true;
      }
    }
    return false;
  }, []);

  const canSupply = useCallback((unit: Unit, allUnits: Unit[]): boolean => {
    // 補給ユニット自身は補給アクションの受給側にならない
    if (isSupplyUnit(unit)) return false;
    // 需要がない場合は不可
    if (!hasDemand(unit)) return false;
    // 隣接する友軍補給ユニットがある
    const source = findBestSupplySource(unit, allUnits);
    return source !== null;
  }, [hasDemand, findBestSupplySource]);

  const executeSupply = useCallback((receiverUnit: Unit, allUnits: Unit[]): Unit[] | null => {
    if (!canSupply(receiverUnit, allUnits)) return null;

    const source = findBestSupplySource(receiverUnit, allUnits);
    if (!source) return null;

    // --- 必要量の計算 ---
    let totalNeeded = 0;

    // 燃料の不足分
    const fuelNeeded = (receiverUnit.maxFuel || 0) - receiverUnit.fuel;
    totalNeeded += fuelNeeded;

    // 弾薬の不足分（isSupplyKit 以外の武器）
    let ammoNeeded = 0;
    if (receiverUnit.weapons && Array.isArray(receiverUnit.weapons)) {
      for (const w of receiverUnit.weapons) {
        if (w.isSupplyKit) continue;
        ammoNeeded += w.maxAmmunition - w.ammunition;
      }
    }
    totalNeeded += ammoNeeded;

    // --- 実際の回復量 ---
    const supplyAvailable = source.supplyStock ?? 0;
    const actualSupply = Math.min(totalNeeded, supplyAvailable);

    if (actualSupply <= 0) return null;

    // --- 回復の分配 ---
    // 燃料を先に回復し、残りを弾薬に充当する
    let remaining = actualSupply;

    let newFuel = receiverUnit.fuel;
    const fuelRestore = Math.min(fuelNeeded, remaining);
    newFuel += fuelRestore;
    remaining -= fuelRestore;

    // 弾薬の回復（各武器に均等に分配するのではなく、順番に埋める）
    let newWeapons = receiverUnit.weapons;
    if (remaining > 0 && newWeapons && Array.isArray(newWeapons)) {
      newWeapons = newWeapons.map(w => {
        if (w.isSupplyKit || remaining <= 0) return w;
        const deficit = w.maxAmmunition - w.ammunition;
        const restore = Math.min(deficit, remaining);
        remaining -= restore;
        return { ...w, ammunition: w.ammunition + restore };
      });
    }

    // --- ユニット配列の更新 ---
    const updatedUnits = allUnits.map(u => {
      if (u.id === receiverUnit.id) {
        return {
          ...u,
          fuel: newFuel,
          weapons: newWeapons,
          // フリーアクション: moved / attacked は変更しない
        };
      }
      if (u.id === source.id) {
        return {
          ...u,
          supplyStock: (u.supplyStock ?? 0) - (actualSupply - remaining),
          // フリーアクション: 供給側も行動終了にならない
        };
      }
      return u;
    });

    console.log('📦 Supply Action:', {
      receiver: { id: receiverUnit.id, type: receiverUnit.type },
      source: { id: source.id, type: source.type, stockBefore: source.supplyStock },
      fuelRestore: fuelRestore,
      ammoRestore: actualSupply - fuelRestore,
      totalSupplied: actualSupply - remaining,
      stockAfter: (source.supplyStock ?? 0) - (actualSupply - remaining)
    });

    return updatedUnits;
  }, [canSupply, findBestSupplySource]);

  return {
    canSupply,
    executeSupply,
  };
};
