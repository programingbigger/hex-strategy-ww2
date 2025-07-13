
import React from 'react';
import { Screen } from '../types';

interface LoadScreenProps {
  onNavigate: (screen: Screen) => void;
}

const LoadScreen: React.FC<LoadScreenProps> = ({ onNavigate }) => {
  return (
    <div className="p-8 md:p-16 text-gray-300 flex flex-col items-center justify-center h-screen">
      <div className="max-w-4xl w-full bg-gray-800 p-8 border-2 border-gray-600 rounded-lg shadow-2xl">
        <h1 className="text-5xl font-special text-yellow-400 mb-6 text-center">LOAD GAME</h1>
        <div className="font-sans text-lg space-y-4 text-center">
            <p>The archives are currently being organized.</p>
            <p className="font-bold text-gray-100 pt-4">The ability to save and load games is a high-priority dispatch and will be implemented soon.</p>
            <p>For now, every battle is a final stand. Make it count.</p>
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

export default LoadScreen;
