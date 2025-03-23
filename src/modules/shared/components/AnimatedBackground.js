// src/modules/shared/components/AnimatedBackground.js

import React, { useMemo } from 'react';

/**
 * Animated Background component with floating particles
 *
 * @param {Object} props
 * @param {number} [props.particleCount=15] - Number of floating particles
 * @param {boolean} [props.includeGradientOrbs=true] - Whether to include the gradient orbs
 * @param {string} [props.className] - Additional class names for the container
 */
const AnimatedBackground = ({
  particleCount = 15,
  includeGradientOrbs = true,
  className = ""
}) => {
  // Generate random particles with memoization to avoid recalculation on re-renders
  const particles = useMemo(() => {
    return [...Array(particleCount)].map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      animationDuration: `${5 + Math.random() * 10}s`,
      animationDelay: `${Math.random() * 5}s`
    }));
  }, [particleCount]);

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {includeGradientOrbs && (
        <>
          <div className="absolute w-96 h-96 rounded-full bg-blue-600/5 -top-20 -left-20 animate-pulse"></div>
          <div className="absolute w-64 h-64 rounded-full bg-purple-600/5 bottom-10 right-10 animate-pulse" style={{ animationDelay: '1.5s' }}></div>
          <div className="absolute w-32 h-32 rounded-full bg-cyan-600/5 top-1/3 right-1/4 animate-pulse" style={{ animationDelay: '2.8s' }}></div>
        </>
      )}

      {/* Floating particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-1 h-1 bg-blue-500 rounded-full opacity-20"
          style={{
            top: particle.top,
            left: particle.left,
            animation: `float ${particle.animationDuration} linear infinite`,
            animationDelay: particle.animationDelay
          }}
        ></div>
      ))}
    </div>
  );
};

export default AnimatedBackground;