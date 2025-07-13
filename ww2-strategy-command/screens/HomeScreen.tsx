
import React from 'react';
import { Screen } from '../types';

interface HomeScreenProps {
  onNavigate: (screen: Screen) => void;
}

const MenuItem: React.FC<{ onClick: () => void; children: React.ReactNode }> = ({ onClick, children }) => (
  <button
    onClick={onClick}
    className="w-full max-w-sm text-center text-2xl font-special bg-black/50 hover:bg-black/70 border-2 border-gray-500 hover:border-yellow-400 text-gray-200 hover:text-white py-4 transition-all duration-300 transform hover:scale-105"
  >
    {children}
  </button>
);

const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate }) => {
  return (
    <div 
        className="flex flex-col items-center justify-center h-screen bg-cover bg-center" 
        style={{ backgroundImage: `url('https://picsum.photos/seed/ww2/1920/1080')` }}
    >
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative z-10 flex flex-col items-center text-white">
            <h1 className="text-8xl font-special text-shadow mb-4" style={{textShadow: '2px 2px 8px rgba(0,0,0,0.7)'}}>Strategy Command</h1>
            <p className="text-xl font-sans text-gray-300 mb-12" style={{textShadow: '1px 1px 4px rgba(0,0,0,0.7)'}}>A World War II Simulation</p>

            <div className="space-y-5">
                <MenuItem onClick={() => onNavigate(Screen.Game)}>New Game</MenuItem>
                <MenuItem onClick={() => onNavigate(Screen.Story)}>Story Mode</MenuItem>
                <MenuItem onClick={() => onNavigate(Screen.Tutorial)}>Tutorial</MenuItem>
                <MenuItem onClick={() => onNavigate(Screen.Load)}>Load Game</MenuItem>
            </div>
        </div>
        <footer className="absolute bottom-4 text-gray-500 font-special text-sm">
            A React & Gemini API Demo
        </footer>
    </div>
  );
};

export default HomeScreen;
