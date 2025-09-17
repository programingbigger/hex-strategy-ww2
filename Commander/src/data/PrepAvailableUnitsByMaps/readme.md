# これは何？
マップごとに戦闘準備で利用できるユニットを制限するためのjsonファイルを作成する

# 命名規則
{マップ名}.json

# jsonファイルの中身
```
{
    mode: "" # scenario or story or tutorial
    , map_name: "" # Commander/public/data/maps配下にあるマップ名と一致させる
    , units : [
        {} # 適当にいい感じに定義して欲しい。ここに全てを記載するのではない。ユニットの詳細情報は、Commander/src/data/armyOrganization.jsonで管理しているので、ここではidや、どこの軍かを定義し、Commander/src/data/armyOrganization.jsonを参照・付け合わせできるようにする。
        , {}
        , {}
    ]
}
```