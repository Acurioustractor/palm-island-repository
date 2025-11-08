'use client';

import { useEffect, useState } from 'react';

interface ConfettiProps {
  trigger: boolean;
  duration?: number;
  colors?: string[];
}

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  color: string;
  delay: number;
}

export default function Confetti({
  trigger,
  duration = 3000,
  colors = ['#ff6b35', '#f7931e', '#fdc830', '#4ecdc4', '#45b7d1', '#96ceb4']
}: ConfettiProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (trigger && !isActive) {
      // Generate confetti pieces
      const newPieces: ConfettiPiece[] = [];
      const pieceCount = 50;

      for (let i = 0; i < pieceCount; i++) {
        newPieces.push({
          id: i,
          x: Math.random() * 100, // Percentage from left
          y: -10, // Start above viewport
          rotation: Math.random() * 360,
          scale: 0.5 + Math.random() * 0.5,
          color: colors[Math.floor(Math.random() * colors.length)],
          delay: Math.random() * 200
        });
      }

      setPieces(newPieces);
      setIsActive(true);

      // Clear confetti after duration
      setTimeout(() => {
        setIsActive(false);
        setPieces([]);
      }, duration);
    }
  }, [trigger, isActive, duration, colors]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="confetti-piece absolute"
          style={{
            left: `${piece.x}%`,
            top: `${piece.y}%`,
            backgroundColor: piece.color,
            transform: `rotate(${piece.rotation}deg) scale(${piece.scale})`,
            animation: `confetti-fall ${2 + Math.random() * 2}s ease-in forwards`,
            animationDelay: `${piece.delay}ms`,
            width: '10px',
            height: '10px',
            borderRadius: Math.random() > 0.5 ? '50%' : '2px'
          }}
        />
      ))}
    </div>
  );
}
