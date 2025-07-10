import type { Unit, TerrainType } from '@/types';

/**
 * 戦闘レポートを生成します。APIを使用せず、事前に定義されたテンプレートに基づいてレポートを作成します。
 * @param attacker 攻撃側のユニット情報
 * @param defender 防御側のユニット情報
 * @param terrain 戦闘が行われた地形
 * @param damage 与えられたダメージ量
 * @returns 生成された戦闘レポートの文字列
 */
export async function generateBattleReport(
  attacker: Unit,
  defender: Unit,
  terrain: TerrainType,
  damage: number
): Promise<string> {
  const defenderRemainingHp = Math.max(0, defender.hp - damage);

  // APIを使用しないロジック
  // ここで、より詳細でバリエーション豊かなレポートを生成するためのロジックを追加できます。
  // 例えば、地形やユニットの種類に応じた分岐処理など。
  let report = '';

  report += `The **${attacker.team} ${attacker.type}** (${attacker.hp}/${attacker.maxHp} HP) advanced upon the **${defender.team} ${defender.type}** (${defender.hp}/${defender.maxHp} HP) entrenched in the **${terrain}**. `;

  if (damage > 0) {
    report += `A fierce exchange erupted, with the attacker dealing **${damage} damage**. `;
    if (defenderRemainingHp <= 0) {
      report += `The ${defender.type} was **decimated**, its forces scattered.`;
    } else {
      report += `The ${defender.type} now stands at **${defenderRemainingHp} HP**, reeling from the impact.`;
    }
  } else {
    report += `Despite the intense engagement, no significant damage was dealt. The ${defender.type} held its ground firmly.`;
  }

  return report;
}