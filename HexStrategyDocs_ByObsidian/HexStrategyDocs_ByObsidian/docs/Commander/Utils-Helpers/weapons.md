# weapons.ts - 兵装関連ユーティリティ

`Commander/src/utils/weapons.ts` は、ユニットの兵装に関する操作やロジックを管理するユーティリティファイルです。弾薬の確認、射程内の武器の取得、反撃時の武器選択など、戦闘における兵装関連の計算を担います。

## 主要機能

- `getAvailableWeapons(unit)`: ユニットが持つ兵装のうち、弾薬が残っているもの（使用可能な兵装）のリストを返します。

- `getWeaponsInRange(unit, targetDistance)`: 使用可能な兵装の中から、指定した距離（`targetDistance`）で攻撃できる兵装のリストを返します。

- `consumeAmmunition(unit, weaponId)`: 指定した兵装（`weaponId`）の弾薬を1つ消費した、新しいユニットオブジェクトを返します。

- `selectCounterAttackWeapon(unit, attacker)`: ユニットが反撃する際に、どの兵装を使用すべきかを決定します。ユニットの種類（`unit.type`）に応じて、特定のルールに基づき最適な兵装を選択します。
  - **戦車(Tank)**: 主砲を優先。弾切れの場合は他の兵装を使用。
  - **装甲車(ArmoredCar)**: 必ず機銃を使用。
  - **対戦車砲(AntiTank)**: 相手が装甲ユニットなら主砲、歩兵ならライフル、と使い分ける。
  - **その他**: 基本的にリストの最初の使用可能な兵装を選択。

- `getMaxAttackRange(unit)`: ユニットが持つ使用可能な兵装の最大射程を返します。

- `getMinAttackRange(unit)`: ユニットが持つ使用可能な兵装の最小射程を返します。

- `hasAnyAmmunition(unit)`: ユニットが何らかの兵装で弾薬を1つ以上持っているかどうかを返します。

- `getWeaponById(unit, weaponId)`: ユニットの兵装リストから、指定したIDの兵装オブジェクトを取得します。

## タグ
#WeaponUtils #Combat #Ammunition #CounterAttack
