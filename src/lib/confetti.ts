/**
 * Confetti celebration utilities
 */

import confetti from 'canvas-confetti';

// Standard celebration for completing a step
export function celebrateStepComplete() {
  confetti({
    particleCount: 50,
    spread: 60,
    origin: { y: 0.7 },
    colors: ['#29ABE2', '#8E2DE2', '#FFD700'],
  });
}

// Bigger celebration for completing a section
export function celebrateSectionComplete() {
  const duration = 2000;
  const end = Date.now() + duration;

  const frame = () => {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors: ['#29ABE2', '#8E2DE2', '#FFD700', '#00FF00'],
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors: ['#29ABE2', '#8E2DE2', '#FFD700', '#00FF00'],
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };

  frame();
}

// Epic celebration for completing entire roadmap
export function celebrateRoadmapComplete() {
  const duration = 4000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);

    // Confetti from both sides
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      colors: ['#FFD700', '#FFA500', '#FF6347', '#FFD700'],
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      colors: ['#29ABE2', '#8E2DE2', '#00FF00', '#FF69B4'],
    });
  }, 250);
}

// Milestone celebration (10%, 25%, 50%, 75% completion)
export function celebrateMilestone(milestone: number) {
  const intensity = milestone / 100; // Higher milestone = more confetti

  confetti({
    particleCount: Math.floor(30 + 70 * intensity),
    spread: 70 + 30 * intensity,
    origin: { y: 0.6 },
    colors: ['#29ABE2', '#8E2DE2', '#FFD700', '#00FF00', '#FF69B4'],
  });
}
