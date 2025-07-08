import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Leaf, Recycle, Zap, Droplet, Sun, Cloud, Wind, Sprout } from 'lucide-react';

const floatingObjects = [
  // Eco Icons (larger, more prominent)
  { id: 'recycle', Icon: Recycle, color: 'text-green-400', size: 'w-6 h-6', glow: 'glow-green' },
  { id: 'leaf', Icon: Leaf, color: 'text-emerald-400', size: 'w-6 h-6', glow: 'glow-emerald' },
  { id: 'zap', Icon: Zap, color: 'text-yellow-400', size: 'w-5 h-5', glow: 'glow-yellow' },
  { id: 'droplet', Icon: Droplet, color: 'text-blue-400', size: 'w-5 h-5', glow: 'glow-blue' },
  { id: 'sun', Icon: Sun, color: 'text-amber-400', size: 'w-5 h-5', glow: 'glow-amber' },
  { id: 'sprout', Icon: Sprout, color: 'text-lime-400', size: 'w-5 h-5', glow: 'glow-lime' },
  
  // Nature Elements (smaller, more numerous)
  ...Array.from({ length: 15 }).map((_, i) => ({
    id: `particle-${i}`,
    Icon: [Leaf, Recycle, Zap, Droplet, Cloud, Wind][Math.floor(Math.random() * 6)],
    color: ['green', 'emerald', 'lime', 'blue', 'cyan', 'teal'][Math.floor(Math.random() * 6)] + '-400',
    size: ['w-3 h-3', 'w-4 h-4'][Math.floor(Math.random() * 2)],
    glow: `glow-${['green', 'blue', 'teal'][Math.floor(Math.random() * 3)]}`
  }))
];

export function Background() {
  const [initialPositions] = useState(() => {
    // Generate and store initial positions only once
    return floatingObjects.map(obj => ({
      id: obj.id,
      x: `${Math.random() * 100}%`,
      y: `${Math.random() * 100}%`,
      duration: 8 + Math.random() * 10,
      delay: Math.random() * 5,
      rotate: Math.random() * 60 - 30
    }));
  });

  return (
    <div className="fixed inset-0 -z-10 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
      {floatingObjects.map((obj) => {
        const position = initialPositions.find(p => p.id === obj.id) || {
          x: '50%',
          y: '50%',
          duration: 8,
          delay: 0,
          rotate: 0
        };

        return (
          <motion.div
            key={obj.id}
            className={`absolute ${obj.size} flex items-center justify-center ${obj.glow}`}
            initial={{
              left: position.x,
              top: position.y,
              opacity: 0.7
            }}
            animate={{
              y: [0, 50, 0],
              opacity: [0.7, 1, 0.7],
              rotate: [0, position.rotate, 0]
            }}
            transition={{
              duration: position.duration,
              delay: position.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <obj.Icon className={`${obj.size} ${obj.color}`} />
          </motion.div>
        );
      })}
    </div>
  );
}