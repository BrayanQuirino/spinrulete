export const full_turn = 360;
export const max_options = 50;
export const max_label_length = 80;
export const spin_duration = 3900;
export const spin_easing = [0.12, 0.74, 0.11, 1];

export const palette = [
  { fill: '#f3ca78', ink: '#201809' },
  { fill: '#f39781', ink: '#2a1511' },
  { fill: '#b4a4ed', ink: '#191629' },
  { fill: '#9be5d0', ink: '#10241f' },
  { fill: '#86b4f0', ink: '#191629' },
  { fill: '#e7a2c4', ink: '#2e1823' },
];

export function normalize_angle(angle) {
  return ((angle % full_turn) + full_turn) % full_turn;
}

/**
 * Sector zero starts at twelve o'clock. Rotate until the winner's center
 * lands on the fixed pointer, using complete turns to animate forward.
 */
export function get_spin_rotation(rotation, count, winner_index) {
  const center = (winner_index + 0.5) * full_turn / count;
  const distance = normalize_angle(-center - rotation);
  return rotation + 5 * full_turn + distance;
}
