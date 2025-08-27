import React, { useMemo } from 'react';
import { WeatherType } from '../../types';

interface RainEffectProps {
  weather: WeatherType;
}

const RainEffect: React.FC<RainEffectProps> = ({ weather }) => {
  // Memoize weather configuration - using Storm settings for all weather types
  const weatherConfig = useMemo(() => {
    const isRain = weather === 'Rain';
    const isHeavyRain = weather === 'HeavyRain';
    const isStorm = weather === 'Storm';
    
    // Simplified: Use Storm's working animation settings for all weather types
    return {
      dropCount: 200,          // Storm's working count for all
      opacity: 0.8,            // Storm's working opacity for all  
      animationSpeed: '0.3s',  // Storm's working speed for all
      isRain,
      isHeavyRain,
      isStorm
    };
  }, [weather]);

  const { dropCount, opacity, isRain, isHeavyRain, isStorm } = weatherConfig;

  // Memoize rain drops to prevent recreation on every render
  const rainDrops = useMemo(() => 
    Array.from({ length: dropCount }, (_, i) => {
      // Enhanced randomization - using Storm's working settings for all
      const left = Math.random() * 100;
      const animationDelay = Math.random() * 2;
      const height = Math.random() * 15 + 15;  // Storm's working height for all
      const duration = 0.3 + Math.random() * 0.2;  // Storm's working duration for all
      
      return {
        id: i,
        left,
        animationDelay,
        height,
        duration: `${duration}s`
      };
    }), [dropCount]
  );

  // Check if weather animation should be displayed
  if (!['Rain', 'HeavyRain', 'Storm'].includes(weather)) {
    return null;
  }

  // Debug: Add a temporary indicator to verify the component is rendering
  console.log(`RainEffect rendering for weather: ${weather} with ${dropCount} drops`);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 999, // Just below header (1000) to ensure visibility
        overflow: 'hidden'
      }}
    >
      {/* Atmospheric overlay for enhanced weather feeling */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: isStorm 
            ? 'rgba(25, 25, 112, 0.2)' 
            : isHeavyRain 
            ? 'rgba(105, 105, 105, 0.15)' 
            : isRain
            ? 'rgba(176, 196, 222, 0.08)'
            : 'rgba(255, 255, 255, 0)',
          pointerEvents: 'none'
        }}
      />
      
      {/* Rain drops - using Storm's working settings for all weather types */}
      {rainDrops.map((drop) => (
        <div
          key={drop.id}
          className="rain-drop"
          style={{
            position: 'absolute',
            left: `${drop.left}%`,
            width: '3px',  // Storm's working width for all
            height: `${drop.height}px`,
            background: isStorm 
              ? `linear-gradient(to bottom, rgba(255, 255, 255, 0.2), rgba(135, 206, 235, ${opacity}))` 
              : isHeavyRain
              ? `linear-gradient(to bottom, rgba(255, 255, 255, 0.1), rgba(169, 169, 169, ${opacity}))`
              : isRain
              ? `linear-gradient(to bottom, rgba(255, 255, 255, 0.05), rgba(173, 216, 230, ${opacity}))`
              : `linear-gradient(to bottom, rgba(255, 255, 255, 0.05), rgba(173, 216, 230, 0.2))`,
            borderRadius: '1px',
            animation: `rainDrop ${drop.duration} infinite linear`,
            animationDelay: `${drop.animationDelay}s`,
            transform: 'rotate(10deg)'
          }}
        />
      ))}
      
      {/* Lightning effect for storm */}
      {isStorm && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(255, 255, 255, 0.1)',
            animation: 'lightning 3s infinite',
            animationDelay: `${Math.random() * 5}s`
          }}
        />
      )}
      
      {/* CSS keyframes for weather animations - optimized based on investigation */}
      <style>
        {`
          .rain-drop {
            position: absolute;
            bottom: 100%;
            border-radius: 1px;
            animation: rainDrop linear infinite;
            will-change: transform, opacity;
          }
          
          @keyframes rainDrop {
            0% {
              transform: translateY(-100vh) rotate(10deg);
              opacity: 0;
            }
            10% {
              opacity: ${opacity};
            }
            90% {
              opacity: ${opacity};
            }
            100% {
              transform: translateY(100vh) rotate(10deg);
              opacity: 0;
            }
          }
          
          @keyframes lightning {
            0%, 88%, 92%, 96%, 100% {
              background: rgba(255, 255, 255, 0);
            }
            90%, 94% {
              background: rgba(255, 255, 255, 0.3);
            }
            91%, 95% {
              background: rgba(255, 255, 255, 0.6);
            }
            93% {
              background: rgba(255, 255, 255, 0.8);
            }
          }
        `}
      </style>
    </div>
  );
};

export default RainEffect;