import React from 'react';

// HomeScreenコンポーネントに渡すprops（プロパティ）の型を定義します。
// onStartGameという名前の、引数なし・戻り値なしの関数を受け取ります。
interface HomeScreenProps {
  onStartGame: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onStartGame }) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-gray-200">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4 text-white drop-shadow-lg">
          Gemini Saga: Hex Strategy
        </h1>
        <p className="text-xl mb-8 text-gray-400">
          - A World Divided by War -
        </p>
        <button
          onClick={onStartGame} // ボタンがクリックされたら、propsで受け取ったonStartGame関数を実行します。
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg text-2xl transition duration-300 ease-in-out transform hover:scale-105 shadow-xl"
        >
          ゲームプレイ
        </button>
      </div>
    </div>
  );
};