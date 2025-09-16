import React, { useMemo } from 'react';
import { WeatherType } from '../../types';

interface RainEffectProps {
  weather: WeatherType;
}

const RainEffect: React.FC<RainEffectProps> = ({ weather }) => {
  // Memoize weather configuration for all weather types including Snow and Blizzard
  const weatherConfig = useMemo(() => {
    const isRain = weather === 'Rain';
    const isStorm = weather === 'Storm';
    const isSnow = weather === 'Snow';
    const isBlizzard = weather === 'Blizzard';

    // Configure settings based on weather type
    if (isSnow) {
      return {
        dropCount: 150,          // Fewer snowflakes than rain
        opacity: 0.9,            // Higher opacity for better visibility
        animationSpeed: '0.8s',  // Much slower than rain
        isRain: false,
        isStorm: false,
        isSnow: true,
        isBlizzard: false
      };
    }

    if (isBlizzard) {
      return {
        dropCount: 250,          // More particles for blizzard intensity
        opacity: 0.85,           // Slightly lower opacity for blizzard effect
        animationSpeed: '0.4s',  // Faster than snow but slower than storm
        isRain: false,
        isStorm: false,
        isSnow: false,
        isBlizzard: true
      };
    }

    // Original rain/storm settings
    return {
      dropCount: 200,          // Storm's working count for rain/storm
      opacity: 0.8,            // Storm's working opacity for rain/storm
      animationSpeed: '0.3s',  // Storm's working speed for rain/storm
      isRain,
      isStorm,
      isSnow: false,
      isBlizzard: false
    };
  }, [weather]);

  const { dropCount, opacity, isRain, isStorm, isSnow, isBlizzard } = weatherConfig;

  // Memoize weather particles (rain drops, snowflakes, etc.)
  const weatherParticles = useMemo(() =>
    Array.from({ length: dropCount }, (_, i) => {
      const left = Math.random() * 100;
      const animationDelay = Math.random() * 2;

      if (isSnow || isBlizzard) {
        // Snow/Blizzard particles configuration
        const size = Math.random() * 4 + 2; // 2-6px for snowflakes
        const duration = isSnow
          ? 2.5 + Math.random() * 1.5  // 2.5-4s for gentle snow
          : 1.0 + Math.random() * 1.0; // 1-2s for blizzard intensity

        return {
          id: i,
          left,
          animationDelay,
          size,
          duration: `${duration}s`,
          // Add slight horizontal drift for snowflakes
          horizontalDrift: isSnow
            ? (Math.random() - 0.5) * 10  // Small drift for snow
            : (Math.random() - 0.5) * 30  // More drift for blizzard
        };
      } else {
        // Original rain/storm drop configuration
        const height = Math.random() * 15 + 15;
        const duration = 0.3 + Math.random() * 0.2;

        return {
          id: i,
          left,
          animationDelay,
          height,
          duration: `${duration}s`
        };
      }
    }), [dropCount, isSnow, isBlizzard]
  );

  // Check if weather animation should be displayed
  if (!['Rain', 'Storm', 'Snow', 'Blizzard'].includes(weather)) {
    return null;
  }

  // Debug: Add a temporary indicator to verify the component is rendering
  console.log(`WeatherEffect rendering for weather: ${weather} with ${dropCount} particles`);

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
            ? 'rgba(25, 25, 112, 0.2)'        // Dark blue for storm
            : isRain
            ? 'rgba(176, 196, 222, 0.08)'     // Light blue for rain
            : isBlizzard
            ? 'rgba(200, 220, 255, 0.15)'     // Icy blue-white for blizzard
            : isSnow
            ? 'rgba(240, 248, 255, 0.1)'      // Very light blue-white for snow
            : 'rgba(255, 255, 255, 0)',
          pointerEvents: 'none'
        }}
      />

      {/* Weather particles - different rendering for different weather types */}
      {weatherParticles.map((particle) => (
        <div
          key={particle.id}
          className={isSnow || isBlizzard ? "snow-flake" : "rain-drop"}
          style={{
            position: 'absolute',
            left: `${particle.left}%`,
            ...(isSnow || isBlizzard ? {
              // Snowflake styling
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              background: isBlizzard
                ? `radial-gradient(circle, rgba(255, 255, 255, ${opacity}), rgba(230, 240, 255, ${opacity * 0.7}))`
                : `radial-gradient(circle, rgba(255, 255, 255, ${opacity}), rgba(240, 248, 255, ${opacity * 0.8}))`,
              borderRadius: '50%',
              animation: `snowFall ${particle.duration} infinite linear`,
              animationDelay: `${particle.animationDelay}s`,
              transform: 'rotate(0deg)', // No rotation for snowflakes
              '--horizontal-drift': `${particle.horizontalDrift}px`
            } : {
              // Original rain drop styling
              width: '3px',
              height: `${particle.height}px`,
              background: isStorm
                ? `linear-gradient(to bottom, rgba(255, 255, 255, 0.2), rgba(135, 206, 235, ${opacity}))`
                : `linear-gradient(to bottom, rgba(255, 255, 255, 0.05), rgba(173, 216, 230, ${opacity}))`,
              borderRadius: '1px',
              animation: `rainDrop ${particle.duration} infinite linear`,
              animationDelay: `${particle.animationDelay}s`,
              transform: 'rotate(10deg)'
            })
          }}
        />
      ))}

      {/* Lightning effect for storm only (not for blizzard) */}
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

      {/* CSS keyframes for weather animations */}
      <style>
        {`
          .rain-drop {
            position: absolute;
            bottom: 100%;
            border-radius: 1px;
            animation: rainDrop linear infinite;
            will-change: transform, opacity;
          }

          .snow-flake {
            position: absolute;
            bottom: 100%;
            border-radius: 50%;
            animation: snowFall linear infinite;
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

          @keyframes snowFall {
            0% {
              transform: translateY(-100vh) translateX(0px);
              opacity: 0;
            }
            10% {
              opacity: ${opacity};
            }
            90% {
              opacity: ${opacity};
            }
            100% {
              transform: translateY(100vh) translateX(var(--horizontal-drift, 0px));
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