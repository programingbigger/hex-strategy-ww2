import React, { useState, useEffect, useCallback } from 'react';
import { GameScreen } from '../types';

interface TutorialIntroductionScreenProps {
  onNavigate: (screen: GameScreen) => void;
}

const TutorialIntroductionScreen: React.FC<TutorialIntroductionScreenProps> = ({ onNavigate }) => {
  const introText = `ようこそ、我がA国軍司令官訓練養成所へ。

  君も知っての通り、隣国B国との関係は悪化の一途を辿っている。
  現在はかろうじて一枚の条約によって平和が保たれているが、その均衡はい
  つ崩れてもおかしくない、極めて脆弱なものだ。

  両国は水面下で着々と軍備を増強しており、来るべき日に備えている。
  この危機的状況に対応するため、君には我が軍の司令官として、部隊を率い
  るためのあらゆる知識と戦術をここで学んでもらう。

  この訓練が、A国の未来を、そして我々が守るべき平和の礎となる。
  健闘を祈る。`;

  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);
  const [isSkipped, setIsSkipped] = useState(false);

  const typewriterSpeed = 50; // milliseconds per character

  // Typewriter animation effect
  useEffect(() => {
    if (isSkipped || isAnimationComplete) return;

    if (currentIndex < introText.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + introText[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, typewriterSpeed);

      // Fix memory leak: cleanup timeout on unmount
      return () => clearTimeout(timer);
    } else {
      setIsAnimationComplete(true);
    }
  }, [currentIndex, introText, isSkipped, isAnimationComplete]);

  // Skip animation on click
  const handleSkipAnimation = useCallback(() => {
    if (!isAnimationComplete && !isSkipped) {
      setIsSkipped(true);
      setDisplayedText(introText);
      setIsAnimationComplete(true);
    }
  }, [isAnimationComplete, isSkipped, introText]);

  // Handle navigation to tutorial selection
  const handleProceed = useCallback(() => {
    onNavigate('tutorial-select');
  }, [onNavigate]);

  // Keyboard accessibility
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        if (isAnimationComplete) {
          handleProceed();
        } else {
          handleSkipAnimation();
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isAnimationComplete, handleProceed, handleSkipAnimation]);

  return (
    <div
      className="tutorial-intro-screen"
      onClick={handleSkipAnimation}
      role="button"
      tabIndex={0}
      aria-label="クリックまたはEnter/Spaceキーで文章をスキップ"
    >
      <div className="tutorial-intro-content">
        <div className="tutorial-intro-text" aria-live="polite" aria-label="チュートリアル案内文">
          <pre>{displayedText}</pre>
          {!isAnimationComplete && (
            <span className="cursor-blink" aria-hidden="true">|</span>
          )}
        </div>

        {isAnimationComplete && (
          <div className="tutorial-intro-actions">
            <button
              className="tutorial-next-button military-button"
              onClick={(e) => {
                e.stopPropagation();
                handleProceed();
              }}
              aria-label="チュートリアル選択画面に進む"
            >
              次へ
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TutorialIntroductionScreen;