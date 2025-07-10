import React, { useState } from 'react';
import { HomeScreen } from './components/home/HomeScreen';
import { GameScreen } from './components/game/GameScreen';
import { useGameLogic } from './hooks/useGameLogic';

type Screen = 'home' | 'game';

const App: React.FC = () => {
  // 1. 表示する画面を管理するstate
  const [screen, setScreen] = useState<Screen>('home');
  
  // 2. ★★★最重要ポイント★★★
  // アプリケーションの起動と同時に、ここでゲームロジックを生成・初期化する。
  // これで、ゲームの状態は画面表示とは無関係に、常に存在し続ける。
  const gameLogic = useGameLogic();

  // 3. ゲーム開始ボタンが押されたら、表示を 'game' に切り替える関数
  const handleStartGame = () => {
    setScreen('game');
  };

  // 4. screenの状態に応じて、表示するコンポーネントを出し分ける
  if (screen === 'home') {
    // HOME画面を表示
    return <HomeScreen onStartGame={handleStartGame} />;
  } else {
    // ゲーム画面を表示。
    // Appが保持している完成済みのゲーム状態(gameLogic)を、そのままpropsとして渡す。
    return <GameScreen {...gameLogic} />;
  }
};

export default App;