
import React from 'react';
import { Screen } from '../types';

interface TutorialScreenProps {
  onNavigate: (screen: Screen) => void;
}

const TutorialScreen: React.FC<TutorialScreenProps> = ({ onNavigate }) => {
  return (
    <div className="p-8 md:p-16 text-gray-300 flex flex-col items-center justify-center h-screen">
      <div className="max-w-4xl w-full bg-gray-800 p-8 border-2 border-gray-600 rounded-lg shadow-2xl">
        <h1 className="text-5xl font-special text-yellow-400 mb-6 text-center">TUTORIAL</h1>
        <div className="font-sans text-lg space-y-4 leading-relaxed">
          <p>Welcome to Strategy Command, recruit! Here are the basics to lead your troops to victory.</p>
          <h2 className="text-2xl font-bold text-gray-100 pt-4">1. The Battlefield</h2>
          <p>The game is played on a hexagonal grid. Each tile has a terrain type: Plains, Forests, or Mountains, which may affect movement and combat in the future.</p>
          <h2 className="text-2xl font-bold text-gray-100 pt-4">2. Your Units</h2>
          <p>You command various units like Infantry and Tanks. Click on a unit that belongs to you during your turn to select it. Only units of the current player (Allies or Axis) can be moved.</p>
          <h2 className="text-2xl font-bold text-gray-100 pt-4">3. Movement</h2>
          <p>Once a unit is selected, reachable tiles will be highlighted in blue. Click on a highlighted tile to move your unit there. Each unit can only move once per turn.</p>
          <h2 className="text-2xl font-bold text-gray-100 pt-4">4. Ending Your Turn</h2>
          <p>When you have moved all your units, click the "END TURN" button to pass control to the enemy. This will reset your units' movement for your next turn.</p>
          <p>That's all for now. Good luck, Commander!</p>
        </div>
        <div className="text-center mt-12">
          <button
            onClick={() => onNavigate(Screen.Home)}
            className="text-center text-xl font-special bg-yellow-600 hover:bg-yellow-500 text-gray-900 py-3 px-8 transition-colors duration-200 rounded-md"
          >
            Back to Main Menu
          </button>
        </div>
      </div>
    </div>
  );
};

export default TutorialScreen;
