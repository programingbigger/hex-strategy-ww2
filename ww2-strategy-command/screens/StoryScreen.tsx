
import React from 'react';
import { Screen } from '../types';

interface StoryScreenProps {
  onNavigate: (screen: Screen) => void;
}

const StoryScreen: React.FC<StoryScreenProps> = ({ onNavigate }) => {
  return (
    <div className="p-8 md:p-16 text-gray-300 flex flex-col items-center justify-center h-screen">
      <div className="max-w-4xl w-full bg-gray-800 p-8 border-2 border-gray-600 rounded-lg shadow-2xl">
        <h1 className="text-5xl font-special text-yellow-400 mb-6 text-center">STORY MODE</h1>
        <div className="font-sans text-lg space-y-4 leading-relaxed text-center">
            <p className="text-2xl italic">"The year is 1942. The world is at war."</p>
            <p>A shadow has fallen over Europe, and the echoes of battle resound across continents. As a commander, you will be tested on the unforgiving front lines.</p>
            <p>From the frozen steppes of the East to the shores of the Pacific, your strategic genius will determine the fate of nations.</p>
            <p className="font-bold text-gray-100 pt-4">The story campaign is currently under development.</p>
            <p>New missions and narratives will be available in a future update.</p>
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

export default StoryScreen;
