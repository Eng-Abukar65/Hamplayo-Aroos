// Web Audio API Synthesizer for Wedding Chimes and Ambient Lute Melody

let audioCtx: AudioContext | null = null;
let playlistInterval: number | null = null;
let isPlayingPlaylist = false;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Play celebratory gentle harp/bell chime when a message is posted
export function playCelebratoryChime() {
  try {
    const ctx = getAudioContext();
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 arpeggio
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);

      gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + idx * 0.08 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.08 + 0.9);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + idx * 0.08);
      osc.stop(ctx.currentTime + idx * 0.08 + 0.95);
    });
  } catch (e) {
    console.debug('Web Audio not allowed without user gesture yet', e);
  }
}

// Gentle ambient wedding harp / lute melody notes
const weddingMelody = [
  { freq: 440.00, dur: 0.6 }, // A4
  { freq: 493.88, dur: 0.4 }, // B4
  { freq: 554.37, dur: 0.8 }, // C#5
  { freq: 659.25, dur: 0.8 }, // E5
  { freq: 554.37, dur: 0.6 }, // C#5
  { freq: 440.00, dur: 0.8 }, // A4
  { freq: 392.00, dur: 0.6 }, // G4
  { freq: 440.00, dur: 1.0 }, // A4
];

export function toggleWeddingPlaylist(onStateChange?: (playing: boolean) => void): boolean {
  try {
    const ctx = getAudioContext();

    if (isPlayingPlaylist) {
      if (playlistInterval) clearInterval(playlistInterval);
      playlistInterval = null;
      isPlayingPlaylist = false;
      onStateChange?.(false);
      return false;
    }

    isPlayingPlaylist = true;
    onStateChange?.(true);

    let step = 0;
    const playNextNote = () => {
      if (!isPlayingPlaylist) return;
      const note = weddingMelody[step % weddingMelody.length];
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(note.freq, ctx.currentTime);

      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + note.dur * 1.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + note.dur * 1.6);

      step++;
    };

    playNextNote();
    playlistInterval = window.setInterval(playNextNote, 900);
    return true;
  } catch (e) {
    console.debug('Audio error', e);
    isPlayingPlaylist = false;
    onStateChange?.(false);
    return false;
  }
}
