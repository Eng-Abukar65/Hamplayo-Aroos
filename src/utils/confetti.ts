import confetti from 'canvas-confetti';

export function triggerWeddingConfetti() {
  const count = 120;
  const defaults = {
    origin: { y: 0.65 },
    colors: ['#D4AF37', '#C5A059', '#4A1525', '#FED488', '#FFF8EB', '#E9C176'],
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  // Multi-stage celebratory sparkle fireworks
  fire(0.25, {
    spread: 26,
    startVelocity: 55,
  });
  fire(0.2, {
    spread: 60,
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });
}
