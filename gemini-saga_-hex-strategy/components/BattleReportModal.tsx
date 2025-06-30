
import React from 'react';
import type { BattleReport } from '../types';

interface BattleReportModalProps {
  report: BattleReport;
  onClose: () => void;
}

export const BattleReportModal: React.FC<BattleReportModalProps> = ({ report, onClose }) => {
  const { attacker, defender, damage, report: story } = report;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-40">
      <div className="bg-gray-800 border-2 border-yellow-500 rounded-lg shadow-2xl p-6 max-w-2xl w-full mx-4 animate-fade-in-up">
        <h2 className="text-3xl font-bold text-center mb-4 text-yellow-400">Battle Report</h2>
        
        <div className="flex justify-around items-center mb-6">
          <div className="text-center">
            <h3 className={`text-xl font-semibold text-blue-400`}>{attacker.team} {attacker.type}</h3>
            <p>Attacker</p>
          </div>
          <div className="text-4xl font-extrabold text-red-500 animate-pulse">
            - {damage} HP
          </div>
          <div className="text-center">
            <h3 className={`text-xl font-semibold text-red-400`}>{defender.team} {defender.type}</h3>
            <p>Defender</p>
          </div>
        </div>

        <div className="bg-gray-900 p-4 rounded-md border border-gray-700">
          <p className="text-lg leading-relaxed text-gray-300">{story}</p>
        </div>
        
        <div className="mt-6 text-center">
          <button
            onClick={onClose}
            className="bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-2 px-8 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
          >
            Continue
          </button>
        </div>
      </div>
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};
