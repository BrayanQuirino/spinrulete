export const full_turn = 360;
export const max_options = 50;
export const max_label_length = 80;
export const spin_duration = 3900;

export const palette = [
  { fill: '#ffd078', ink: '#492c14' },
  { fill: '#eb754f', ink: '#321a13' },
  { fill: '#c9dc9b', ink: '#233210' },
  { fill: '#794d9d', ink: '#ffffff' },
  { fill: '#f2a2ab', ink: '#441c30' },
  { fill: '#315d49', ink: '#ffffff' },
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
