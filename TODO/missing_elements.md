# 概要
以下はコードに関係ない、ユーザーが実装したい内容
以下のコードをすべて実装するわけではない。

# 実装リスト
## マスト
* コードリファクタリング
* UIの改善
    * tutorialの作成
        * 作戦準備
            * 作戦概要
                * 制限ターンがいくつか
                * 勝利条件をチュートリアルごとに整備
        * 戦闘準備
    * BattleScreenのUI
        * 戦闘ログ
            * もうちょい大きくする
        * 詳細パネル
            * ダブルクリックの感度が良すぎて、すぐに表示されてしまう・・・
            * →ダブルクリック機能を削除。
        * ユニットアクションパネル
            * 攻撃アクションボタンの追加
                * 移動と同じような設定にしたい
                * 攻撃ボタンの配置
                * フローは攻撃ボタン→アクションパネルが消える→赤色で攻撃対象を選択→攻撃終了後、ユニットは操作できない状態になる
            * その他ボタンの仕様
                * 工作車や輸送車といった他ユニットが固有に持っているアクションを移動と同じように
                * 他ユニットが固有に持っているアクションボタンを押下→アクションパネルが消える→終了後ユニットが操作できない状態になる
    * 全体的なUIについて
        * 文字のフォントやダイアログボックス、コメントなどが小さい・・・
        * 60代男性が操作するつもりで、もう少しみやすいフォントにする
    * Mode Select
        * もう少しフォントサイズを大きくする
    * Select Mission
        * mapの全体像をもっと全体像が見えるように改修する。
    * Battle Preparation
        * 各ページをもう少しいい感じにする
    * ユニットの画像
        * もっといい感じに、ドット絵方式にする
        * ドット絵を他の生成AIを使用して作成する
* コードリファクタリング
    * indexで余計な武装に対する型定義がされているので修正する
* ユニット
    * ユニットの進化
        * ここのユニットに経験値による進化を与える
        * 進化する際は、都市にユニットが置かれた時
    * ユニットの多様化
        * 補給車ユニットの実装
        * 輸送ユニット
            * ユニットの降車位置について
                * ユニットが置けないところに置けてしまう・・・
                    * 例）対戦車砲が、川という配置できない場所に配置できてしまう
            * 輸送ユニットのHPが削れたら、搭載しているユニットのHPも削れる
            * 細い修正
                * UndoボタンがUndoボタンとして機能していない。
                * red軍の輸送ユニットが、武装がないのにも関わらず、攻撃できるようになっている
                    * おそらく、blue軍と混同している？→攻撃や反撃するときの条件に、武装がない時は攻撃をしない、という条件を付け足すのはどうか？
        * 飛行系ユニット（※ZOCに注意すること）
            * 戦闘機
            * 攻撃機
            * 爆撃機
            * 輸送機
        * 海軍ユニット：後でもいい
            * 駆逐艦
            * 潜水艦
            * 輸送艦
            * 軽巡
            * 重巡
            * 巡洋艦
            * 戦艦
            * 空母
        * ユニットの配置
* ゲームロジック
    * 首都の移動
        * 敵ユニットが自身の生産時点に移動したら、ユニットの生産地点を移動する
    * 増援ロジックの反映
        * 増援する場所のハイライト
        * 増援ロジック
        * 増援を踏まえた、ユニットの配置上限数をどうするか？は未定
    * 軍資金
        * 収入
            * ロジック
                * 収入があまりにも色々とありすぎるので、もっとシンプルにする
        * 費用
            * ユニット
                * 補給：資金に応じて増やすようにする。現在は、固定で+2ずつのため
                    * 弾薬
                    * 燃料
                    * HPの回復
        * 日付のターン制
            * 1日ずつ、刻むようにする
    * 索敵機能の追加
        * **一番最後にする**
    * ZOCの概念を修復
        * 対戦車と砲兵は、ZOCの概念をなくす。なぜならば、移動が1しかないため。
        * できていない。直っていない
    * マップの多様化
        * 様々な地形を加える
            * 岩礁
            * 荒地
    * 勝利条件の多様化
* 天候
    * 霧の実装
        * 索敵が皆1になる。それ以外はCloudyと同じ。
        * つまり、Cloudyに全ユニットの索敵が1になるように設定する
    * 月ごとの天候の効果を設定する
    * 天候効果の拡充
    * 以下はアンベース
        *   **天候効果の拡充:**
            *   現在は晴れ、雨、大雨のみですが、霧、雪、砂嵐などを追加し、視界や移動、攻撃命中率に影響を与えることで、戦況がよりダイナミックに変化します。
            *   霧は視界を狭め、奇襲を可能にします。雪は移動コストを増加させ、砂嵐は全ユニットの命中率を低下させます。
        * 拡充までのステップ
            * 天候を設定する
            * 視界（戦場の霧）ロジックを入れる
            * まとめてやろうとしない→まずは、ユーザーが天候とその時の移動コスト・命中率・視界をどのようにしたいのか言語化する
            * 上記ステップ3の実装を、一つずつ行う。一気にやろうとすると、崩れやすい
*   **サウンド・演出の強化:**
    *   BGMや効果音の追加・多様化
        * ボタン押下
        * BGMなど
        * 洗い出しを生成AIに行わせる

## プラスアルファ
*   **マップエディタ:**
    *   プレイヤーが自由にマップを作成し、共有できる機能です。コミュニティの活性化に繋がります。
*   **実績・リワードシステム:**
    *   特定の条件を達成すると実績が解除されたり、リワード（新しいユニットやシナリオなど）がもらえるシステムです。プレイヤーのモチベーション維持に貢献します。
*   **キャンペーンモード・シナリオの充実:**
    *   単発のマップだけでなく、連続したシナリオで構成されるキャンペーンモードがあれば、プレイヤーはより深く物語に没入できます。
    *   歴史的な戦いを再現したシナリオや、特定の目標（例：特定の都市を防衛する、敵の重要ユニットを撃破する）を持つシナリオも魅力的です。
*   **UI/UXの改善:**
    *   戦闘予測表示（攻撃前にダメージ予測や命中率を表示）
    *   セーブ・ロード機能の拡充（複数スロット、自動セーブ）
    *   キーボードショートカットの充実

#　その他見つけているバグ
* ゲーム勝利後のMODE SELECT画面の推移

```
This session is being continued from a previous           
  conversation that ran out of context. The summary         
  below covers the earlier portion of the conversation.     
                                                            
  Analysis:                                                 
  Let me analyze the conversation chronologically:          
                                                            
  1. First User Request:                                    
     - User asked to use "full-cycle-orchestrator" to       
  implement action panel modifications                      
     - Requirements:                                        
       - Current state: Action panel is positioned on       
  the left side of the screen                               
       - Modification: Place action panel to the left       
  side of the **unit**                                      
       - Flow: Click unit → Action panel appears next       
  to the unit                                               
       - Action panel composition: Show only actions        
  (unit actions and associated buttons)                     
       - Note: After action is completed, buttons           
  should be disabled (dimmed color) to prevent player       
  confusion                                                 
       - Note: Implementation should not affect other       
  operations (especially unit-specific operations)          
       - Location: Actual game play phase                   
                                                            
  2. First Implementation Result:                           
     - New file created: `ActionPopup.tsx` - Floating       
  action popup next to selected unit                        
     - Modified files:                                      
       - `BattleScreen.tsx` - Added useRef and              
  ResizeObserver for game-board-area size tracking,         
  integrated ActionPopup                                    
       - `SelectedUnitPanel.tsx` - Removed action           
  operation logic, simplified to basic info only            
       - `App.css` - Added `position: relative` to          
  `.game-board-area`                                        
       - `military-museum-theme.css` - Added                
  ActionPopup styles                                        
     - Documentation updated                                
                                                            
  3. Git push executed: feature branch pushed to remote     
                                                            
  4. Second User Request:                                   
     - User asked for movement flow modification            
     - Problem: Action panel blocks unit movement           
  destination                                               
     - Additional feature: Add "移動" (Move) button to      
  all units                                                 
     - Move button function: After clicking, show           
  movement range (green colored hexes)                      
     - Movement flow:                                       
       1. Click unit                                        
       2. Action panel displayed (with move button          
  added)                                                    
       3. Click move button                                 
       4. Action panel disappears, movement range           
  displayed                                                 
       5. Player clicks destination hex                     
       6. Action panel appears next to unit (move           
  button disabled)                                          
       7. Confirm with "Wait" or "Cancel" to return to      
  original position                                         
     - Exceptions: ESC key or clicking other areas          
  should hide action panel                                  
     - Plus: Increase action panel size by                  
  approximately +10                                         
                                                            
  5. Second Implementation Result:                          
     - Modified files:                                      
       - `uiStates.ts` - Added `movementMode: 'none' |      
  'selecting_destination'` state                            
       - `useGameLogic/index.ts` - Added movement mode      
  control logic, `startMovementAction`,                     
  `cancelMovementMode`                                      
       - `ActionPopup.tsx` - Added "移動" (Move)            
  button, increased POPUP_WIDTH from 140px to 150px         
       - `BattleScreen.tsx` - Added movement mode           
  handling, ESC key handling, ActionPopup visibility        
  control                                                   
       - `military-museum-theme.css` - Increased            
  padding and font sizes                                    
     - Documentation updated                                
     - Two commits created                                  
                                                            
  6. Git push executed again: feature branch pushed to      
  remote                                                    
                                                            
  Key technical details:                                    
  - Project: hex-strategy-ww2 (WW2 hex-based strategy       
  game)                                                     
  - Location:                                               
  `/Users/namiya_fuminori/hex-strategy-ww2/Commander/`      
  - Tech stack: React, TypeScript                           
  - Key components: ActionPopup, BattleScreen,              
  SelectedUnitPanel                                         
  - State management: Custom hooks (useGameLogic)           
  - Coordinate system: Axial coordinates for hexagonal      
  grid                                                      
                                                            
  Summary:                                                  
  1. Primary Request and Intent:                            
     - **First Request**: Implement action panel            
  modifications using full-cycle-orchestrator agent         
       - Move action panel from screen left to unit's       
  left side                                                 
       - Show action panel when unit is clicked,            
  positioned next to the unit                               
       - Display only action buttons (unit actions)         
       - Disable buttons after action is completed          
  (dimmed appearance)                                       
       - Ensure no impact on other unit-specific            
  operations                                                
       - Implementation location: Game play phase           
                                                            
     - **Second Request**: Movement flow modification       
       - Problem: Action panel blocks movement              
  destination visibility                                    
       - Add "移動" (Move) button to all units              
       - New flow: Unit click → Action panel → Move         
  button → Panel hides, movement range shows → Click        
  destination → Panel reappears (move button disabled)      
  → Confirm with Wait/Cancel                                
       - ESC key or clicking elsewhere should hide          
  action panel                                              
       - Increase action panel size by approximately        
  +10                                                       
                                                            
  2. Key Technical Concepts:                                
     - React components with TypeScript                     
     - Hex-based strategy game with axial coordinate        
  system                                                    
     - Dynamic UI positioning based on camera view (x,      
  y, zoom)                                                  
     - `axialToPixel` conversion for hex to screen          
  coordinates                                               
     - ResizeObserver for responsive game board sizing      
     - Custom hook pattern (`useGameLogic`) for game        
  state management                                          
     - UI state machine pattern (`movementMode: 'none'      
  | 'selecting_destination'`)                               
     - Conditional rendering based on movement mode         
     - Keyboard event handling (ESC key)                    
                                                            
  3. Files and Code Sections:                               
     -                                                      
  **`/Commander/src/components/game/ActionPopup.tsx`**      
  (NEW)                                                     
       - Floating action popup positioned to the left       
  of selected unit                                          
       - Calculates position dynamically using camera       
  view and hex coordinates                                  
       - Contains action buttons: 移動(Move),               
  待機(Wait), 待機解除, 占領(Capture), 搭載(Load),          
  降車(Unload), Engineer actions                            
       - `hasActed = moved && attacked` disables all        
  buttons when unit has acted                               
       - POPUP_WIDTH increased to 150px                     
       - Props include `onStartMovementAction` for          
  movement mode                                             
                                                            
     - **`/Commander/src/screens/BattleScreen.tsx`**        
  (MODIFIED)                                                
       - Uses `useRef` and `ResizeObserver` for             
  game-board-area size tracking                             
       - ActionPopup placed inside `game-board-area`        
  with camera and boardRect props                           
       - Added `movementMode`, `startMovementAction`,       
  `cancelMovementMode` from useGameLogic                    
       - ActionPopup hidden when `movementMode ===          
  'selecting_destination'`                                  
       - ESC key handler includes movement mode             
  cancellation                                              
       - Turn end calls `cancelMovementMode()`              
                                                            
     - **`/Commander/src/components/game/SelectedUnitPa     
  nel.tsx`** (MODIFIED)                                     
       - Removed all action operation logic and imports     
       - Simplified interface to: `className`,              
  `selectedUnit`, `units`, `onShowUnitDetails`              
       - Title changed to "ユニット情報" (Unit              
  Information)                                              
       - Now shows only basic info (name, HP, fuel,         
  transport info) and "詳細スペック" button                 
                                                            
     -                                                      
  **`/Commander/src/hooks/useGameLogic/uiStates.ts`**       
  (MODIFIED)                                                
       - Added `movementMode: 'none' |                      
  'selecting_destination'` UI state                         
       - Added to interface, useState declaration, and      
  return values                                             
                                                            
     - **`/Commander/src/hooks/useGameLogic/index.ts`**     
   (MODIFIED)                                               
       - `reachableTiles` calculation requires              
  `movementMode === 'selecting_destination'`                
       - `handleHexClick` resets `movementMode` on unit     
   click, move execution, and other clicks                  
       - Added `startMovementAction`,                       
  `cancelMovementMode`, `movementMode` to return values     
                                                            
     - **`/Commander/src/styles/App.css`** (MODIFIED)       
       - Added `position: relative` to                      
  `.game-board-area` for ActionPopup absolute               
  positioning                                               
                                                            
     -                                                      
  **`/Commander/src/styles/military-museum-theme.css`**     
   (MODIFIED)                                               
       - Added `.action-popup`, `.action-popup-header`,     
   `.action-popup-body`, `.action-popup-btn` styles         
       - CRT scanline effects applied                       
       - Size increases: header padding 6px→8px, font       
  0.9rem→1rem, body padding 8px→10px, button padding        
  6px→8px, button font 0.82rem→0.9rem                       
                                                            
     - **Documentation updated**:                           
       - `/HexStrategyDocs_ByObsidian/03_技術仕様/コン      
  ポーネント.md`                                            
       - `/HexStrategyDocs_ByObsidian/03_技術仕様/画面      
  コンポーネント.md`                                        
       - `/TODO/missing_elements.md`                        
                                                            
  4. Errors and fixes:                                      
     - No explicit errors reported during                   
  implementation                                            
     - Both implementations completed successfully via      
  full-cycle-orchestrator agent                             
                                                            
  5. Problem Solving:                                       
     - **Problem 1**: Action panel fixed to screen left     
   blocked game view                                        
       - Solution: Created ActionPopup component that       
  positions dynamically next to selected unit using hex     
   coordinates and camera view                              
                                                            
     - **Problem 2**: Action panel blocked movement         
  destination selection                                     
       - Solution: Added "移動" (Move) button with          
  movement mode state machine; panel hides during           
  destination selection, reappears after move               
                                                            
  6. All user messages:                                     
     - "full-cycle-orchestratorを使用して、以下のユーザ     
  ーの要件を実装してください。・要件→アクションパネルの     
  回収・現状：アクションパネルが画面左に位置している。      
  ・改修内容：***ユニット***の左側にアクションパネルを      
  配置してほしい・フロー：ユニットを押下した→アクション     
  パネルがユニットのすぐ隣に表示される。・アクションパ      
  ネルの構成：アクションのみを表示してほしい。つまりは      
  、ユニットの行動とそれに伴ったボタンのみ。・注意：プ      
  レイヤーが操作ができると勘違いしないように、行動が終      
  わったら、ボタンを押下できないようにしてほしい（今の      
  実装のようにボタンが薄い色の状態になっている）この実      
  装によって、他の操作（特にユニットごとの特性として持      
  っている操作に影響を及ぼさないこと）・実装画面の場所      
  ：実際のゲームプレイフェーズ"                             
                                                            
     - "full-cycle-orchestratorエージェント。さらに要望     
  。移動フローの改修。要望：アクションパネルがプレイヤ      
  ーのユニット移動先を邪魔している。追加機能ボタン：全      
  ユニットに「移動」ボタンを付与する。移動ボタンとは、      
  ボタン押下後に、ユニットの移動先（現在はヘックス上に      
  ユニットを押下すると出てくる薄い緑色の移動範囲の提示      
  のこと）が表示されるようにする移動のフロー：ユニット      
  を押下→アクションパネル表示（行動ボタンが追加されてい     
  る状態）→移動ボタンを押下→アクションパネルが消え、移      
  動先が表示→移動先ヘックスをプレイヤーが押下→アクショ      
  ンパネルが側に表示（この時「移動ボタンは押せない」）→     
  待機で確定・解除で元の位置に戻る。例外：escキーと他の     
  部分を押したらアクションパネルが消えるプラスアルファ      
  ：アクションパネルが非常に小さいので、気持ち+10位大き     
  くする"                                                   
                                                            
  7. Pending Tasks:                                         
     - None explicitly pending. Both requested              
  implementations have been completed and pushed to the     
   feature branch.                                          
                                                            
  8. Current Work:                                          
     The most recent work was completing the movement       
  flow modification. The implementation included:           
     - Adding "移動" (Move) button to ActionPopup           
     - Implementing `movementMode` state machine in         
  useGameLogic                                              
     - Hiding ActionPopup during destination selection      
     - Re-showing ActionPopup after movement with Move      
  button disabled                                           
     - ESC key and click-away handling to cancel            
  movement mode                                             
     - Increasing ActionPopup size by ~10 (padding,         
  font sizes)                                               
                                                            
     Git push was executed and completed successfully:      
     ```                                                    
     To https://github.com/programingbigger/hex-strateg     
  y-ww2.git                                                 
        d4feffd..9971204  feature -> feature                
     ```                                                    
                                                            
  9. Optional Next Step:                                    
     No pending tasks. Both implementations (action         
  panel positioning and movement flow modification)         
  have been completed and pushed to the feature branch.     
   The user should test the implementations in the game     
   and provide feedback if any adjustments are needed.      
                                                            
  If you need specific details from before compaction       
  (like exact code snippets, error messages, or content     
   you generated), read the full transcript at:             
  /Users/namiya_fuminori/.claude/projects/-Users-namiya     
  -fuminori-hex-strategy-ww2-Commander/c8084410-b225-4f     
  23-99cf-58f099738604.jsonl
```