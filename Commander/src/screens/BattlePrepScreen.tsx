import React, { useState, useEffect } from 'react';
import { GameScreen, GameState, Unit, BattlePrepState } from '../types';
import { getPlayerStartingUnits } from '../data/units';
import { getOperationPeriod, getMonthNames, getMonthlyStrategicContext, getAvailableYears, getAvailableMonths, getAvailableDays } from '../utils/operationDates';
import { getUnitNameById } from '../utils/unitNames';
import { getDeploymentLimit } from '../utils/deploymentLimits';

interface BattlePrepScreenProps {
  gameState: GameState;
  onNavigate: (screen: GameScreen) => void;
  onUpdateBattlePrep: (battlePrep: BattlePrepState, startingMonth?: number) => void;
  initialPage?: 1 | 2;
}

// =================================================================
// Page 1: Operation Preparation
// =================================================================
interface OperationPrepPageProps {
  gameState: GameState;
  selectedYear: number;
  selectedMonth: number;
  selectedDay: number;
  setSelectedYear: (year: number) => void;
  setSelectedMonth: (month: number) => void;
  setSelectedDay: (day: number) => void;
  onProceed: () => void;
  onBack: () => void;
  isTutorialMode?: boolean; // チュートリアルモードかどうか
  mapId?: string; // マップIDを渡して年月制限を適用
}

const OperationPrepPage: React.FC<OperationPrepPageProps> = ({
  gameState,
  selectedYear,
  selectedMonth,
  selectedDay,
  setSelectedYear,
  setSelectedMonth,
  setSelectedDay,
  onProceed,
  onBack,
  isTutorialMode = false,
  mapId
}) => {
  const operationPeriod = getOperationPeriod(selectedMonth, selectedYear, selectedDay);
  const strategicContext = getMonthlyStrategicContext(selectedMonth);
  const availableYears = getAvailableYears(mapId);
  const availableMonths = getAvailableMonths(selectedYear, mapId);
  const availableDays = getAvailableDays(selectedMonth, selectedYear);

  // チュートリアルモードでは年のみ固定
  const isYearFixed = isTutorialMode;

  return (
    <>
      <h1 className="screen-title" style={{ textAlign: 'center', marginBottom: '30px', fontSize: '32px', fontWeight: 'bold' }}>
        作戦準備
      </h1>
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Left Section: Map & Battle Info */}
        <div style={{ flex: '1', padding: '25px', background: 'rgba(52, 73, 94, 0.15)', borderRadius: '12px', border: '2px solid #3498db' }}>
          <h2 style={{ fontSize: '24px', marginBottom: '20px', textAlign: 'center', color: '#3498db' }}>作戦概要</h2>
          
          {gameState.selectedMap && (
            <div style={{ marginBottom: '25px' }}>
              <h3 style={{ fontSize: '20px', marginBottom: '15px' }}>{gameState.selectedMap.name}</h3>
              <p style={{ fontSize: '16px', lineHeight: '1.5', marginBottom: '20px' }}>
                {gameState.selectedMap.description}
              </p>
            </div>
          )}
          
          <div style={{ marginBottom: '25px' }}>
            <h4 style={{ fontSize: '18px', marginBottom: '15px', color: '#e74c3c' }}>戦闘情報</h4>
            <div style={{ fontSize: '16px', lineHeight: '1.8' }}>
              <p><strong>攻撃側:</strong> プレイヤー部隊 (Blue Team)</p>
              <p><strong>守備側:</strong> 敵軍部隊 (Red Team)</p>
            </div>
          </div>

          <div style={{ padding: '20px', background: 'rgba(39, 174, 96, 0.1)', borderRadius: '8px', border: '1px solid #27ae60' }}>
            <h4 style={{ fontSize: '18px', marginBottom: '15px', color: '#27ae60' }}>勝利条件</h4>
            <p style={{ fontSize: '16px', marginBottom: '10px' }}>• 敵軍ユニットを全滅させる</p>
            <p style={{ fontSize: '16px', marginBottom: '15px' }}>• 全ての都市を占領する</p>
            <h4 style={{ fontSize: '18px', marginBottom: '10px', color: '#e74c3c' }}>敗北条件</h4>
            <p style={{ fontSize: '16px' }}>• 自軍ユニットが全滅する</p>
            <p style={{ fontSize: '16px' }}>• 制限ターンを超える</p>
          </div>
        </div>
        
        {/* Right Section: Date */}
        <div style={{ flex: '1', padding: '25px', background: 'rgba(52, 73, 94, 0.1)', borderRadius: '12px' }}>
          <div style={{ marginBottom: '25px', padding: '20px', background: 'rgba(52, 152, 219, 0.1)', borderRadius: '8px', border: '1px solid #3498db' }}>
            <h4 style={{ fontSize: '18px', marginBottom: '15px', color: '#3498db' }}>📅 作戦開始日</h4>
            
            {/* Year Selection */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '16px', marginBottom: '8px', fontWeight: 'bold' }}>
                作戦開始年:
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                disabled={isYearFixed}
                style={{ width: '100%', padding: '12px', fontSize: '16px', borderRadius: '6px', border: '2px solid #3498db', background: isYearFixed ? 'rgba(200, 200, 200, 0.6)' : 'white', cursor: isYearFixed ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
              >
                {availableYears.map((year) => (
                  <option key={year} value={year}>{year}年</option>
                ))}
              </select>
            </div>

            {/* Month Selection */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '16px', marginBottom: '8px', fontWeight: 'bold' }}>
                作戦開始月:
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                style={{ width: '100%', padding: '12px', fontSize: '16px', borderRadius: '6px', border: '2px solid #3498db', background: 'white', cursor: 'pointer', fontWeight: 'bold' }}
              >
                {availableMonths.map((month) => (
                  <option key={month} value={month}>{getMonthNames()[month - 1]}</option>
                ))}
              </select>
            </div>

            {/* Day Selection */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '16px', marginBottom: '8px', fontWeight: 'bold' }}>
                作戦開始日:
              </label>
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(Number(e.target.value))}
                style={{ width: '100%', padding: '12px', fontSize: '16px', borderRadius: '6px', border: '2px solid #3498db', background: 'white', cursor: 'pointer', fontWeight: 'bold' }}
              >
                {availableDays.map((day) => (
                  <option key={day} value={day}>{day}日</option>
                ))}
              </select>
            </div>

            <div style={{ fontSize: '16px', lineHeight: '1.6', background: 'rgba(255, 255, 255, 0.3)', padding: '15px', borderRadius: '6px', border: '1px solid rgba(52, 152, 219, 0.3)' }}>
              <p><strong>📅 作戦期間:</strong> {operationPeriod.startDate} ～ {operationPeriod.endDate}</p>
              <p><strong>🌤️ 戦術環境:</strong> {strategicContext}</p>
            </div>
          </div>

          {/* Tactical Directives Section */}
          <div style={{ marginBottom: '20px', padding: '20px', background: 'rgba(231, 76, 60, 0.08)', borderRadius: '8px', border: '1px solid rgba(231, 76, 60, 0.4)' }}>
            <h4 style={{ fontSize: '18px', marginBottom: '12px', color: '#e74c3c' }}>📋 戦術指示</h4>
            <div style={{ fontSize: '15px', lineHeight: '1.7', color: '#ecf0f1' }}>
              <p style={{ marginBottom: '8px' }}>• 敵の主要拠点を早期に包囲し、補給を遮断する</p>
              <p style={{ marginBottom: '8px' }}>• 地形の優勢を最大限に活用し、防御陣地を構築する</p>
              <p style={{ marginBottom: '0' }}>• 機動力の高いユニットで偵察を先行させる</p>
            </div>
          </div>

          {/* Supply Line Check Section */}
          <div style={{ marginBottom: '20px', padding: '20px', background: 'rgba(243, 156, 18, 0.08)', borderRadius: '8px', border: '1px solid rgba(243, 156, 18, 0.4)' }}>
            <h4 style={{ fontSize: '18px', marginBottom: '12px', color: '#f39c12' }}>📦 補給線の確認</h4>
            <div style={{ fontSize: '15px', lineHeight: '1.7', color: '#ecf0f1' }}>
              <p style={{ marginBottom: '8px' }}>• 首都から補給ルートを確保し、前線への支援を維持する</p>
              <p style={{ marginBottom: '0' }}>• 補給ユニットの配置を戦術の中核とする</p>
            </div>
          </div>

          {/* Reconnaissance Report Section */}
          <div style={{ padding: '20px', background: 'rgba(52, 152, 219, 0.08)', borderRadius: '8px', border: '1px solid rgba(52, 152, 219, 0.4)' }}>
            <h4 style={{ fontSize: '18px', marginBottom: '12px', color: '#3498db' }}>🔍 偵察報告</h4>
            <div style={{ fontSize: '15px', lineHeight: '1.7', color: '#ecf0f1' }}>
              <p style={{ marginBottom: '8px' }}>• 敵軍の主力部隊の位置を把握している</p>
              <p style={{ marginBottom: '8px' }}>• 地形の特徴と障害物の配置が確認されている</p>
              <p style={{ marginBottom: '0' }}>• 天気予報により、戦術環境の変動が予想される</p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '30px', display: 'flex', gap: '25px', justifyContent: 'center' }}>
        <button className="menu-button" onClick={onBack} style={{ padding: '16px 32px', fontSize: '18px', fontWeight: 'bold', background: 'rgba(231, 76, 60, 0.3)', border: '3px solid #e74c3c', borderRadius: '10px', minWidth: '180px', cursor: 'pointer' }}>
          マップ選択へ戻る
        </button>
        <button className="menu-button" onClick={onProceed} style={{ padding: '16px 32px', fontSize: '18px', fontWeight: 'bold', background: 'rgba(39, 174, 96, 0.4)', border: '3px solid #27ae60', borderRadius: '10px', minWidth: '220px', cursor: 'pointer' }}>
          戦闘準備へ進む
        </button>
      </div>
    </>
  );
};

// =================================================================
// Page 2: Unit Selection
// =================================================================
interface UnitSelectionPageProps {
  availableUnits: Unit[];
  selectedUnits: Unit[];
  handleUnitSelect: (unit: Unit) => void;
  resetSelection: () => void;
  selectAllUnits: () => void;
  proceedToDeployment: () => void;
  onBack: () => void;
  deploymentLimit: number;
}

const UnitSelectionPage: React.FC<UnitSelectionPageProps> = ({
  availableUnits,
  selectedUnits,
  handleUnitSelect,
  resetSelection,
  selectAllUnits,
  proceedToDeployment,
  onBack,
  deploymentLimit
}) => {
  return (
    <>
      <h1 className="screen-title" style={{ textAlign: 'center', marginBottom: '30px', fontSize: '60px', fontWeight: 'bold' }}>
        戦闘準備
      </h1>
      
      <div style={{ display: 'flex', height: '80vh', gap: '30px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Left Section: Available Units */}
        <div style={{ flex: '1', padding: '25px', background: 'rgba(52, 73, 94, 0.1)', borderRadius: '12px' }}>
          <h2 style={{ fontSize: '40px', textAlign: 'center', marginBottom: '25px', color: '#f39c12' }}>配備ユニット一覧</h2>
          <p style={{ textAlign: 'center', fontSize: '25px', marginBottom: '25px', opacity: 0.8 }}>クリックしてユニットを選択/解除</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px', maxHeight: '60vh', overflowY: 'auto', paddingRight: '10px' }}>
            {availableUnits.map(unit => (
              <div 
                key={unit.id}
                onClick={() => handleUnitSelect(unit)}
                style={{
                  padding: '20px',
                  border: selectedUnits.find(u => u.id === unit.id) ? '3px solid #f39c12' : '2px solid rgba(243, 156, 18, 0.3)',
                  borderRadius: '12px',
                  background: selectedUnits.find(u => u.id === unit.id) ? 'rgba(243, 156, 18, 0.2)' : 'rgba(52, 73, 94, 0.2)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  transform: selectedUnits.find(u => u.id === unit.id) ? 'scale(1.02)' : 'scale(1)',
                  boxShadow: selectedUnits.find(u => u.id === unit.id) ? '0 6px 16px rgba(243, 156, 18, 0.4)' : '0 3px 8px rgba(0, 0, 0, 0.2)'
                }}
              >
                <div style={{ fontWeight: 'bold', fontSize: '20px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {getUnitNameById(unit.id)}
                  {selectedUnits.find(u => u.id === unit.id) && (
                    <span style={{ background: '#27ae60', color: 'white', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 'bold' }}>✓</span>
                  )}
                </div>
                <div style={{ fontSize: '16px', opacity: 0.9, marginBottom: '8px' }}>HP: {unit.hp} | ATK: {unit.attack} | DEF: {unit.defense} | MOV: {unit.movement}</div>
                <div style={{ fontSize: '14px', opacity: 0.7 }}>Range: {unit.attackRange.min}-{unit.attackRange.max} | Fuel: {unit.fuel}</div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Right Section: Selected Units */}
        <div style={{ flex: '1', padding: '25px', background: 'rgba(52, 73, 94, 0.15)', borderRadius: '12px', border: '2px solid #8e44ad' }}>
          <h2 style={{ fontSize: '40px', textAlign: 'center', marginBottom: '20px', color: '#8e44ad' }}>出撃ユニット</h2>
          <div style={{ marginBottom: '28px', textAlign: 'center', fontSize: '18px', fontWeight: 'bold' }}>選択済み: {selectedUnits.length}/{deploymentLimit}</div>
          <div style={{ background: 'rgba(142, 68, 173, 0.1)', border: '2px dashed #8e44ad', borderRadius: '12px', padding: '25px', minHeight: '50vh', maxHeight: '55vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {selectedUnits.length === 0 ? (
              <div style={{ textAlign: 'center', opacity: 0.8, fontSize: '40px', padding: '60px 20px' }}>
                <p style={{ marginBottom: '15px' }}>ユニットが選択されていません</p>
                <p style={{ fontSize: '38px', opacity: 0.6 }}>左のリストからユニットを選択してください</p>
              </div>
            ) : (
              selectedUnits.map(unit => (
                <div key={unit.id} style={{ background: 'rgba(142, 68, 173, 0.2)', border: '2px solid #8e44ad', borderRadius: '10px', padding: '18px', boxShadow: '0 4px 10px rgba(142, 68, 173, 0.3)' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '18px', marginBottom: '8px' }}>{getUnitNameById(unit.id)}</div>
                  <div style={{ fontSize: '16px', opacity: 0.9 }}>HP: {unit.hp} | ATK: {unit.attack} | DEF: {unit.defense}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div style={{ marginTop: '30px', display: 'flex', gap: '25px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button className="menu-button" onClick={onBack} style={{ padding: '16px 32px', fontSize: '34px', fontWeight: 'bold', background: 'rgba(52, 152, 219, 0.3)', border: '3px solid #3498db', borderRadius: '10px', minWidth: '180px', cursor: 'pointer' }}>
          作戦準備へ戻る
        </button>
        <button className="menu-button" onClick={resetSelection} style={{ padding: '16px 32px', fontSize: '34px', fontWeight: 'bold', background: 'rgba(241, 196, 15, 0.3)', border: '3px solid #f1c40f', borderRadius: '10px', minWidth: '180px', cursor: 'pointer' }}>
          ユニットの選択リセット
        </button>
        <button className="menu-button" onClick={selectAllUnits} style={{ padding: '16px 32px', fontSize: '34px', fontWeight: 'bold', background: 'rgba(155, 89, 182, 0.3)', border: '3px solid #9b59b6', borderRadius: '10px', minWidth: '180px', cursor: 'pointer' }}>
          ユニットを全選択
        </button>
        <button className="menu-button" onClick={proceedToDeployment} style={{ padding: '16px 32px', fontSize: '34px', fontWeight: 'bold', background: selectedUnits.length > 0 ? 'rgba(39, 174, 96, 0.4)' : 'rgba(127, 140, 141, 0.3)', border: selectedUnits.length > 0 ? '3px solid #27ae60' : '3px solid #7f8c8d', borderRadius: '10px', minWidth: '220px', cursor: selectedUnits.length > 0 ? 'pointer' : 'not-allowed', opacity: selectedUnits.length > 0 ? 1 : 0.6 }}>
          配置フェーズへ進む
        </button>
      </div>
    </>
  );
};

// =================================================================
// Main BattlePrepScreen Component
// =================================================================
// チュートリアルマップの開始年月を返す。該当マップでない場合は null を返す。
const getTutorialFixedDate = (mapId: string | undefined): { year: number; month: number; day: number } | null => {
  if (!mapId || !mapId.startsWith('tutorial_')) return null;
  // All tutorial maps: 1933年1月1日 (年固定、月は選択可能)
  return { year: 1933, month: 1, day: 1 };
};

const BattlePrepScreen: React.FC<BattlePrepScreenProps> = ({ gameState, onNavigate, onUpdateBattlePrep, initialPage = 1 }) => {
  const [page, setPage] = useState<1 | 2>(initialPage);
  const [availableUnits, setAvailableUnits] = useState<Unit[]>([]);
  const [isLoadingUnits, setIsLoadingUnits] = useState(false);
  const [selectedUnits, setSelectedUnits] = useState<Unit[]>(
    initialPage === 2 ? [] : (gameState.battlePrep?.selectedUnits || [])
  );

  // チュートリアルの場合は年を固定する
  const tutorialFixedDate = getTutorialFixedDate(gameState.selectedMap?.id);
  const isTutorialMode = tutorialFixedDate !== null;

  const [selectedYear, setSelectedYear] = useState<number>(tutorialFixedDate?.year ?? gameState.year ?? 1944);
  const [selectedMonth, setSelectedMonth] = useState<number>(tutorialFixedDate?.month ?? gameState.month ?? (new Date().getMonth() + 1));
  const [selectedDay, setSelectedDay] = useState<number>(tutorialFixedDate?.day ?? gameState.day ?? 1);
  const [deploymentLimit, setDeploymentLimit] = useState<number>(10); // Default to 10, will be updated based on map

  // Load available units asynchronously
  useEffect(() => {
    const loadUnits = async () => {
      if (gameState.selectedMap?.id) {
        setIsLoadingUnits(true);
        try {
          const units = await getPlayerStartingUnits(gameState.selectedMap.id);
          setAvailableUnits(units);
        } catch (error) {
          console.error('Failed to load available units:', error);
          setAvailableUnits([]);
        } finally {
          setIsLoadingUnits(false);
        }
      }
    };
    loadUnits();
  }, [gameState.selectedMap?.id]);

  // Load deployment limit asynchronously
  useEffect(() => {
    const loadDeploymentLimit = async () => {
      if (gameState.selectedMap?.id) {
        try {
          const limit = await getDeploymentLimit(gameState.selectedMap.id, 'Blue');
          setDeploymentLimit(limit);
        } catch (error) {
          console.error('Failed to load deployment limit:', error);
          setDeploymentLimit(10); // Default fallback
        }
      }
    };
    loadDeploymentLimit();
  }, [gameState.selectedMap?.id]);

  // Adjust selected month when year changes to ensure it's valid
  useEffect(() => {
    const availableMonths = getAvailableMonths(selectedYear, gameState.selectedMap?.id);
    if (!availableMonths.includes(selectedMonth)) {
      // Set to first available month if current month is not available
      setSelectedMonth(availableMonths[0]);
    }
  }, [selectedYear, selectedMonth, gameState.selectedMap?.id]);

  // Adjust selected day when month or year changes to ensure it's valid
  useEffect(() => {
    const availableDays = getAvailableDays(selectedMonth, selectedYear);
    if (selectedDay > availableDays.length) {
      setSelectedDay(availableDays.length); // Set to last day of month
    }
  }, [selectedMonth, selectedYear, selectedDay]);

  const handleUnitSelect = (unit: Unit) => {
    if (selectedUnits.find(u => u.id === unit.id)) {
      setSelectedUnits(prev => prev.filter(u => u.id !== unit.id));
    } else if (selectedUnits.length < deploymentLimit) {
      setSelectedUnits(prev => [...prev, unit]);
    } else {
      alert(`Maximum ${deploymentLimit} units can be selected!`);
    }
  };

  const resetSelection = () => {
    setSelectedUnits([]);
  };

  const selectAllUnits = () => {
    const unitsToSelect = availableUnits.slice(0, deploymentLimit);
    setSelectedUnits(unitsToSelect);
  };

  const proceedToDeployment = () => {
    if (selectedUnits.length === 0) {
      alert('Please select at least one unit before proceeding!');
      return;
    }
    
    const battlePrep: BattlePrepState = {
      selectedUnits,
      deployedUnits: gameState.battlePrep?.deployedUnits || new Map(),
      victoryConditions: [
        'Eliminate all enemy units',
        'OR capture all cities'
      ],
      startDate: {
        year: selectedYear,
        month: selectedMonth,
        day: selectedDay
      }
    };
    
    onUpdateBattlePrep(battlePrep, selectedMonth);
    onNavigate('deployment');
  };

  // Determine which screen to navigate back to based on the selected map.
  // previousScreen は deployment への往復で上書きされるため、信頼できない。
  // チュートリアルマップは mapId の接頭辞 'tutorial_' で正確に判定する。
  const getBackScreen = (): GameScreen => {
    if (gameState.selectedMap?.id?.startsWith('tutorial_')) {
      return 'tutorial-select';
    }
    return 'scenario-select';
  };

  return (
    <div className="screen battle-prep-screen" style={{ fontFamily: '"Yu Gothic", "Hiragino Sans", "Meiryo", sans-serif', fontSize: '18px', padding: '20px' }}>
      {page === 1 ? (
        <OperationPrepPage
          gameState={gameState}
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          selectedDay={selectedDay}
          setSelectedYear={setSelectedYear}
          setSelectedMonth={setSelectedMonth}
          setSelectedDay={setSelectedDay}
          onProceed={() => setPage(2)}
          onBack={() => onNavigate(getBackScreen())}
          isTutorialMode={isTutorialMode}
          mapId={gameState.selectedMap?.id}
        />
      ) : isLoadingUnits ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <h2>Loading available units...</h2>
        </div>
      ) : (
        <UnitSelectionPage
          availableUnits={availableUnits}
          selectedUnits={selectedUnits}
          handleUnitSelect={handleUnitSelect}
          resetSelection={resetSelection}
          selectAllUnits={selectAllUnits}
          proceedToDeployment={proceedToDeployment}
          onBack={() => setPage(1)}
          deploymentLimit={deploymentLimit}
        />
      )}
    </div>
  );
};

export default BattlePrepScreen;
