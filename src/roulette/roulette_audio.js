import { full_turn, spin_easing } from './wheel_math.js';

function bezier_axis(progress, first, second) {
  const remainder = 1 - progress;
  return 3 * remainder ** 2 * progress * first + 3 * remainder * progress ** 2 * second + progress ** 3;
}

/** Invert the CSS curve's distance axis to find when a sector reaches the pointer. */
export function get_tick_times(rotation, target, count, duration) {
  const [x1, y1, x2, y2] = spin_easing;
  const sector = full_turn / count;
  const first_boundary = Math.floor(rotation / sector) + 1;
  const times = [];

  for (let boundary = first_boundary; boundary * sector < target; boundary++) {
    const distance = (boundary * sector - rotation) / (target - rotation);
    let lower = 0;
    let upper = 1;
    for (let step = 0; step < 18; step++) {
      const middle = (lower + upper) / 2;
      if (bezier_axis(middle, y1, y2) < distance) lower = middle;
      else upper = middle;
    }

    const time = duration * bezier_axis((lower + upper) / 2, x1, x2);
    // Thin out very fast clicks so the opening of the spin stays intelligible.
    if (!times.length || time - times.at(-1) >= 35) times.push(time);
  }

  return times;
}

/** Synthesize a mechanical click and a short major arpeggio without media downloads. */
export function create_roulette_audio() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return null;

  try {
    const context = new AudioContext();
    const output = context.createGain();
    output.gain.value = 0.55;
    output.connect(context.destination);

    function play_note(frequency, start, length, volume, wave, end_frequency = frequency) {
      const tone = context.createOscillator();
      const envelope = context.createGain();
      tone.type = wave;
      tone.frequency.setValueAtTime(frequency, start);
      tone.frequency.exponentialRampToValueAtTime(end_frequency, start + length);
      envelope.gain.setValueAtTime(0.001, start);
      envelope.gain.linearRampToValueAtTime(volume, start + 0.004);
      envelope.gain.exponentialRampToValueAtTime(0.001, start + length);
      tone.connect(envelope);
      envelope.connect(output);
      tone.start(start);
      tone.stop(start + length);
    }

    return {
      unlock() {
        context.resume().catch(() => {});
      },
      set_muted(muted) {
        output.gain.setTargetAtTime(muted ? 0 : 0.55, context.currentTime, 0.012);
      },
      play_spin(times) {
        const start = context.currentTime + 0.015;
        times.forEach((time) => play_note(1300, start + time / 1000, 0.03, 0.12, 'triangle', 440));
      },
      play_win() {
        const start = context.currentTime + 0.02;
        [523.25, 659.25, 783.99, 1046.5].forEach((frequency, index) => {
          play_note(frequency, start + index * 0.09, 0.34, 0.15, 'sine');
        });
      },
      close() {
        context.close().catch(() => {});
      },
    };
  } catch {
    // Audio support is optional. The wheel still works if creation is blocked.
    return null;
  }
}
